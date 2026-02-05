/**
 * @file apps/api/prisma/seed.ts
 * @description 데이터베이스 시드 스크립트
 *
 * 실행: npx prisma db seed
 *
 * 생성되는 초기 데이터:
 * - 조직 구조 (회사, 부서, 팀)
 * - 역할 및 권한
 * - 관리자 계정 (admin@fms.com / admin123)
 * - 테스트 사용자
 */

import { PrismaClient, OrganizationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 조직 생성
  console.log('  Creating organizations...');
  const company = await prisma.organization.upsert({
    where: { code: 'FMS-CORP' },
    update: {},
    create: {
      code: 'FMS-CORP',
      name: 'FMS Corporation',
      type: OrganizationType.COMPANY,
    },
  });

  const productionDept = await prisma.organization.upsert({
    where: { code: 'PROD-DEPT' },
    update: {},
    create: {
      code: 'PROD-DEPT',
      name: '생산부',
      type: OrganizationType.DEPARTMENT,
      parentId: company.id,
    },
  });

  const maintenanceDept = await prisma.organization.upsert({
    where: { code: 'MAINT-DEPT' },
    update: {},
    create: {
      code: 'MAINT-DEPT',
      name: '설비관리부',
      type: OrganizationType.DEPARTMENT,
      parentId: company.id,
    },
  });

  const maintenanceTeam = await prisma.organization.upsert({
    where: { code: 'MAINT-TEAM' },
    update: {},
    create: {
      code: 'MAINT-TEAM',
      name: '설비보전팀',
      type: OrganizationType.TEAM,
      parentId: maintenanceDept.id,
    },
  });

  // 2. 역할 생성
  console.log('  Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '시스템 관리자',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: '관리자',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: '일반 사용자',
    },
  });

  // 3. 권한 생성
  console.log('  Creating permissions...');
  const resources = ['equipment', 'maintenance', 'inspection', 'material', 'user', 'organization'];
  const actions = ['create', 'read', 'update', 'delete'];

  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { name: `${resource}:${action}` },
        update: {},
        create: {
          name: `${resource}:${action}`,
          resource,
          action,
          description: `${action} ${resource}`,
        },
      });
    }
  }

  // 4. 관리자 역할에 모든 권한 할당
  console.log('  Assigning permissions to admin role...');
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 5. 사용자 생성
  console.log('  Creating users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fms.com' },
    update: {},
    create: {
      email: 'admin@fms.com',
      password: hashedPassword,
      name: '시스템 관리자',
      employeeNumber: 'EMP001',
      organizationId: company.id,
      position: '관리자',
    },
  });

  // 관리자 역할 할당
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 테스트 사용자 생성
  const testPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@fms.com' },
    update: {},
    create: {
      email: 'test@fms.com',
      password: testPassword,
      name: '테스트 사용자',
      employeeNumber: 'EMP002',
      organizationId: maintenanceTeam.id,
      position: '사원',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });

  // 6. 설비 카테고리 생성
  console.log('  Creating equipment categories...');
  const categories = [
    { code: 'PROD-EQ', name: '생산설비' },
    { code: 'UTIL-EQ', name: '유틸리티 설비' },
    { code: 'PACK-EQ', name: '포장설비' },
  ];

  for (const cat of categories) {
    await prisma.equipmentCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }

  // 7. 위치 생성
  console.log('  Creating locations...');
  const locations = [
    { code: 'A1-F1', name: 'A동 1층', building: 'A동', floor: '1층' },
    { code: 'A1-F2', name: 'A동 2층', building: 'A동', floor: '2층' },
    { code: 'B1-F1', name: 'B동 1층', building: 'B동', floor: '1층' },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    });
  }

  // 8. 창고 생성
  console.log('  Creating warehouses...');
  const warehouses = [
    { code: 'WH-MAIN', name: '메인 창고', description: '주요 자재 보관 창고' },
    { code: 'WH-SPARE', name: '예비품 창고', description: '예비 부품 보관 창고' },
  ];

  for (const wh of warehouses) {
    await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: {},
      create: wh,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Created accounts:');
  console.log('  - Admin: admin@fms.com / admin123');
  console.log('  - Test:  test@fms.com / test123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

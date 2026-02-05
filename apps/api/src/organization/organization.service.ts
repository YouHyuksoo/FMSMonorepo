/**
 * @file apps/api/src/organization/organization.service.ts
 * @description 조직 서비스 - 조직 데이터 관리
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            users: true,
            equipments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findTree() {
    // 최상위 조직만 가져와서 트리 구조로 반환
    const rootOrgs = await this.prisma.organization.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rootOrgs;
  }

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
        _count: {
          select: {
            users: true,
            equipments: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findByCode(code: string) {
    return this.prisma.organization.findUnique({
      where: { code },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    // 코드 중복 체크
    const existing = await this.findByCode(createOrganizationDto.code);
    if (existing) {
      throw new ConflictException(`Organization code '${createOrganizationDto.code}' already exists`);
    }

    return this.prisma.organization.create({
      data: createOrganizationDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    // 코드 변경 시 중복 체크
    if (updateOrganizationDto.code) {
      const existing = await this.findByCode(updateOrganizationDto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Organization code '${updateOrganizationDto.code}' already exists`);
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string) {
    // 하위 조직이 있으면 삭제 불가
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        children: true,
        users: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    if (organization.children.length > 0) {
      throw new ConflictException('Cannot delete organization with child organizations');
    }

    if (organization.users.length > 0) {
      throw new ConflictException('Cannot delete organization with users');
    }

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async count() {
    return this.prisma.organization.count();
  }
}

/**
 * @file apps/api/src/maintenance/plan.service.ts
 * @description 유지보수 계획 서비스
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceType, PlanStatus, Prisma } from '@prisma/client';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    search?: string;
    equipmentId?: string;
    requestId?: string;
    status?: PlanStatus;
    type?: MaintenanceType;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const {
      search,
      equipmentId,
      requestId,
      status,
      type,
      startDate,
      endDate,
      skip = 0,
      take = 20,
    } = options || {};

    const where: Prisma.MaintenancePlanWhereInput = {
      ...(search && {
        OR: [
          { planNumber: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(equipmentId && { equipmentId }),
      ...(requestId && { requestId }),
      ...(status && { status }),
      ...(type && { type }),
      ...(startDate || endDate
        ? {
            plannedStartDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.maintenancePlan.findMany({
        where,
        include: {
          equipment: true,
          request: {
            select: { id: true, requestNumber: true, title: true },
          },
          works: {
            select: { id: true, workNumber: true, status: true },
          },
          _count: { select: { materials: true } },
        },
        skip,
        take,
        orderBy: { plannedStartDate: 'asc' },
      }),
      this.prisma.maintenancePlan.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findById(id: string) {
    const plan = await this.prisma.maintenancePlan.findUnique({
      where: { id },
      include: {
        equipment: {
          include: { category: true, location: true },
        },
        request: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
          },
        },
        works: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
        materials: {
          include: { material: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async create(data: {
    requestId?: string;
    equipmentId: string;
    type: MaintenanceType;
    title: string;
    description?: string;
    plannedStartDate: Date;
    plannedEndDate: Date;
    estimatedHours?: number;
    estimatedCost?: number;
    materials?: { materialId: string; quantity: number }[];
  }) {
    const { materials, ...planData } = data;
    const planNumber = await this.generatePlanNumber();

    return this.prisma.maintenancePlan.create({
      data: {
        planNumber,
        ...planData,
        ...(materials && {
          materials: {
            create: materials.map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
            })),
          },
        }),
      },
      include: {
        equipment: true,
        request: { select: { id: true, requestNumber: true } },
        materials: { include: { material: true } },
      },
    });
  }

  async update(
    id: string,
    data: {
      type?: MaintenanceType;
      title?: string;
      description?: string;
      plannedStartDate?: Date;
      plannedEndDate?: Date;
      estimatedHours?: number;
      estimatedCost?: number;
      materials?: { materialId: string; quantity: number }[];
    },
  ) {
    const plan = await this.findById(id);

    // 완료/취소된 계획은 수정 불가
    if (['COMPLETED', 'CANCELLED'].includes(plan.status)) {
      throw new BadRequestException('Cannot update completed or cancelled plan');
    }

    const { materials, ...planData } = data;

    // 자재 업데이트가 있으면 기존 것 삭제 후 재생성
    if (materials) {
      await this.prisma.maintenanceMaterial.deleteMany({
        where: { planId: id },
      });
    }

    return this.prisma.maintenancePlan.update({
      where: { id },
      data: {
        ...planData,
        ...(materials && {
          materials: {
            create: materials.map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
            })),
          },
        }),
      },
      include: {
        equipment: true,
        request: { select: { id: true, requestNumber: true } },
        materials: { include: { material: true } },
      },
    });
  }

  async updateStatus(id: string, status: PlanStatus) {
    const plan = await this.findById(id);

    // 상태 전환 유효성 검사
    const validTransitions: Record<PlanStatus, PlanStatus[]> = {
      DRAFT: ['APPROVED', 'CANCELLED'],
      APPROVED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[plan.status].includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${plan.status} to ${status}`,
      );
    }

    // 관련 요청 상태도 업데이트
    const transaction = [
      this.prisma.maintenancePlan.update({
        where: { id },
        data: { status },
      }),
    ];

    if (plan.requestId) {
      if (status === 'IN_PROGRESS') {
        transaction.push(
          this.prisma.maintenanceRequest.update({
            where: { id: plan.requestId },
            data: { status: 'IN_PROGRESS' },
          }) as any,
        );
      } else if (status === 'COMPLETED') {
        // 모든 계획이 완료되었는지 확인
        const otherPlans = await this.prisma.maintenancePlan.findMany({
          where: {
            requestId: plan.requestId,
            id: { not: id },
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        });

        if (otherPlans.length === 0) {
          transaction.push(
            this.prisma.maintenanceRequest.update({
              where: { id: plan.requestId },
              data: { status: 'COMPLETED' },
            }) as any,
          );
        }
      }
    }

    await this.prisma.$transaction(transaction);

    return this.findById(id);
  }

  async delete(id: string) {
    const plan = await this.findById(id);

    if (!['DRAFT', 'CANCELLED'].includes(plan.status)) {
      throw new BadRequestException('Cannot delete plan in progress');
    }

    return this.prisma.maintenancePlan.delete({ where: { id } });
  }

  async getUpcoming(days: number = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.maintenancePlan.findMany({
      where: {
        status: { in: ['DRAFT', 'APPROVED'] },
        plannedStartDate: {
          gte: new Date(),
          lte: endDate,
        },
      },
      include: {
        equipment: true,
        works: {
          select: { id: true, status: true },
        },
      },
      orderBy: { plannedStartDate: 'asc' },
    });
  }

  private async generatePlanNumber(): Promise<string> {
    const today = new Date();
    const prefix = `PLN${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastPlan = await this.prisma.maintenancePlan.findFirst({
      where: { planNumber: { startsWith: prefix } },
      orderBy: { planNumber: 'desc' },
    });

    let sequence = 1;
    if (lastPlan) {
      const lastSeq = parseInt(lastPlan.planNumber.slice(-4), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}

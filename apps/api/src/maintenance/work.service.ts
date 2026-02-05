/**
 * @file apps/api/src/maintenance/work.service.ts
 * @description 유지보수 작업 서비스
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkStatus, Prisma } from '@prisma/client';

@Injectable()
export class WorkService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    planId?: string;
    assignedToId?: string;
    status?: WorkStatus;
    skip?: number;
    take?: number;
  }) {
    const { planId, assignedToId, status, skip = 0, take = 20 } = options || {};

    const where: Prisma.MaintenanceWorkWhereInput = {
      ...(planId && { planId }),
      ...(assignedToId && { assignedToId }),
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.maintenanceWork.findMany({
        where,
        include: {
          plan: {
            include: {
              equipment: true,
              request: { select: { id: true, requestNumber: true, title: true } },
            },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenanceWork.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findById(id: string) {
    const work = await this.prisma.maintenanceWork.findUnique({
      where: { id },
      include: {
        plan: {
          include: {
            equipment: { include: { category: true, location: true } },
            request: true,
            materials: { include: { material: true } },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!work) {
      throw new NotFoundException(`Work with ID ${id} not found`);
    }

    return work;
  }

  async findMyWorks(userId: string, status?: WorkStatus) {
    return this.prisma.maintenanceWork.findMany({
      where: {
        assignedToId: userId,
        ...(status && { status }),
      },
      include: {
        plan: {
          include: {
            equipment: true,
            request: { select: { id: true, title: true, priority: true } },
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async create(data: {
    planId: string;
    assignedToId: string;
    description?: string;
  }) {
    const workNumber = await this.generateWorkNumber();

    // 계획 상태를 IN_PROGRESS로 변경
    await this.prisma.maintenancePlan.update({
      where: { id: data.planId },
      data: { status: 'IN_PROGRESS' },
    });

    return this.prisma.maintenanceWork.create({
      data: {
        workNumber,
        ...data,
      },
      include: {
        plan: { include: { equipment: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  async start(id: string) {
    const work = await this.findById(id);

    if (work.status !== 'ASSIGNED') {
      throw new BadRequestException('Work must be in ASSIGNED status to start');
    }

    return this.prisma.maintenanceWork.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        plan: { include: { equipment: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  async pause(id: string) {
    const work = await this.findById(id);

    if (work.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Work must be in progress to pause');
    }

    return this.prisma.maintenanceWork.update({
      where: { id },
      data: { status: 'PAUSED' },
      include: {
        plan: { include: { equipment: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  async resume(id: string) {
    const work = await this.findById(id);

    if (work.status !== 'PAUSED') {
      throw new BadRequestException('Work must be paused to resume');
    }

    return this.prisma.maintenanceWork.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: {
        plan: { include: { equipment: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  async complete(
    id: string,
    data: {
      workReport: string;
      actualHours?: number;
      usedMaterials?: { materialId: string; quantity: number }[];
    },
  ) {
    const work = await this.findById(id);

    if (!['IN_PROGRESS', 'PAUSED'].includes(work.status)) {
      throw new BadRequestException('Work must be in progress or paused to complete');
    }

    const completedAt = new Date();
    const actualHours =
      data.actualHours ||
      (work.startedAt
        ? (completedAt.getTime() - work.startedAt.getTime()) / 3600000
        : 0);

    // 자재 사용량 업데이트
    if (data.usedMaterials) {
      await Promise.all(
        data.usedMaterials.map((m) =>
          this.prisma.maintenanceMaterial.updateMany({
            where: {
              planId: work.planId,
              materialId: m.materialId,
            },
            data: { usedQuantity: m.quantity },
          }),
        ),
      );
    }

    // 모든 작업이 완료되었는지 확인
    const otherWorks = await this.prisma.maintenanceWork.findMany({
      where: {
        planId: work.planId,
        id: { not: id },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });

    const transaction = [
      this.prisma.maintenanceWork.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt,
          actualHours,
          workReport: data.workReport,
        },
      }),
    ];

    // 모든 작업 완료 시 계획도 완료 처리
    if (otherWorks.length === 0) {
      transaction.push(
        this.prisma.maintenancePlan.update({
          where: { id: work.planId },
          data: { status: 'COMPLETED' },
        }) as any,
      );
    }

    await this.prisma.$transaction(transaction);

    return this.findById(id);
  }

  async cancel(id: string) {
    const work = await this.findById(id);

    if (work.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed work');
    }

    return this.prisma.maintenanceWork.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        plan: { include: { equipment: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  async reassign(id: string, newAssigneeId: string) {
    const work = await this.findById(id);

    if (['COMPLETED', 'CANCELLED'].includes(work.status)) {
      throw new BadRequestException('Cannot reassign completed or cancelled work');
    }

    return this.prisma.maintenanceWork.update({
      where: { id },
      data: { assignedToId: newAssigneeId },
      include: {
        plan: { include: { equipment: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  private async generateWorkNumber(): Promise<string> {
    const today = new Date();
    const prefix = `WRK${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastWork = await this.prisma.maintenanceWork.findFirst({
      where: { workNumber: { startsWith: prefix } },
      orderBy: { workNumber: 'desc' },
    });

    let sequence = 1;
    if (lastWork) {
      const lastSeq = parseInt(lastWork.workNumber.slice(-4), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}

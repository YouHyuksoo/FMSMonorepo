/**
 * @file apps/api/src/inspection/schedule.service.ts
 * @description 점검 일정 서비스
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InspectionScheduleStatus, Prisma } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    masterId?: string;
    equipmentId?: string;
    status?: InspectionScheduleStatus;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const {
      masterId,
      equipmentId,
      status,
      startDate,
      endDate,
      skip = 0,
      take = 20,
    } = options || {};

    const where: Prisma.InspectionScheduleWhereInput = {
      ...(masterId && { masterId }),
      ...(equipmentId && { equipmentId }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            scheduledDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.inspectionSchedule.findMany({
        where,
        include: {
          master: {
            select: { id: true, code: true, name: true, type: true },
          },
          equipment: {
            select: { id: true, code: true, name: true },
          },
          results: {
            select: { id: true, status: true, completedAt: true },
          },
        },
        skip,
        take,
        orderBy: { scheduledDate: 'asc' },
      }),
      this.prisma.inspectionSchedule.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findById(id: string) {
    const schedule = await this.prisma.inspectionSchedule.findUnique({
      where: { id },
      include: {
        master: {
          include: {
            items: { orderBy: { sequence: 'asc' } },
          },
        },
        equipment: {
          include: { category: true, location: true },
        },
        results: {
          include: {
            inspector: { select: { id: true, name: true } },
            itemResults: {
              include: { item: true },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async create(data: {
    masterId: string;
    equipmentId: string;
    scheduledDate: Date;
    dueDate: Date;
  }) {
    return this.prisma.inspectionSchedule.create({
      data,
      include: {
        master: { select: { id: true, code: true, name: true } },
        equipment: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async createBulk(data: {
    masterId: string;
    equipmentIds: string[];
    scheduledDate: Date;
    dueDate: Date;
  }) {
    const { masterId, equipmentIds, scheduledDate, dueDate } = data;

    const schedules = await this.prisma.inspectionSchedule.createMany({
      data: equipmentIds.map((equipmentId) => ({
        masterId,
        equipmentId,
        scheduledDate,
        dueDate,
      })),
    });

    return { count: schedules.count };
  }

  async update(
    id: string,
    data: {
      scheduledDate?: Date;
      dueDate?: Date;
      status?: InspectionScheduleStatus;
    },
  ) {
    return this.prisma.inspectionSchedule.update({
      where: { id },
      data,
      include: {
        master: { select: { id: true, code: true, name: true } },
        equipment: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.inspectionSchedule.delete({ where: { id } });
  }

  async getOverdue() {
    const now = new Date();

    return this.prisma.inspectionSchedule.findMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
      include: {
        master: { select: { id: true, code: true, name: true, type: true } },
        equipment: { select: { id: true, code: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getUpcoming(days: number = 7) {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.inspectionSchedule.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          gte: now,
          lte: endDate,
        },
      },
      include: {
        master: { select: { id: true, code: true, name: true, type: true } },
        equipment: { select: { id: true, code: true, name: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async checkAndUpdateOverdue() {
    const now = new Date();

    return this.prisma.inspectionSchedule.updateMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });
  }
}

/**
 * @file apps/api/src/inspection/result.service.ts
 * @description 점검 결과 서비스
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InspectionResultStatus } from '@prisma/client';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    scheduleId?: string;
    inspectorId?: string;
    status?: InspectionResultStatus;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const {
      scheduleId,
      inspectorId,
      status,
      startDate,
      endDate,
      skip = 0,
      take = 20,
    } = options || {};

    const where = {
      ...(scheduleId && { scheduleId }),
      ...(inspectorId && { inspectorId }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            startedAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.inspectionResult.findMany({
        where,
        include: {
          schedule: {
            include: {
              master: { select: { id: true, code: true, name: true } },
              equipment: { select: { id: true, code: true, name: true } },
            },
          },
          inspector: { select: { id: true, name: true } },
          itemResults: {
            include: { item: true },
          },
        },
        skip,
        take,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.inspectionResult.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findById(id: string) {
    const result = await this.prisma.inspectionResult.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            master: {
              include: { items: { orderBy: { sequence: 'asc' } } },
            },
            equipment: { include: { category: true, location: true } },
          },
        },
        inspector: { select: { id: true, name: true, email: true } },
        itemResults: {
          include: { item: true },
          orderBy: { item: { sequence: 'asc' } },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    return result;
  }

  async start(scheduleId: string, inspectorId: string) {
    // 일정 상태 확인
    const schedule = await this.prisma.inspectionSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    if (!['SCHEDULED', 'OVERDUE'].includes(schedule.status)) {
      throw new BadRequestException('Cannot start inspection for this schedule');
    }

    // 일정 상태 업데이트
    await this.prisma.inspectionSchedule.update({
      where: { id: scheduleId },
      data: { status: 'IN_PROGRESS' },
    });

    return this.prisma.inspectionResult.create({
      data: {
        scheduleId,
        inspectorId,
        startedAt: new Date(),
      },
      include: {
        schedule: {
          include: {
            master: { include: { items: { orderBy: { sequence: 'asc' } } } },
            equipment: true,
          },
        },
        inspector: { select: { id: true, name: true } },
      },
    });
  }

  async saveItemResults(
    resultId: string,
    itemResults: {
      itemId: string;
      value?: string;
      numericValue?: number;
      status: InspectionResultStatus;
      remarks?: string;
      photoPath?: string;
    }[],
  ) {
    // 기존 항목 결과 삭제 후 새로 생성
    await this.prisma.inspectionItemResult.deleteMany({
      where: { resultId },
    });

    await this.prisma.inspectionItemResult.createMany({
      data: itemResults.map((ir) => ({
        resultId,
        ...ir,
      })),
    });

    return this.findById(resultId);
  }

  async complete(
    resultId: string,
    data: {
      remarks?: string;
      itemResults: {
        itemId: string;
        value?: string;
        numericValue?: number;
        status: InspectionResultStatus;
        remarks?: string;
        photoPath?: string;
      }[];
    },
  ) {
    const result = await this.findById(resultId);

    // 항목 결과 저장
    await this.prisma.inspectionItemResult.deleteMany({
      where: { resultId },
    });

    await this.prisma.inspectionItemResult.createMany({
      data: data.itemResults.map((ir) => ({
        resultId,
        ...ir,
      })),
    });

    // 전체 결과 상태 결정 (하나라도 FAIL이면 FAIL)
    const overallStatus = data.itemResults.some((ir) => ir.status === 'FAIL')
      ? 'FAIL'
      : data.itemResults.some((ir) => ir.status === 'CONDITIONAL')
        ? 'CONDITIONAL'
        : 'PASS';

    // 결과 업데이트
    await this.prisma.inspectionResult.update({
      where: { id: resultId },
      data: {
        status: overallStatus,
        completedAt: new Date(),
        remarks: data.remarks,
      },
    });

    // 일정 상태 업데이트
    await this.prisma.inspectionSchedule.update({
      where: { id: result.scheduleId },
      data: { status: 'COMPLETED' },
    });

    return this.findById(resultId);
  }

  async getStatistics(options?: {
    equipmentId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { equipmentId, startDate, endDate } = options || {};

    const where = {
      completedAt: { not: null },
      ...(equipmentId && {
        schedule: { equipmentId },
      }),
      ...(startDate || endDate
        ? {
            completedAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [total, byStatus] = await Promise.all([
      this.prisma.inspectionResult.count({ where }),
      this.prisma.inspectionResult.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, i) => ({ ...acc, [i.status]: i._count }),
        {},
      ),
      passRate:
        total > 0
          ? ((byStatus.find((s) => s.status === 'PASS')?._count || 0) / total) * 100
          : 0,
    };
  }
}

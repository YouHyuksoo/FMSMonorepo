/**
 * @file apps/api/src/maintenance/request.service.ts
 * @description 유지보수 요청 서비스
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceType, Priority, RequestStatus, Prisma } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    search?: string;
    equipmentId?: string;
    status?: RequestStatus;
    type?: MaintenanceType;
    priority?: Priority;
    requesterId?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const {
      search,
      equipmentId,
      status,
      type,
      priority,
      requesterId,
      startDate,
      endDate,
      skip = 0,
      take = 20,
    } = options || {};

    const where: Prisma.MaintenanceRequestWhereInput = {
      ...(search && {
        OR: [
          { requestNumber: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(equipmentId && { equipmentId }),
      ...(status && { status }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(requesterId && { requesterId }),
      ...(startDate || endDate
        ? {
            requestedDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        include: {
          equipment: true,
          requester: {
            select: { id: true, name: true, email: true },
          },
          plans: {
            select: { id: true, planNumber: true, status: true },
          },
        },
        skip,
        take,
        orderBy: [{ priority: 'asc' }, { requestedDate: 'desc' }],
      }),
      this.prisma.maintenanceRequest.count({ where }),
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
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        equipment: {
          include: { category: true, location: true },
        },
        requester: {
          select: { id: true, name: true, email: true, phone: true, organization: true },
        },
        plans: {
          include: {
            works: {
              include: {
                assignedTo: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async create(data: {
    equipmentId: string;
    requesterId: string;
    type: MaintenanceType;
    priority?: Priority;
    title: string;
    description: string;
    desiredDate?: Date;
  }) {
    const requestNumber = await this.generateRequestNumber();

    return this.prisma.maintenanceRequest.create({
      data: {
        requestNumber,
        ...data,
      },
      include: {
        equipment: true,
        requester: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      type?: MaintenanceType;
      priority?: Priority;
      title?: string;
      description?: string;
      desiredDate?: Date;
    },
  ) {
    const request = await this.findById(id);

    // 완료/취소된 요청은 수정 불가
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(request.status)) {
      throw new BadRequestException('Cannot update completed or cancelled request');
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data,
      include: {
        equipment: true,
        requester: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateStatus(id: string, status: RequestStatus) {
    const request = await this.findById(id);

    // 상태 전환 유효성 검사
    const validTransitions: Record<RequestStatus, RequestStatus[]> = {
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      REJECTED: [],
    };

    if (!validTransitions[request.status].includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${request.status} to ${status}`,
      );
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status },
      include: {
        equipment: true,
        requester: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    const request = await this.findById(id);

    // 진행 중이거나 완료된 요청은 삭제 불가
    if (!['PENDING', 'CANCELLED', 'REJECTED'].includes(request.status)) {
      throw new BadRequestException('Cannot delete request in progress');
    }

    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }

  async getStatistics(options?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = options || {};

    const where: Prisma.MaintenanceRequestWhereInput = {
      ...(startDate || endDate
        ? {
            requestedDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [total, byStatus, byType, byPriority] = await Promise.all([
      this.prisma.maintenanceRequest.count({ where }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, i) => ({ ...acc, [i.status]: i._count }), {}),
      byType: byType.reduce((acc, i) => ({ ...acc, [i.type]: i._count }), {}),
      byPriority: byPriority.reduce((acc, i) => ({ ...acc, [i.priority]: i._count }), {}),
    };
  }

  private async generateRequestNumber(): Promise<string> {
    const today = new Date();
    const prefix = `REQ${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastRequest = await this.prisma.maintenanceRequest.findFirst({
      where: { requestNumber: { startsWith: prefix } },
      orderBy: { requestNumber: 'desc' },
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSeq = parseInt(lastRequest.requestNumber.slice(-4), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}

/**
 * @file apps/api/src/inspection/master.service.ts
 * @description 점검 마스터 서비스
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InspectionType, InspectionFrequency, InspectionInputType } from '@prisma/client';

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    search?: string;
    type?: InspectionType;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, type, isActive, skip = 0, take = 20 } = options || {};

    const where = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.inspectionMaster.findMany({
        where,
        include: {
          items: {
            orderBy: { sequence: 'asc' },
          },
          _count: { select: { schedules: true } },
        },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.inspectionMaster.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findById(id: string) {
    const master = await this.prisma.inspectionMaster.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sequence: 'asc' },
        },
        schedules: {
          take: 10,
          orderBy: { scheduledDate: 'desc' },
          include: {
            equipment: true,
          },
        },
      },
    });

    if (!master) {
      throw new NotFoundException(`Inspection master with ID ${id} not found`);
    }

    return master;
  }

  async findByCode(code: string) {
    return this.prisma.inspectionMaster.findUnique({
      where: { code },
    });
  }

  async create(data: {
    code: string;
    name: string;
    description?: string;
    type: InspectionType;
    frequency: InspectionFrequency;
    items?: {
      sequence: number;
      name: string;
      description?: string;
      method?: string;
      standard?: string;
      inputType: InspectionInputType;
      unit?: string;
      minValue?: number;
      maxValue?: number;
      options?: any;
      isRequired?: boolean;
    }[];
  }) {
    const existing = await this.findByCode(data.code);
    if (existing) {
      throw new ConflictException(`Code '${data.code}' already exists`);
    }

    const { items, ...masterData } = data;

    return this.prisma.inspectionMaster.create({
      data: {
        ...masterData,
        ...(items && {
          items: {
            create: items,
          },
        }),
      },
      include: {
        items: { orderBy: { sequence: 'asc' } },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: InspectionType;
      frequency?: InspectionFrequency;
      isActive?: boolean;
      items?: {
        sequence: number;
        name: string;
        description?: string;
        method?: string;
        standard?: string;
        inputType: InspectionInputType;
        unit?: string;
        minValue?: number;
        maxValue?: number;
        options?: any;
        isRequired?: boolean;
      }[];
    },
  ) {
    const { items, ...masterData } = data;

    // 항목 업데이트가 있으면 기존 것 삭제 후 재생성
    if (items) {
      await this.prisma.inspectionItem.deleteMany({
        where: { masterId: id },
      });
    }

    return this.prisma.inspectionMaster.update({
      where: { id },
      data: {
        ...masterData,
        ...(items && {
          items: {
            create: items,
          },
        }),
      },
      include: {
        items: { orderBy: { sequence: 'asc' } },
      },
    });
  }

  async delete(id: string) {
    const master = await this.findById(id);

    if (master.schedules.length > 0) {
      throw new ConflictException('Cannot delete master with schedules');
    }

    return this.prisma.inspectionMaster.delete({ where: { id } });
  }

  async addItem(
    masterId: string,
    item: {
      sequence: number;
      name: string;
      description?: string;
      method?: string;
      standard?: string;
      inputType: InspectionInputType;
      unit?: string;
      minValue?: number;
      maxValue?: number;
      options?: any;
      isRequired?: boolean;
    },
  ) {
    return this.prisma.inspectionItem.create({
      data: {
        masterId,
        ...item,
      },
    });
  }

  async updateItem(
    itemId: string,
    data: {
      sequence?: number;
      name?: string;
      description?: string;
      method?: string;
      standard?: string;
      inputType?: InspectionInputType;
      unit?: string;
      minValue?: number;
      maxValue?: number;
      options?: any;
      isRequired?: boolean;
    },
  ) {
    return this.prisma.inspectionItem.update({
      where: { id: itemId },
      data,
    });
  }

  async deleteItem(itemId: string) {
    return this.prisma.inspectionItem.delete({
      where: { id: itemId },
    });
  }
}

/**
 * @file apps/api/src/equipment/equipment.service.ts
 * @description 설비 서비스 - 설비 데이터 관리
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentFilterDto } from './dto/equipment-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: EquipmentFilterDto) {
    const {
      search,
      categoryId,
      organizationId,
      locationId,
      status,
      criticality,
      skip = 0,
      take = 20,
    } = filter || {};

    const where: Prisma.EquipmentWhereInput = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(organizationId && { organizationId }),
      ...(locationId && { locationId }),
      ...(status && { status }),
      ...(criticality && { criticality }),
    };

    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        include: {
          category: true,
          organization: true,
          location: true,
          _count: {
            select: {
              maintenanceRequests: true,
              inspectionSchedules: true,
              sensors: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.equipment.count({ where }),
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
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        organization: true,
        location: true,
        documents: true,
        spareParts: {
          include: {
            material: true,
          },
        },
        sensors: true,
        _count: {
          select: {
            maintenanceRequests: true,
            maintenancePlans: true,
            inspectionSchedules: true,
            failures: true,
          },
        },
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return equipment;
  }

  async findByCode(code: string) {
    return this.prisma.equipment.findUnique({
      where: { code },
      include: {
        category: true,
        organization: true,
        location: true,
      },
    });
  }

  async create(createEquipmentDto: CreateEquipmentDto) {
    const { sparePartIds, ...equipmentData } = createEquipmentDto;

    return this.prisma.equipment.create({
      data: {
        ...equipmentData,
        ...(sparePartIds && {
          spareParts: {
            create: sparePartIds.map((sp) => ({
              materialId: sp.materialId,
              quantity: sp.quantity,
              remarks: sp.remarks,
            })),
          },
        }),
      },
      include: {
        category: true,
        organization: true,
        location: true,
      },
    });
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto) {
    const { sparePartIds, ...equipmentData } = updateEquipmentDto;

    // 예비품 업데이트가 있으면 기존 것 삭제 후 재생성
    if (sparePartIds) {
      await this.prisma.equipmentSparePart.deleteMany({
        where: { equipmentId: id },
      });
    }

    return this.prisma.equipment.update({
      where: { id },
      data: {
        ...equipmentData,
        ...(sparePartIds && {
          spareParts: {
            create: sparePartIds.map((sp) => ({
              materialId: sp.materialId,
              quantity: sp.quantity,
              remarks: sp.remarks,
            })),
          },
        }),
      },
      include: {
        category: true,
        organization: true,
        location: true,
        spareParts: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.equipment.delete({
      where: { id },
    });
  }

  async getStatistics(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};

    const [total, byStatus, byCriticality] = await Promise.all([
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.equipment.groupBy({
        by: ['criticality'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {},
      ),
      byCriticality: byCriticality.reduce(
        (acc, item) => ({ ...acc, [item.criticality]: item._count }),
        {},
      ),
    };
  }

  // 설비 문서 관리
  async addDocument(
    equipmentId: string,
    document: { type: string; name: string; filePath: string; fileSize?: number; mimeType?: string },
  ) {
    return this.prisma.equipmentDocument.create({
      data: {
        equipmentId,
        type: document.type as any,
        name: document.name,
        filePath: document.filePath,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
      },
    });
  }

  async removeDocument(documentId: string) {
    return this.prisma.equipmentDocument.delete({
      where: { id: documentId },
    });
  }

  async getDocuments(equipmentId: string) {
    return this.prisma.equipmentDocument.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

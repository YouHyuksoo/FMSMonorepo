/**
 * @file apps/api/src/equipment/location.service.ts
 * @description 설비 위치 서비스
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({
      include: {
        _count: {
          select: { equipments: true },
        },
      },
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        equipments: {
          take: 20,
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async create(data: {
    code: string;
    name: string;
    building?: string;
    floor?: string;
    area?: string;
  }) {
    const existing = await this.prisma.location.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(`Location code '${data.code}' already exists`);
    }

    return this.prisma.location.create({ data });
  }

  async update(
    id: string,
    data: {
      code?: string;
      name?: string;
      building?: string;
      floor?: string;
      area?: string;
    },
  ) {
    if (data.code) {
      const existing = await this.prisma.location.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Location code '${data.code}' already exists`);
      }
    }

    return this.prisma.location.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { equipments: true },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    if (location.equipments.length > 0) {
      throw new ConflictException('Cannot delete location with equipments');
    }

    return this.prisma.location.delete({ where: { id } });
  }
}

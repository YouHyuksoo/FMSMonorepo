/**
 * @file apps/api/src/equipment/category.service.ts
 * @description 설비 카테고리 서비스
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.equipmentCategory.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { equipments: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findTree() {
    const roots = await this.prisma.equipmentCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return roots;
  }

  async findById(id: string) {
    const category = await this.prisma.equipmentCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        equipments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(data: { code: string; name: string; parentId?: string }) {
    const existing = await this.prisma.equipmentCategory.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(`Category code '${data.code}' already exists`);
    }

    return this.prisma.equipmentCategory.create({
      data,
      include: { parent: true },
    });
  }

  async update(id: string, data: { code?: string; name?: string; parentId?: string }) {
    if (data.code) {
      const existing = await this.prisma.equipmentCategory.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category code '${data.code}' already exists`);
      }
    }

    return this.prisma.equipmentCategory.update({
      where: { id },
      data,
      include: { parent: true },
    });
  }

  async delete(id: string) {
    const category = await this.prisma.equipmentCategory.findUnique({
      where: { id },
      include: { children: true, equipments: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.children.length > 0) {
      throw new ConflictException('Cannot delete category with child categories');
    }

    if (category.equipments.length > 0) {
      throw new ConflictException('Cannot delete category with equipments');
    }

    return this.prisma.equipmentCategory.delete({ where: { id } });
  }
}

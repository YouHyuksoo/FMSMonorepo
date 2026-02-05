/**
 * @file apps/api/src/material/material.service.ts
 * @description 자재 서비스 - 자재 마스터 관리
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, categoryId, isActive, skip = 0, take = 20 } = options || {};

    const where: Prisma.MaterialWhereInput = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        include: {
          category: true,
          stocks: {
            include: { warehouse: true },
          },
        },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.material.count({ where }),
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
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        category: true,
        stocks: {
          include: { warehouse: true },
        },
        transactions: {
          take: 20,
          orderBy: { transactionDate: 'desc' },
          include: {
            fromWarehouse: true,
            toWarehouse: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async findByCode(code: string) {
    return this.prisma.material.findUnique({
      where: { code },
      include: { category: true },
    });
  }

  async create(data: {
    code: string;
    name: string;
    description?: string;
    categoryId?: string;
    unit: string;
    unitPrice?: number;
    minStock?: number;
    maxStock?: number;
    reorderPoint?: number;
  }) {
    const existing = await this.findByCode(data.code);
    if (existing) {
      throw new ConflictException(`Material code '${data.code}' already exists`);
    }

    return this.prisma.material.create({
      data,
      include: { category: true },
    });
  }

  async update(
    id: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
      categoryId?: string;
      unit?: string;
      unitPrice?: number;
      minStock?: number;
      maxStock?: number;
      reorderPoint?: number;
      isActive?: boolean;
    },
  ) {
    if (data.code) {
      const existing = await this.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Material code '${data.code}' already exists`);
      }
    }

    return this.prisma.material.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { stocks: true },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    // 재고가 있으면 삭제 불가, 비활성화만 가능
    const hasStock = material.stocks.some((s) => Number(s.quantity) > 0);
    if (hasStock) {
      throw new ConflictException(
        'Cannot delete material with stock. Deactivate it instead.',
      );
    }

    return this.prisma.material.delete({ where: { id } });
  }

  async getLowStockItems() {
    return this.prisma.material.findMany({
      where: {
        isActive: true,
        reorderPoint: { not: null },
      },
      include: {
        stocks: {
          include: { warehouse: true },
        },
      },
    }).then((materials) =>
      materials.filter((m) => {
        const totalStock = m.stocks.reduce(
          (sum, s) => sum + Number(s.quantity),
          0,
        );
        return m.reorderPoint && totalStock <= Number(m.reorderPoint);
      }),
    );
  }

  // 자재 카테고리 관리
  async getCategories() {
    return this.prisma.materialCategory.findMany({
      include: {
        parent: true,
        children: true,
        _count: { select: { materials: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: { code: string; name: string; parentId?: string }) {
    return this.prisma.materialCategory.create({
      data,
      include: { parent: true },
    });
  }

  async updateCategory(
    id: string,
    data: { code?: string; name?: string; parentId?: string },
  ) {
    return this.prisma.materialCategory.update({
      where: { id },
      data,
      include: { parent: true },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.materialCategory.findUnique({
      where: { id },
      include: { materials: true, children: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.children.length > 0 || category.materials.length > 0) {
      throw new ConflictException('Cannot delete category with children or materials');
    }

    return this.prisma.materialCategory.delete({ where: { id } });
  }
}

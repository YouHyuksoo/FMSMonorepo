/**
 * @file apps/api/src/material/warehouse.service.ts
 * @description 창고 서비스
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: { select: { stocks: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stocks: {
          include: { material: true },
          where: { quantity: { gt: 0 } },
          orderBy: { material: { name: 'asc' } },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async create(data: { code: string; name: string; description?: string }) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(`Warehouse code '${data.code}' already exists`);
    }

    return this.prisma.warehouse.create({ data });
  }

  async update(
    id: string,
    data: { code?: string; name?: string; description?: string },
  ) {
    if (data.code) {
      const existing = await this.prisma.warehouse.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Warehouse code '${data.code}' already exists`);
      }
    }

    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { stocks: true },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    const hasStock = warehouse.stocks.some((s) => Number(s.quantity) > 0);
    if (hasStock) {
      throw new ConflictException('Cannot delete warehouse with stock');
    }

    return this.prisma.warehouse.delete({ where: { id } });
  }

  async getInventorySummary(warehouseId: string) {
    const stocks = await this.prisma.materialStock.findMany({
      where: { warehouseId, quantity: { gt: 0 } },
      include: {
        material: {
          include: { category: true },
        },
      },
    });

    const totalValue = stocks.reduce((sum, s) => {
      const price = Number(s.material.unitPrice) || 0;
      return sum + Number(s.quantity) * price;
    }, 0);

    return {
      itemCount: stocks.length,
      totalQuantity: stocks.reduce((sum, s) => sum + Number(s.quantity), 0),
      totalValue,
      stocks,
    };
  }
}

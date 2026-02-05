/**
 * @file apps/api/src/material/stock.service.ts
 * @description 재고 서비스 - 입출고 및 재고 관리
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock(materialId: string, warehouseId: string) {
    return this.prisma.materialStock.findUnique({
      where: {
        materialId_warehouseId: { materialId, warehouseId },
      },
      include: {
        material: true,
        warehouse: true,
      },
    });
  }

  async getAllStocks(options?: {
    warehouseId?: string;
    materialId?: string;
    lowStock?: boolean;
  }) {
    const { warehouseId, materialId, lowStock } = options || {};

    const stocks = await this.prisma.materialStock.findMany({
      where: {
        ...(warehouseId && { warehouseId }),
        ...(materialId && { materialId }),
        quantity: { gt: 0 },
      },
      include: {
        material: true,
        warehouse: true,
      },
      orderBy: [{ warehouse: { name: 'asc' } }, { material: { name: 'asc' } }],
    });

    if (lowStock) {
      return stocks.filter((s) => {
        const reorderPoint = Number(s.material.reorderPoint) || 0;
        return reorderPoint > 0 && Number(s.quantity) <= reorderPoint;
      });
    }

    return stocks;
  }

  async receipt(data: {
    materialId: string;
    warehouseId: string;
    quantity: number;
    unitPrice?: number;
    remarks?: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const { materialId, warehouseId, quantity, unitPrice, remarks, referenceType, referenceId } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    // 트랜잭션으로 처리
    return this.prisma.$transaction(async (tx) => {
      // 재고 업데이트 또는 생성
      const stock = await tx.materialStock.upsert({
        where: {
          materialId_warehouseId: { materialId, warehouseId },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          materialId,
          warehouseId,
          quantity,
        },
        include: {
          material: true,
          warehouse: true,
        },
      });

      // 트랜잭션 기록
      const transactionNumber = await this.generateTransactionNumber();
      await tx.materialTransaction.create({
        data: {
          transactionNumber,
          materialId,
          type: TransactionType.RECEIPT,
          toWarehouseId: warehouseId,
          quantity,
          unitPrice,
          remarks,
          referenceType,
          referenceId,
        },
      });

      return stock;
    });
  }

  async issue(data: {
    materialId: string;
    warehouseId: string;
    quantity: number;
    remarks?: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const { materialId, warehouseId, quantity, remarks, referenceType, referenceId } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    // 현재 재고 확인
    const currentStock = await this.getStock(materialId, warehouseId);
    if (!currentStock || Number(currentStock.quantity) < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.$transaction(async (tx) => {
      // 재고 차감
      const stock = await tx.materialStock.update({
        where: {
          materialId_warehouseId: { materialId, warehouseId },
        },
        data: {
          quantity: { decrement: quantity },
        },
        include: {
          material: true,
          warehouse: true,
        },
      });

      // 트랜잭션 기록
      const transactionNumber = await this.generateTransactionNumber();
      await tx.materialTransaction.create({
        data: {
          transactionNumber,
          materialId,
          type: TransactionType.ISSUE,
          fromWarehouseId: warehouseId,
          quantity,
          remarks,
          referenceType,
          referenceId,
        },
      });

      return stock;
    });
  }

  async transfer(data: {
    materialId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    remarks?: string;
  }) {
    const { materialId, fromWarehouseId, toWarehouseId, quantity, remarks } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    if (fromWarehouseId === toWarehouseId) {
      throw new BadRequestException('Cannot transfer to the same warehouse');
    }

    // 현재 재고 확인
    const currentStock = await this.getStock(materialId, fromWarehouseId);
    if (!currentStock || Number(currentStock.quantity) < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.$transaction(async (tx) => {
      // 출고 창고에서 차감
      await tx.materialStock.update({
        where: {
          materialId_warehouseId: { materialId, warehouseId: fromWarehouseId },
        },
        data: {
          quantity: { decrement: quantity },
        },
      });

      // 입고 창고에 추가
      const stock = await tx.materialStock.upsert({
        where: {
          materialId_warehouseId: { materialId, warehouseId: toWarehouseId },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          materialId,
          warehouseId: toWarehouseId,
          quantity,
        },
        include: {
          material: true,
          warehouse: true,
        },
      });

      // 트랜잭션 기록
      const transactionNumber = await this.generateTransactionNumber();
      await tx.materialTransaction.create({
        data: {
          transactionNumber,
          materialId,
          type: TransactionType.TRANSFER,
          fromWarehouseId,
          toWarehouseId,
          quantity,
          remarks,
        },
      });

      return stock;
    });
  }

  async adjust(data: {
    materialId: string;
    warehouseId: string;
    newQuantity: number;
    remarks: string;
  }) {
    const { materialId, warehouseId, newQuantity, remarks } = data;

    if (newQuantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const currentStock = await this.getStock(materialId, warehouseId);
    const currentQty = currentStock ? Number(currentStock.quantity) : 0;
    const adjustmentQty = newQuantity - currentQty;

    return this.prisma.$transaction(async (tx) => {
      // 재고 업데이트
      const stock = await tx.materialStock.upsert({
        where: {
          materialId_warehouseId: { materialId, warehouseId },
        },
        update: {
          quantity: newQuantity,
        },
        create: {
          materialId,
          warehouseId,
          quantity: newQuantity,
        },
        include: {
          material: true,
          warehouse: true,
        },
      });

      // 트랜잭션 기록
      const transactionNumber = await this.generateTransactionNumber();
      await tx.materialTransaction.create({
        data: {
          transactionNumber,
          materialId,
          type: TransactionType.ADJUSTMENT,
          fromWarehouseId: adjustmentQty < 0 ? warehouseId : undefined,
          toWarehouseId: adjustmentQty > 0 ? warehouseId : undefined,
          quantity: Math.abs(adjustmentQty),
          remarks: `Adjustment: ${currentQty} → ${newQuantity}. ${remarks}`,
        },
      });

      return stock;
    });
  }

  async getTransactions(options?: {
    materialId?: string;
    warehouseId?: string;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const { materialId, warehouseId, type, startDate, endDate, skip = 0, take = 50 } = options || {};

    const where: any = {
      ...(materialId && { materialId }),
      ...(type && { type }),
      ...(warehouseId && {
        OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
      }),
      ...(startDate || endDate
        ? {
            transactionDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.materialTransaction.findMany({
        where,
        include: {
          material: true,
          fromWarehouse: true,
          toWarehouse: true,
        },
        skip,
        take,
        orderBy: { transactionDate: 'desc' },
      }),
      this.prisma.materialTransaction.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  private async generateTransactionNumber(): Promise<string> {
    const today = new Date();
    const prefix = `TXN${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const lastTransaction = await this.prisma.materialTransaction.findFirst({
      where: { transactionNumber: { startsWith: prefix } },
      orderBy: { transactionNumber: 'desc' },
    });

    let sequence = 1;
    if (lastTransaction) {
      const lastSeq = parseInt(lastTransaction.transactionNumber.slice(-4), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}

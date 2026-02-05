/**
 * @file apps/api/src/material/stock.controller.ts
 * @description 재고 컨트롤러 - 입출고 API
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionType } from '@prisma/client';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getAllStocks(
    @Query('warehouseId') warehouseId?: string,
    @Query('materialId') materialId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.stockService.getAllStocks({
      warehouseId,
      materialId,
      lowStock: lowStock === 'true',
    });
  }

  @Get('transactions')
  async getTransactions(
    @Query('materialId') materialId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.stockService.getTransactions({
      materialId,
      warehouseId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Post('receipt')
  async receipt(
    @Body()
    data: {
      materialId: string;
      warehouseId: string;
      quantity: number;
      unitPrice?: number;
      remarks?: string;
      referenceType?: string;
      referenceId?: string;
    },
  ) {
    return this.stockService.receipt(data);
  }

  @Post('issue')
  async issue(
    @Body()
    data: {
      materialId: string;
      warehouseId: string;
      quantity: number;
      remarks?: string;
      referenceType?: string;
      referenceId?: string;
    },
  ) {
    return this.stockService.issue(data);
  }

  @Post('transfer')
  async transfer(
    @Body()
    data: {
      materialId: string;
      fromWarehouseId: string;
      toWarehouseId: string;
      quantity: number;
      remarks?: string;
    },
  ) {
    return this.stockService.transfer(data);
  }

  @Post('adjust')
  async adjust(
    @Body()
    data: {
      materialId: string;
      warehouseId: string;
      newQuantity: number;
      remarks: string;
    },
  ) {
    return this.stockService.adjust(data);
  }
}

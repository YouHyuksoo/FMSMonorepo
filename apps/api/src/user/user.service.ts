/**
 * @file apps/api/src/user/user.service.ts
 * @description 사용자 서비스 - 사용자 데이터 관리
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    organizationId?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { organizationId, isActive, skip = 0, take = 20 } = options || {};

    return this.prisma.user.findMany({
      where: {
        ...(organizationId && { organizationId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { roleIds, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        ...(roleIds && {
          roles: {
            create: roleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })),
          },
        }),
      },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { roleIds, ...userData } = updateUserDto;

    // 역할 업데이트가 있으면 기존 역할 삭제 후 새로 할당
    if (roleIds) {
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(roleIds && {
          roles: {
            create: roleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })),
          },
        }),
      },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async count(organizationId?: string) {
    return this.prisma.user.count({
      where: organizationId ? { organizationId } : undefined,
    });
  }
}

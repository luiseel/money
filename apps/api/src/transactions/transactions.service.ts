import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateTransactionDto,
  TransactionFilterDto,
} from "./schema/transaction";
import { Prisma } from "@prisma/client";
import { UsersService } from "../users/users.service";

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async findAll(userId: string, filters: TransactionFilterDto) {
    const user = await this.usersService.findByClerkId(userId);
    const {
      page,
      limit,
      type,
      title,
      tags,
      startDate,
      endDate,
      applied,
      sortBy,
      sortOrder,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

    if (type) {
      where.type = type;
    }

    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    if (tags && tags.length > 0) {
      // This assumes tags are stored as a JSON array in the database
      // The exact implementation depends on how tags are stored
      where.tags = {
        array_contains: tags,
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (applied !== undefined) {
      where.applied = applied;
    }

    // Build order by
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const user = await this.usersService.findByClerkId(userId);
    const transaction = await this.prisma.transaction.findUnique({
      where: { id, userId: user.id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async create(userId: string, data: CreateTransactionDto) {
    const user = await this.usersService.findByClerkId(userId);
    return this.prisma.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        title: data.title,
        tags: data.tags || [],
        applied: data.applied,
        userId: user.id,
      },
    });
  }

  async delete(userId: string, id: string) {
    const user = await this.usersService.findByClerkId(userId);
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== user.id) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}

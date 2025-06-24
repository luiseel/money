import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, TransactionFilterDto } from './schema/transaction';
import { Prisma, TransactionType } from '@prisma/client';

// Create mock types for our dependencies
interface TransactionMethods {
  findMany: jest.Mock;
  count: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  delete: jest.Mock;
}

interface PrismaMock {
  transaction: TransactionMethods;
}

type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

// Create factory functions for our mocks
const createPrismaMock = () => ({
  transaction: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
});

const createUserServiceMock = () => ({
  findByClerkId: jest.fn(),
});

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaMock;
  let usersService: MockType<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useFactory: createPrismaMock,
        },
        {
          provide: UsersService,
          useFactory: createUserServiceMock,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get(PrismaService) as unknown as PrismaMock;
    usersService = module.get(UsersService) as unknown as MockType<UsersService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return transactions with pagination metadata', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };
      const mockFilters: TransactionFilterDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const mockTransactions = [
        { 
          id: '1', 
          title: 'Transaction 1', 
          amount: new Prisma.Decimal(100), 
          type: TransactionType.EXPENSE, 
          userId: dbUserId, 
          tags: [], 
          applied: false, 
          createdAt: new Date() 
        },
        { 
          id: '2', 
          title: 'Transaction 2', 
          amount: new Prisma.Decimal(200), 
          type: TransactionType.INCOME, 
          userId: dbUserId, 
          tags: [], 
          applied: false, 
          createdAt: new Date() 
        },
      ];
      const mockCount = 2;

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      prismaService.transaction.count.mockResolvedValue(mockCount);

      // Execute
      const result = await service.findAll(userId, mockFilters);

      // Assert
      expect(usersService.findByClerkId).toHaveBeenCalledWith(userId);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: dbUserId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prismaService.transaction.count).toHaveBeenCalledWith({
        where: { userId: dbUserId },
      });
      expect(result).toEqual({
        data: mockTransactions,
        meta: {
          page: 1,
          limit: 10,
          total: mockCount,
          totalPages: 1,
        },
      });
    });

    it('should apply filters correctly', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };
      const mockFilters: TransactionFilterDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        type: 'EXPENSE',
        title: 'groceries',
        tags: ['food'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        applied: true,
      };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findMany.mockResolvedValue([]);
      prismaService.transaction.count.mockResolvedValue(0);

      // Execute
      await service.findAll(userId, mockFilters);

      // Assert
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: dbUserId,
          type: 'EXPENSE',
          title: {
            contains: 'groceries',
            mode: 'insensitive',
          },
          tags: {
            array_contains: ['food'],
          },
          createdAt: {
            gte: mockFilters.startDate,
            lte: mockFilters.endDate,
          },
          applied: true,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction if it exists', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const transactionId = 'transaction_id';
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };
      const mockTransaction = {
        id: transactionId,
        title: 'Transaction 1',
        amount: new Prisma.Decimal(100),
        type: TransactionType.EXPENSE,
        userId: dbUserId,
        tags: [],
        applied: false,
        createdAt: new Date()
      };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      // Execute
      const result = await service.findOne(userId, transactionId);

      // Assert
      expect(usersService.findByClerkId).toHaveBeenCalledWith(userId);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId, userId: dbUserId },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const transactionId = 'transaction_id';
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findUnique.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.findOne(userId, transactionId)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`)
      );
    });
  });

  describe('create', () => {
    it('should create and return a new transaction', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };
      const createDto: CreateTransactionDto = {
        title: 'New Transaction',
        amount: 150,
        type: TransactionType.EXPENSE,
        tags: ['food'],
        applied: false,
      };
      const mockCreatedTransaction = {
        id: 'new_transaction_id',
        title: createDto.title,
        amount: new Prisma.Decimal(createDto.amount),
        type: createDto.type,
        tags: createDto.tags || [],
        applied: createDto.applied !== undefined ? createDto.applied : false,
        userId: dbUserId,
        createdAt: new Date()
      };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.create.mockResolvedValue(mockCreatedTransaction);

      // Execute
      const result = await service.create(userId, createDto);

      // Assert
      expect(usersService.findByClerkId).toHaveBeenCalledWith(userId);
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          amount: createDto.amount,
          type: createDto.type,
          tags: createDto.tags,
          applied: createDto.applied,
          userId: dbUserId,
        },
      });
      expect(result).toEqual(mockCreatedTransaction);
    });
  });

  describe('delete', () => {
    it('should delete and return the deleted transaction', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const transactionId = 'transaction_id';
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };
      const mockTransaction = {
        id: transactionId,
        title: 'Transaction 1',
        amount: new Prisma.Decimal(100),
        type: TransactionType.EXPENSE,
        userId: dbUserId,
        tags: [],
        applied: false,
        createdAt: new Date()
      };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.transaction.delete.mockResolvedValue(mockTransaction);

      // Execute
      const result = await service.delete(userId, transactionId);

      // Assert
      expect(usersService.findByClerkId).toHaveBeenCalledWith(userId);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
      expect(prismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const transactionId = 'transaction_id';
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findUnique.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.delete(userId, transactionId)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`)
      );
    });

    it('should throw NotFoundException if transaction belongs to another user', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const dbUserId = 1;
      const anotherUserId = 2;
      const transactionId = 'transaction_id';
      const mockUser = { id: dbUserId, clerkUserId: userId, name: 'Test User', email: 'test@example.com' };
      const mockTransaction = {
        id: transactionId,
        title: 'Transaction 1',
        amount: 100,
        type: 'EXPENSE',
        userId: anotherUserId, // Different user ID
      };

      // Setup mocks
      usersService.findByClerkId.mockResolvedValue(mockUser);
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      // Execute & Assert
      await expect(service.delete(userId, transactionId)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`)
      );
    });
  });
});

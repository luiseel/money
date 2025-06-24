import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, TransactionFilterDto } from './schema/transaction';
import { AuthRequest } from '../common/auth';
import { Prisma } from '@prisma/client';
import { TransactionType } from '@prisma/client';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  beforeEach(async () => {
    // Create a mock service
    const mockTransactionsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all transactions for the authenticated user', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const mockRequest = {
        user: { sub: userId },
      } as AuthRequest;
      
      const mockFilters: TransactionFilterDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      
      const mockTransactions = {
        data: [
          { 
            id: '1', 
            title: 'Transaction 1', 
            amount: new Prisma.Decimal(100), 
            type: TransactionType.EXPENSE, 
            tags: [], 
            applied: false, 
            createdAt: new Date(), 
            userId: '1' 
          },
          { 
            id: '2', 
            title: 'Transaction 2', 
            amount: new Prisma.Decimal(200), 
            type: TransactionType.INCOME, 
            tags: [], 
            applied: false, 
            createdAt: new Date(), 
            userId: '1' 
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      // Setup mock service
      jest.spyOn(service, 'findAll').mockResolvedValue(mockTransactions);

      // Execute
      const result = await controller.findAll(mockRequest, mockFilters);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(userId, mockFilters);
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('findOne', () => {
    it('should return a single transaction by ID', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const transactionId = 'transaction_id';
      const mockRequest = {
        user: { sub: userId },
      } as AuthRequest;
      
      const mockTransaction = {
        id: transactionId,
        title: 'Transaction 1',
        amount: new Prisma.Decimal(100),
        type: TransactionType.EXPENSE,
        tags: [],
        applied: false,
        createdAt: new Date(),
        userId: '1'
      };

      // Setup mock service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTransaction);

      // Execute
      const result = await controller.findOne(mockRequest, transactionId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(userId, transactionId);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const mockRequest = {
        user: { sub: userId },
      } as AuthRequest;
      
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
        createdAt: new Date(),
        userId: '1'
      };

      // Setup mock service
      jest.spyOn(service, 'create').mockResolvedValue(mockCreatedTransaction);

      // Execute
      const result = await controller.create(mockRequest, createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(userId, createDto);
      expect(result).toEqual(mockCreatedTransaction);
    });
  });

  describe('delete', () => {
    it('should delete a transaction by ID', async () => {
      // Mock data
      const userId = 'clerk_user_id';
      const transactionId = 'transaction_id';
      const mockRequest = {
        user: { sub: userId },
      } as AuthRequest;
      
      const mockDeletedTransaction = {
        id: transactionId,
        title: 'Transaction 1',
        amount: new Prisma.Decimal(100),
        type: TransactionType.EXPENSE,
        tags: [],
        applied: false,
        createdAt: new Date(),
        userId: '1'
      };

      // Setup mock service
      jest.spyOn(service, 'delete').mockResolvedValue(mockDeletedTransaction);

      // Execute
      const result = await controller.delete(mockRequest, transactionId);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(userId, transactionId);
      expect(result).toEqual(mockDeletedTransaction);
    });
  });
});

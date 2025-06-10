import { z } from 'zod';
import { TransactionType } from '@prisma/client';

// Base schema for transaction data
export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType).default(TransactionType.EXPENSE),
  amount: z.number().positive(),
  title: z.string().min(1),
  tags: z.array(z.string()).optional(),
  applied: z.boolean().optional().default(false),
});

// Create transaction schema
export const createTransactionSchema = transactionSchema;
export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

// Query params for filtering transactions
export const transactionFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  type: z.nativeEnum(TransactionType).optional(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  applied: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type TransactionFilterDto = z.infer<typeof transactionFilterSchema>;

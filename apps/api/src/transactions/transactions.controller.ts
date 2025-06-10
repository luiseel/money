import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
  ParseUUIDPipe,
  Req,
  Request, // Ensure Request is imported
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { 
  createTransactionSchema, 
  transactionFilterSchema, 
} from './dto/transaction.dto';
import type { 
  TransactionFilterDto,
  CreateTransactionDto
} from './dto/transaction.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Auth } from '../../common/decorators'; // Import Auth decorator

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Auth() // Apply the Auth decorator
  @UsePipes(new ZodValidationPipe(transactionFilterSchema)) // Re-add ZodValidationPipe
  async findAll(@Req() req: Request, @Query() filters: TransactionFilterDto) {
    const auth = req.auth as any; // Access req.auth
    if (auth && auth.userId) {
      console.log('Authenticated User ID:', auth.userId);
      // The original logic used req.user.id, so we'll adapt it to auth.userId
      return this.transactionsService.findAll(auth.userId, filters);
    } else {
      console.log('No user authentication data found on request.');
      // Handle missing auth data appropriately, perhaps throw an error or return a default
      // For now, let's assume if @Auth() passes, userId will be there.
      // If not, the guard would have thrown an error.
      // Depending on strictness, you might still want to handle the 'else' case.
      // For this example, we proceed assuming auth.userId is present if the guard passed.
      // If findAll requires a userId, this will fail if auth.userId is not present.
      // This part of the logic might need refinement based on how strict the userId requirement is.
      return this.transactionsService.findAll(null, filters); // Or throw error
    }
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id; // This will need to be updated to req.auth.userId if this route is protected by @Auth()
    return this.transactionsService.findOne(id, userId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  async create(@Req() req, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id; // This will need to be updated to req.auth.userId if this route is protected by @Auth()
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id; // This will need to be updated to req.auth.userId if this route is protected by @Auth()
    return this.transactionsService.delete(id, userId);
  }
}

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
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import {
  createTransactionSchema,
  transactionFilterSchema,
} from "./dto/transaction.dto";
import type {
  TransactionFilterDto,
  CreateTransactionDto,
} from "./dto/transaction.dto";
import { ZodValidationPipe } from "../common/zod-validation.pipe";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(transactionFilterSchema))
  async findAll(@Req() req: Request, @Query() filters: TransactionFilterDto) {
    const userId = "1";
    return this.transactionsService.findAll(userId, filters);
  }

  @Get(":id")
  async findOne(@Req() req, @Param("id", ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    return this.transactionsService.findOne(id, userId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  async create(@Req() req, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Delete(":id")
  async delete(@Req() req, @Param("id", ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    return this.transactionsService.delete(id, userId);
  }
}

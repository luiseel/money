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
  UseGuards,
  Logger,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import {
  createTransactionSchema,
  transactionFilterSchema,
} from "./schema/transaction";
import type {
  TransactionFilterDto,
  CreateTransactionDto,
} from "./schema/transaction";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthRequest } from "../common/auth";

@UseGuards(JwtAuthGuard)
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(transactionFilterSchema))
  async findAll(
    @Req() req: AuthRequest,
    @Query() filters: TransactionFilterDto,
  ) {
    const userId = req.user?.sub;
    return this.transactionsService.findAll(userId, filters);
  }

  @Get(":id")
  async findOne(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const userId = req.user?.sub;
    return this.transactionsService.findOne(userId, id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  async create(
    @Req() req: AuthRequest,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const userId = req.user?.sub;
    Logger.log(userId);
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Delete(":id")
  async delete(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const userId = req.user?.sub;
    return this.transactionsService.delete(userId, id);
  }
}

import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}

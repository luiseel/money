import { Module } from "@nestjs/common";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { AuthModule } from "./auth/auth.module";
import { UsersController } from "./users/users.controller";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [PrismaModule, TransactionsModule, AuthModule, UsersModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}

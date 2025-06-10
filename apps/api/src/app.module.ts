import { Module } from "@nestjs/common";
import { ClerkModule } from "@clerk/clerk-sdk-node/nest";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [
    PrismaModule,
    TransactionsModule,
    ClerkModule.forRootAsync({
      imports: [],
      useFactory: () => ({
        secretKey: process.env.CLERK_SECRET_KEY,
      }),
      inject: [],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

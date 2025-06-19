import { Module } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
  imports: [],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './strategies/fortyTwo.strategy';
import { UserModule } from "../user/user.module";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [UserModule, JwtModule],
  exports: [JwtService, AuthService],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, JwtStrategy, JwtService],
})
export class AuthModule {}

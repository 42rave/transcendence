import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './strategies/fortyTwo.strategy';
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [UserModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy],
})
export class AuthModule {}

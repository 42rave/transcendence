import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { FortyTwoStrategy } from '@strategy/fortyTwo.strategy';
import { UserModule } from '@user/user.module';
import { JwtStrategy } from '@strategy/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TotpStrategy } from '@strategy/totp.strategy';
import { DeviceController } from './device/device.controller';
import { DeviceService } from './device/device.service';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
	imports: [UserModule, JwtModule, PrismaModule],
	exports: [JwtService, AuthService],
	controllers: [AuthController, DeviceController],
	providers: [AuthService, FortyTwoStrategy, JwtStrategy, JwtService, TotpStrategy, DeviceService]
})
export class AuthModule {}

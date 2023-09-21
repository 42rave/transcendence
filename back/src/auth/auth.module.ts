import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { FortyTwoStrategy } from '@strategy/fortyTwo.strategy';
import { UserModule } from '@user/user.module';
import { JwtStrategy } from '@strategy/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [UserModule, JwtModule],
	exports: [JwtService, AuthService],
	controllers: [AuthController],
	providers: [AuthService, FortyTwoStrategy, JwtStrategy, JwtService]
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DeviceService } from '@auth/device/device.service';

@Module({
	imports: [PrismaModule],
	controllers: [UserController],
	providers: [DeviceService, UserService],
	exports: [UserService]
})
export class UserModule {}

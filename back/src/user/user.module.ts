import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DeviceService } from '@auth/device/device.service';
import { ChatModule } from '@chat/chat.module';
import { StatusModule } from './status/status.module';

@Module({
	imports: [PrismaModule, ChatModule, StatusModule],
	controllers: [UserController],
	providers: [DeviceService, UserService],
	exports: [UserService]
})
export class UserModule {}

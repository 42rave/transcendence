import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '@auth/auth.module';
import { ChannelController } from '@chat/channel/channel.controller';
import { MessageController } from '@chat/channel/message/message.controller';
import { ChannelService } from '@chat/channel/channel.service';
import { MessageService } from '@chat/channel/message/message.service';

@Module({
	imports: [AuthModule, PrismaModule],
	controllers: [ChatController, ChannelController, MessageController],
	providers: [ChatGateway, ChatService, ChannelService, MessageService]
})
export class ChatModule {}

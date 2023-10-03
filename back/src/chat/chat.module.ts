import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '@auth/auth.module';
import { ChannelController } from '@chat/channel/channel.controller';
import { MessageController } from '@chat/message/message.controller';
import { PrivmsgController } from '@chat/privmsg/privmsg.controller';
import { ChannelService } from '@chat/channel/channel.service';
import { MessageService } from '@chat/message/message.service';
import { PrivmsgService } from '@chat/privmsg/privmsg.service';

@Module({
	imports: [AuthModule, PrismaModule],
	controllers: [ChatController, ChannelController, MessageController, PrivmsgController],
	providers: [ChatGateway, ChatService, ChannelService, MessageService, PrivmsgService]
})
export class ChatModule {}

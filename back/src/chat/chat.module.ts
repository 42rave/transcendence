import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { SocialService } from './social.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '@auth/auth.module';
import { ChannelController } from '@chat/channel/channel.controller';
import { MessageController } from '@chat/message/message.controller';
import { PrivmsgController } from '@chat/privmsg/privmsg.controller';
import { UserService } from '@user/user.service';
import { ChannelService } from '@chat/channel/channel.service';
import { MessageService } from '@chat/message/message.service';
import { PrivmsgService } from '@chat/privmsg/privmsg.service';
import { StatusModule } from '@user/status/status.module';

@Module({
	imports: [AuthModule, PrismaModule, StatusModule],
	controllers: [ChatController, ChannelController, MessageController, PrivmsgController],
	providers: [ChatGateway, SocialService, ChannelService, MessageService, PrivmsgService, UserService],
	exports: [SocialService]
})
export class ChatModule {}

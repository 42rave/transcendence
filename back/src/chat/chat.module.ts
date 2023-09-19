import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from "@auth/auth.module";
import { ChannelModule } from './channel/channel.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  imports: [AuthModule, ChannelModule, PrismaModule],
})
export class ChatModule {}

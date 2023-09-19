import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { MessageService } from './message/message.service';
import { MessageController } from './message/message.controller';

@Module({
  imports: [PrismaModule],
  providers: [ChannelService, MessageService],
  controllers: [ChannelController, MessageController],
})
export class ChannelModule {}

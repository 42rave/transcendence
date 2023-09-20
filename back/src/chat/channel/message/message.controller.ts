import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessageService } from '@chat/channel/message/message.service';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import type { Request } from '@type/request';
import { MessageDto } from '@type/message.dto';
import { IsInChannelGuard } from '@guard/isInChannel.guard';

@Controller('chat/channel/:id/message')
@UseGuards(...AuthenticatedGuard, IsInChannelGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getMessages(
    @Param('id', ParseIntPipe) channelId: number,
    @Req() req: Request,
  ): Promise<Message[]> {
    return await this.messageService.getMessages(channelId, req.pagination);
  }

  @Post()
  async sendMessage(
    @Req() req: Request,
    @Param('id', ParseIntPipe) channelId: number,
    @Body() data: MessageDto,
  ): Promise<Message> {
    return await this.messageService.sendMessage(req.user.id, channelId, data);
  }
}

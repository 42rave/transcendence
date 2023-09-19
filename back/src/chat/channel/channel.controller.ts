import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  ValidationPipe,
  UseGuards,
  UsePipes,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { ChannelDto } from '@type/channel.dto';
import type { Request } from '@type/request';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { ChannelService } from './channel.service';
import { Channel, ChannelConnection } from '@prisma/client';
import { IsInChannelGuard } from '@guard/isInChannel.guard';

@Controller('chat/channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  @UseGuards(...AuthenticatedGuard)
  async getAll(): Promise<Channel[]> {
    return await this.channelService.getAll();
  }

  @Get('connection')
  @UseGuards(...AuthenticatedGuard)
  async getAllChannelConnections(): Promise<ChannelConnection[]> {
    return await this.channelService.getAllChannelConnections();
  }

  @Get(':id/connection')
  @UseGuards(...AuthenticatedGuard, IsInChannelGuard)
  async getChannelConnection(
    @Param('id', ParseIntPipe) channelId: number,
  ): Promise<ChannelConnection[]> {
    return await this.channelService.getChannelConnections(channelId);
  }

  @Post('join')
  @UseGuards(...AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async join(@Req() req: Request, @Body() data: ChannelDto) {
    return await this.channelService.join(req.user, data);
  }
}

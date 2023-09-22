import {
	Controller,
	Get,
	Post,
	Req,
	Body,
	UseGuards,
	Param,
	ParseIntPipe,
	ValidationPipe,
	UsePipes
} from '@nestjs/common';

import { ChannelCreationDto } from '@type/channel.dto';
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
	async getAll(@Req() req: Request): Promise<Channel[]> {
		return await this.channelService.getAll(req.pagination);
	}

	@Get('connection')
	@UseGuards(...AuthenticatedGuard)
	async getAllChannelConnections(): Promise<ChannelConnection[]> {
		return await this.channelService.getAllChannelConnections();
	}

	@Get(':id/connection')
	@UseGuards(...AuthenticatedGuard, IsInChannelGuard)
	async getChannelConnection(@Param('id', ParseIntPipe) channelId: number): Promise<ChannelConnection[]> {
		return await this.channelService.getChannelConnections(channelId);
	}

	@Post(':id/join')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async join(@Param('id', ParseIntPipe) channelId: number, @Req() req: Request, password: string) {
		return await this.channelService.join(req.user, channelId, password);
	}

	@Post(':id/quit')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async quit(@Param('id', ParseIntPipe) channelId: number, @Req() req: Request) {
		return await this.channelService.quit(req.user, channelId);
	}

	@Post(':id/invite/:userid')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async invite(
		@Param('id', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userid', ParseIntPipe) userId: number
	) {
		return await this.channelService.invite(req.user, channelId, userId);
	}

	@Post(':id/kick/:userid')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async kick(
		@Param('id', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userid', ParseIntPipe) userId: number
	) {
		return await this.channelService.kick(req.user, channelId, userId);
	}

	@Post(':id/ban/:userid')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async ban(
		@Param('id', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userid', ParseIntPipe) userId: number
	) {
		return await this.channelService.ban(req.user, channelId, userId);
	}

	@Post()
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async create(@Req() req: Request, @Body() data: ChannelCreationDto) {
		return await this.channelService.createChannel(req.user, data);
	}
}

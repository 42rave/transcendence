import {
	Controller,
	Get,
	Post,
	Patch,
	Req,
	Body,
	UseGuards,
	Param,
	ParseIntPipe,
	ValidationPipe,
	UsePipes
} from '@nestjs/common';

import { ChannelCreationDto, ChannelDto } from '@type/channel.dto';
import type { Request } from '@type/request';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { ChannelService } from './channel.service';
import { Channel, ChannelConnection } from '@prisma/client';
import { IsInChannelGuard } from '@guard/isInChannel.guard';
import { IsOwnerGuard } from '@guard/isOwner.guard';
import { IsAdminGuard } from '@guard/isAdmin.guard';

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

	@Patch(':channelId')
	@UseGuards(...AuthenticatedGuard, IsOwnerGuard)
	@UsePipes(new ValidationPipe())
	async updateChannel(
		@Req() req: Request,
		@Param('channelId', ParseIntPipe) channelId: number,
		@Body() data: ChannelDto
	): Promise<Channel> {
		return await this.channelService.updateChannel(req.user.id, channelId, data);
	}

	@Get(':channelId/connection')
	@UseGuards(...AuthenticatedGuard, IsInChannelGuard)
	async getChannelConnection(@Param('channelId', ParseIntPipe) channelId: number): Promise<ChannelConnection[]> {
		return await this.channelService.getChannelConnections(channelId);
	}

	@Post(':channelId/join')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async join(@Param('channelId', ParseIntPipe) channelId: number, @Req() req: Request, password: string) {
		return await this.channelService.join(req.user, channelId, password);
	}

	@Post(':channelId/quit')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async quit(@Param('channelId', ParseIntPipe) channelId: number, @Req() req: Request) {
		return await this.channelService.quit(req.user, channelId);
	}

	@Post(':channelId/invite/:userId')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async invite(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userId', ParseIntPipe) userId: number
	) {
		return await this.channelService.invite(req.user, channelId, userId);
	}

	@Post(':channelId/kick/:userId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(new ValidationPipe())
	async kick(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userId', ParseIntPipe) userId: number
	) {
		return await this.channelService.kick(req.user, channelId, userId);
	}

	@Post(':channelId/ban/:userId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(new ValidationPipe())
	async ban(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userId', ParseIntPipe) userId: number
	) {
		return await this.channelService.ban(req.user, channelId, userId);
	}

	@Post(':channelId/transfer/:userId')
	@UseGuards(...AuthenticatedGuard, IsOwnerGuard)
	@UsePipes(new ValidationPipe())
	async transfer(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userId', ParseIntPipe) userId: number
	) {
		return await this.channelService.transfer(req.user, channelId, userId);
	}

	@Post(':channelId/promote/:userId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(new ValidationPipe())
	async promote(
		@Param('channelId', ParseIntPipe) targetChannelId: number,
		@Req() req: Request,
		@Param('userId', ParseIntPipe) userId: number
	) {
		return await this.channelService.promote(req.user, targetChannelId, userId);
	}
	@Post(':channelId/demote/:userId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(new ValidationPipe())
	async demote(
		@Param('channelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('userId', ParseIntPipe) userId: number
	) {
		return await this.channelService.demote(req.user, channelId, userId);
	}

	@Post()
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async create(@Req() req: Request, @Body() data: ChannelCreationDto) {
		return await this.channelService.createChannel(req.user, data);
	}
}

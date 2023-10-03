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

import { ChannelCreationDto, ChannelDto, ChannelPasswordDto } from '@type/channel.dto';
import type { Request } from '@type/request';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { ChannelService } from './channel.service';
import { Channel, ChannelConnection } from '@prisma/client';
import { IsInChannelGuard } from '@guard/isInChannel.guard';
import { IsOwnerGuard } from '@guard/isOwner.guard';
import { IsAdminGuard } from '@guard/isAdmin.guard';
import { IsChannelGuard } from '@guard/isChannel.guard';
import { IsUserSocketGuard } from '@guard/isUserSocket.guard';

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
	async getAllChannelConnections(@Req() req: Request): Promise<ChannelConnection[]> {
		return await this.channelService.getAllUserChannelConnections(req.user.id);
	}

	@Patch(':targetChannelId')
	@UseGuards(...AuthenticatedGuard, IsOwnerGuard)
	@UsePipes(ValidationPipe)
	async updateChannel(
		@Req() req: Request,
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Body() data: ChannelDto
	): Promise<Channel> {
		return await this.channelService.updateChannel(req.user.id, channelId, data);
	}

	@Get(':targetChannelId/connection')
	@UseGuards(...AuthenticatedGuard, IsInChannelGuard)
	async getChannelConnection(@Param('targetChannelId', ParseIntPipe) channelId: number): Promise<ChannelConnection[]> {
		return await this.channelService.getChannelConnections(channelId);
	}

	@Post(':targetChannelId/join')
	@UseGuards(...AuthenticatedGuard, IsChannelGuard, IsUserSocketGuard)
	@UsePipes(ValidationPipe)
	async join(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Body() data: ChannelPasswordDto
	) {
		return await this.channelService.join(req.user, channelId, data.password, data.socketId);
	}

	@Post(':targetChannelId/quit')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(ValidationPipe)
	async quit(@Param('targetChannelId', ParseIntPipe) channelId: number, @Req() req: Request) {
		return await this.channelService.quit(req.user, channelId);
	}

	@Post(':targetChannelId/invite/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsChannelGuard, IsAdminGuard)
	@UsePipes(ValidationPipe)
	async invite(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number
	) {
		return await this.channelService.invite(req.user, channelId, targetUserId);
	}

	@Post(':targetChannelId/kick/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(ValidationPipe)
	async kick(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number
	) {
		return await this.channelService.kick(req.user, channelId, targetUserId);
	}

	@Post(':targetChannelId/ban/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(ValidationPipe)
	async ban(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number
	) {
		return await this.channelService.ban(req.user, channelId, targetUserId);
	}

	@Post(':targetChannelId/transfer/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsOwnerGuard)
	@UsePipes(ValidationPipe)
	async transfer(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number
	) {
		return await this.channelService.transfer(req.user, channelId, targetUserId);
	}

	@Post(':targetChannelId/promote/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(ValidationPipe)
	async promote(
		@Param('targetChannelId', ParseIntPipe) targetChannelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number
	) {
		return await this.channelService.promote(req.user, targetChannelId, targetUserId);
	}

	@Post(':targetChannelId/demote/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(ValidationPipe)
	async demote(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number
	) {
		return await this.channelService.demote(req.user, channelId, targetUserId);
	}

	@Post(':targetChannelId/mute/:targetUserId')
	@UseGuards(...AuthenticatedGuard, IsAdminGuard)
	@UsePipes(ValidationPipe)
	async mute(
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Req() req: Request,
		@Param('targetUserId', ParseIntPipe) targetUserId: number,
		@Body() muteTime: Date
	) {
		return await this.channelService.mute(req.user, channelId, targetUserId, muteTime);
	}

	@Post()
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(ValidationPipe)
	async create(@Req() req: Request, @Body() data: ChannelCreationDto) {
		return await this.channelService.createChannel(req.user, data);
	}
}

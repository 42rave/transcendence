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
import type { Request } from '@type/request';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { PrivmsgService } from './privmsg.service';
import { Channel } from '@prisma/client';
import { IsPrivmsgGuard } from '@guard/isPrivmsg.guard';
import { IsNotBlockedGuard } from '@guard/isNotBlocked.guard';
import { ChannelPasswordDto } from '@type/channel.dto';

@Controller('chat/privmsg')
export class PrivmsgController {
	constructor(private readonly privmsgService: PrivmsgService) {}

	@Get()
	@UseGuards(...AuthenticatedGuard)
	async getAll(@Req() req: Request): Promise<Channel[]> {
		return await this.privmsgService.getAll(req.pagination);
	}

	@Post(':privmsgId/join')
	@UseGuards(...AuthenticatedGuard, IsPrivmsgGuard)
	@UsePipes(ValidationPipe)
	async join(@Param('privmsgId', ParseIntPipe) privmsgId: number, @Req() req: Request, @Body() data: ChannelPasswordDto) {
		return await this.privmsgService.join(req.user, privmsgId, data.socketId);
	}

	@Post(':privmsgId/send')
	@UseGuards(...AuthenticatedGuard, IsPrivmsgGuard, IsNotBlockedGuard)
	@UsePipes(ValidationPipe)
	async send(@Param('privmsgId', ParseIntPipe) privmsgId: number, @Req() req: Request, @Body() data) {
		return await this.privmsgService.send(req.user, privmsgId, data);
	}
}

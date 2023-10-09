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
import { IsPrivmsgGuard } from '@guard/isPrivmsg.guard';
import { IsUserSocketGuard } from '@guard/isUserSocket.guard';
import { ChannelPasswordDto } from '@type/channel.dto';

@Controller('chat/privmsg')
export class PrivmsgController {
	constructor(private readonly privmsgService: PrivmsgService) {}

	/* This returns an object {
	 * name: NameThatShouldBeDisplayedForChannel
	 * channel: Channel
	 */
	@Get()
	@UseGuards(...AuthenticatedGuard)
	async getAll(@Req() req: Request) {
		return await this.privmsgService.getAll(req.user.id);
	}

	@Post(':privmsgId/join')
	@UseGuards(...AuthenticatedGuard, IsPrivmsgGuard, IsUserSocketGuard)
	@UsePipes(ValidationPipe)
	async join(
		@Param('privmsgId', ParseIntPipe) privmsgId: number,
		@Req() req: Request,
		@Body() data: ChannelPasswordDto
	) {
		return await this.privmsgService.join(req.user, privmsgId, data.socketId);
	}
}

import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessageService } from '@chat/message/message.service';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import type { Request } from '@type/request';
import { MessageDto } from '@type/message.dto';
import { IsNotMutedGuard } from '@guard/isNotMuted.guard';
import { IsInChannelGuard } from '@guard/isInChannel.guard';

@Controller('chat/channel/:id/message')
@UseGuards(...AuthenticatedGuard)
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Get()
	@UseGuards(IsInChannelGuard)
	async getMessages(@Param('id', ParseIntPipe) channelId: number): Promise<Message[]> {
		return this.messageService.getMessages(channelId);
	}

	@Post()
	@UseGuards(IsNotMutedGuard)
	@UsePipes(ValidationPipe)
	async sendMessage(
		@Req() req: Request,
		@Param('targetChannelId', ParseIntPipe) channelId: number,
		@Body() data: MessageDto
	): Promise<Message> {
		return await this.messageService.sendMessage(req.user.id, channelId, data);
	}
}

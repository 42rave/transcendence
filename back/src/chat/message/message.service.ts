import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { MessageDto } from '@type/message.dto';
import { Message } from '@prisma/client';
import { PaginationDto } from '@type/pagination.dto';
import { ChatService } from '@chat/chat.service';

@Injectable()
export class MessageService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly chatService: ChatService
	) {}

	async getMessages(channelId: number, pagination: PaginationDto) {
		return await this.prismaService.message.findMany({
			where: { channelId },
			include: { user: true, channel: true },
			...pagination
		});
	}

	async sendMessage(userId: number, channelId: number, data: MessageDto): Promise<Message> {
		const message: Message = await this.prismaService.message.create({
			data: {
				body: data.body,
				userId,
				channelId
			}
		});
		this.chatService.emit('chat:message', message, `${channelId}`);
		return message;
	}
}

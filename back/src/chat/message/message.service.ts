import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { MessageDto } from '@type/message.dto';
import { Message } from '@prisma/client';
import { SocialService } from '@chat/social.service';

@Injectable()
export class MessageService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly socialService: SocialService
	) {}

	async getMessages(channelId: number) {
		return await this.prismaService.message.findMany({
			where: { channelId },
			include: { user: true, channel: true }
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
		this.socialService.emit('chat:message', message, `${channelId}`);
		return message;
	}
}

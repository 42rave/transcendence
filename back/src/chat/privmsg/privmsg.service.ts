import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationDto } from '@type/pagination.dto';
import { Channel, User, Relationship, RelationKind, ChannelRole, ChannelKind } from '@prisma/client';
import { ChatService } from '@chat/chat.service';

@Injectable()
export class PrivmsgService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly chatService: ChatService
	) {}

	async getAll(pagination: PaginationDto): Promise<Channel[]> {
		return await this.prisma.channel.findMany(pagination);
	}

	async join(user: User, privmsgId: number, socketId: string): Promise<Channel> {
		let lowUserId, highUserId;
		if (user.id > privmsgId) {
			lowUserId = privmsgId;
			highUserId = user.id;
		} else {
			lowUserId = user.id;
			highUserId = privmsgId;
		}
		let convName = lowUserId.toString() + '-' + highUserId.toString();
		const privConv = await this.prisma.channel.findUnique({
			where: { name: convName },
			include: { channelConnection: true }
		});
		if (privConv) {
			return privConv
		}
		return await this.prisma.channel.create({
			data: {
				name: convName,
				kind: ChannelKind.DIRECT,
				channelConnection: {
					create: [
						{ userId: lowUserId, role: ChannelRole.DEFAULT}, 
						{ userId: highUserId, role: ChannelRole.DEFAULT}, 
					]}
			}
		})
		.catch(() => {
			throw new BadRequestException('Cannot create conversation', {
				description: 'Your partner is not online'
			});
		});
		this.chatService.emitToUser
		return null;
	}

	async send(sender: User, privmsgId: number, data) {}

	async getBlockedRelation(userdId: number, privmsgId: number): Promise<Relationship> {
		const relationship = await this.prisma.relationship.findFirst({
			where: {
				AND: [
					{
						OR: [
							{ AND: [{ senderId: userdId }, { receiverId: privmsgId }] },
							{ AND: [{ receiverId: userdId }, { senderId: privmsgId }] }
						]
					},
					{ kind: RelationKind.BLOCKED }
				]
			}
		});
		return relationship;
	}

	async isPossiblePrivmsg(userId: number, privmsgId: number): Promise<boolean> {
		return userId > 0 && privmsgId > 0;
	}
}

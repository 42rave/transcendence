import { Injectable, BadRequestException } from '@nestjs/common';
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
		return await this.prisma.channel.findMany({
			where: { kind: ChannelKind.DIRECT, ...pagination }
			});
	}

	async join(user: User, privmsgId: number, socketId: string): Promise<Channel> {
		const [lowUserId, highUserId] = user.id > privmsgId ? [privmsgId, user.id] : [user.id, privmsgId];
		const convName = `${lowUserId}-${highUserId}`;
		const privConv = await this.prisma.channel.findUnique({
			where: { name: convName },
			include: { channelConnection: true }
		});
		if (privConv) {
			return privConv;
		}
		return await this.prisma.channel
			.create({
				data: {
					name: convName,
					kind: ChannelKind.DIRECT,
					channelConnection: {
						create: [
							{ userId: lowUserId, role: ChannelRole.DEFAULT },
							{ userId: highUserId, role: ChannelRole.DEFAULT }
						]
					}
				}
			})
			.catch(() => {
				throw new BadRequestException('Cannot create conversation', {
					description: 'Your partner is not online'
				});
			});
		//TODO: Define a new even for privmsg
		void socketId;
		return null;
	}

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

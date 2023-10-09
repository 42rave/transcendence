import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { SocialService } from '@chat/social.service';
import { Channel, User, Relationship, RelationKind, ChannelRole, ChannelKind } from '@prisma/client';

@Injectable()
export class PrivmsgService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly socialService: SocialService
	) {}

	async getAll(userId: number) {
		return (
			await this.prisma.channel.findMany({
				where: {
					AND: [{ kind: ChannelKind.DIRECT }, { channelConnection: { some: { userId: userId } } }]
				},
				include: {
					channelConnection: {
						include: {
							user: true
						}
					}
				}
			})
		).map((channels) => ({
			name:
				channels.channelConnection[0].userId === userId
					? channels.channelConnection[1].user.username
					: channels.channelConnection[0].user.username,
			channel: channels
		}));
	}

	async join(user: User, privmsgId: number, socketId: string): Promise<Channel> {
		const [lowUserId, highUserId] = user.id > privmsgId ? [privmsgId, user.id] : [user.id, privmsgId];
		const convName = `${lowUserId}-${highUserId}`;
		const channel = await this.prisma.channel
			.upsert({
				where: { name: convName },
				update: {},
				create: {
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

		this.socialService.joinRoom(socketId, channel.id.toString());
		this.socialService.emit('privmsg:create', channel);
		return channel;
	}

	async getBlockedRelation(userdId: number, privmsgId: number): Promise<Relationship> {
		return this.prisma.relationship.findFirst({
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
	}

	async isPossiblePrivmsg(userId: number, privmsgId: number): Promise<boolean> {
		return userId > 0 && privmsgId > 0;
	}
}

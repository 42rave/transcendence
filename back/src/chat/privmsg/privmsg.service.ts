import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Channel, User, Relationship, RelationKind, ChannelRole, ChannelKind } from '@prisma/client';

@Injectable()
export class PrivmsgService {
	constructor(private readonly prisma: PrismaService) {}

	async getAll(userId: number): Promise<Channel[]> {
		return this.prisma.channel.findMany({
			where: {
				AND: [{ kind: ChannelKind.DIRECT }, { channelConnection: { some: { userId: userId } } }]
			}
		});
	}

	async join(user: User, privmsgId: number, socketId: string): Promise<Channel> {
		const [lowUserId, highUserId] = user.id > privmsgId ? [privmsgId, user.id] : [user.id, privmsgId];
		const convName = `${lowUserId}-${highUserId}`;
		return this.prisma.channel
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

		void socketId;
		//TODO: Define a new even for privmsg
		// return null;
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

import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationDto } from '@type/pagination.dto';
import { Channel, User, Relationship, RelationKind } from '@prisma/client';
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

	async join(user: User, privmsgId: number): Promise<Channel> {
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

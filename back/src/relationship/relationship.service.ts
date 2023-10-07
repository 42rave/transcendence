import { Injectable, BadRequestException } from '@nestjs/common';
import { Relationship, RelationKind } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class RelationshipService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: number): Promise<Relationship[]> {
		return this.prisma.relationship.findMany({
			where: { senderId: userId }
		});
	}

	async getAllFriends(userId: number): Promise<Relationship[]> {
		return this.prisma.relationship.findMany({
			where: {
				AND: [{ senderId: userId }, { kind: RelationKind.FRIEND }]
			},
			include: { receiver: true }
		});
	}

	async getAllBlocked(userId: number): Promise<Relationship[]> {
		return this.prisma.relationship.findMany({
			where: {
				AND: [{ senderId: userId }, { kind: RelationKind.BLOCKED }]
			},
			include: { receiver: true }
		});
	}

	async getStatus(userId: number, targetId: number): Promise<Relationship> {
		return this.prisma.relationship.findUnique({
			where: { relationshipId: { senderId: userId, receiverId: targetId } }
		});
	}

	async add(userId: number, targetId: number): Promise<Relationship> {
		if (userId === targetId) {
			throw new BadRequestException('Cannot add user as friend', {
				description: 'You are you own friend <3'
			});
		}
		return await this.prisma.relationship
			.upsert({
				where: {
					relationshipId: { senderId: userId, receiverId: targetId }
				},
				create: {
					senderId: userId,
					receiverId: targetId,
					kind: RelationKind.FRIEND
				},
				update: { kind: RelationKind.FRIEND },
				include: { receiver: true }
			})
			.catch(() => {
				throw new BadRequestException('Cannot add user as friend', {
					description: 'user does not exist'
				});
			});
	}

	async block(userId: number, targetId: number): Promise<Relationship> {
		if (userId === targetId) {
			throw new BadRequestException('Cannot block user', {
				description: "Come on... you're not that bad"
			});
		}
		return await this.prisma.relationship
			.upsert({
				where: {
					relationshipId: { senderId: userId, receiverId: targetId }
				},
				create: {
					senderId: userId,
					receiverId: targetId,
					kind: RelationKind.BLOCKED
				},
				update: { kind: RelationKind.BLOCKED },
				include: { receiver: true }
			})
			.catch(() => {
				throw new BadRequestException('Cannot block user', {
					description: 'user does not exist'
				});
			});
	}

	async remove(userId: number, targetId: number): Promise<Relationship> {
		if (userId === targetId) {
			throw new BadRequestException('Cannot remove yourself', {
				description: "It's just a tough time, keep smiling!"
			});
		}
		return await this.prisma.relationship
			.delete({
				where: {
					relationshipId: { senderId: userId, receiverId: targetId }
				},
				include: { receiver: true }
			})
			.catch(() => {
				throw new BadRequestException('Cannot remove relationship', {
					description: 'no relationship to remove'
				});
			});
	}
}

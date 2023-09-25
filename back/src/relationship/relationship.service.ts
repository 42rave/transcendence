import { Injectable, BadRequestException } from '@nestjs/common';
import { Relationship, RelationKind } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class RelationshipService {
	constructor(private prisma: PrismaService) {}

	async getAll(userId: number): Promise<Relationship[]> {
		return await this.prisma.relationship.findMany({
			where: { senderId: userId }
		});
	}

	async getAllFriends(userId: number): Promise<Relationship[]> {
		return await this.prisma.relationship.findMany({
			where: {
				AND: [{ senderId: userId }, { kind: RelationKind.FRIEND }]
			}
		});
	}

	async getAllBlocked(userId: number): Promise<Relationship[]> {
		return await this.prisma.relationship.findMany({
			where: {
				AND: [{ senderId: userId }, { kind: RelationKind.BLOCKED }]
			}
		});
	}

	async getStatus(userId: number, targetId: number): Promise<Relationship> {
		return await this.prisma.relationship.findUnique({
			where: { relationshipId: { senderId: userId, receiverId: targetId } }
		});
	}

	async add(userId: number, targetId: number): Promise<Relationship> {
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
				update: { kind: RelationKind.FRIEND }
			})
			.catch(() => {
				throw new BadRequestException('Cannot add user as friend', {
					description: 'user does not exist'
				});
			});
	}

	async block(userId: number, targetId: number): Promise<Relationship> {
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
				update: { kind: RelationKind.BLOCKED }
			})
			.catch(() => {
				throw new BadRequestException('Cannot block user', {
					description: 'user does not exist'
				});
			});
	}

	async remove(userId: number, targetId: number): Promise<Relationship> {
		return await this.prisma.relationship
			.delete({
				where: {
					relationshipId: { senderId: userId, receiverId: targetId }
				}
			})
			.catch(() => {
				throw new BadRequestException('Cannot remove relationship', {
					description: 'no relationship to remove'
				});
			});
	}
}

import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';

import { Channel, User, ChannelConnection, ChannelKind, ChannelRole } from '@prisma/client';

import { PrismaService } from '@prisma/prisma.service';
import { PaginationDto } from '@type/pagination.dto';
import { ChannelCreationDto, ChannelDto } from '@type/channel.dto';
import { ChatService } from '@chat/chat.service';

@Injectable()
export class ChannelService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly chatService: ChatService
	) {}

	async getAll(pagination: PaginationDto): Promise<Channel[]> {
		return await this.prisma.channel.findMany(pagination);
	}

	async getAllChannelConnections(): Promise<ChannelConnection[]> {
		return await this.prisma.channelConnection.findMany();
	}

	async getChannelConnection(userId: number, channelId: number): Promise<ChannelConnection> {
		return await this.prisma.channelConnection.findUnique({
			where: { connectionId: { userId: userId, channelId } }
		});
	}

	async getChannelConnections(channelId: number): Promise<ChannelConnection[]> {
		return await this.prisma.channelConnection.findMany({
			where: { channelId }
		});
	}

	async isUserInChannel(userId: number, channelId: number): Promise<boolean> {
		const channelConnection = await this.getChannelConnection(userId, channelId);
		return !(
			!channelConnection ||
			channelConnection.role === ChannelRole.INVITED ||
			channelConnection.role === ChannelRole.BANNED
		);
	}

	async isUserOwnerInChannel(targetUserId: number, targetChannelId: number): Promise<boolean> {
		const channelConnection = await this.prisma.channelConnection.findFirst({
			where: {
				AND: [{ userId: targetUserId }, { channelId: targetChannelId }, { role: ChannelRole.OWNER }]
			}
		});
		return !!channelConnection;
	}

	async isUserAdminInChannel(targetUserId: number, targetChannelId: number): Promise<boolean> {
		const channelConnection = await this.prisma.channelConnection.findFirst({
			where: {
				AND: [
					{ userId: targetUserId },
					{ channelId: targetChannelId },
					{
						OR: [{ role: ChannelRole.OWNER }, { role: ChannelRole.ADMIN }]
					}
				]
			}
		});
		return !!channelConnection;
	}

	async isExistingChannel(targetChannelId: number): Promise<boolean> {
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId }
		});
		return !!channel
	}

	isUserOwner(userId: number, channelConnectionList: ChannelConnection[]): boolean {
		let res: boolean = false;
		channelConnectionList.forEach((channelConnection) => {
			if (channelConnection.userId === userId && channelConnection.role === ChannelRole.OWNER) res = true;
		});
		return res;
	}

	isUserAdmin(userId: number, channelConnectionList: ChannelConnection[]): boolean {
		let res: boolean = false;
		channelConnectionList.forEach((channelConnection) => {
			if (
				channelConnection.userId === userId &&
				(channelConnection.role === ChannelRole.ADMIN || channelConnection.role === ChannelRole.OWNER)
			) {
				res = true;
			}
		});
		return res;
	}

	isUserConnected(userId: number, channelConnectionList: ChannelConnection[]): boolean {
		let res: boolean = false;
		channelConnectionList.forEach((channelConnection) => {
			if (
				channelConnection.userId === userId &&
				(channelConnection.role === ChannelRole.ADMIN ||
					channelConnection.role === ChannelRole.OWNER ||
					channelConnection.role === ChannelRole.DEFAULT)
			) {
				res = true;
			}
		});
		return res;
	}

	userHasExistingConnection(
		userId: number,
		targetChannel: number,
		channelConnectionList: ChannelConnection[]
	): boolean {
		let res: boolean = false;
		channelConnectionList.forEach((channelConnection) => {
			if (channelConnection.userId === userId && channelConnection.channelId === targetChannel) {
				res = true;
			}
		});
		return res;
	}

	async join(user: User, targetChannelId: number, password?: string): Promise<ChannelConnection> {
		// Get channel if it exists with the user connection
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: {
				channelConnection: {
					where: { AND: [{ userId: user.id }, { channelId: targetChannelId }] },
					include: { channel: true }
				}
			}
		});

		if (!channel)
			throw new ForbiddenException('Cannot join channel', {
				description: 'Channel does not exist'
			});

		let channelConnection = channel.channelConnection[0];

		// if the channel connection does not exist, create it
		if (!channelConnection) return await this.joinChannel(user, channel, password);

		switch (channelConnection.role) {
			case ChannelRole.BANNED:
				throw new ForbiddenException('Cannot join channel', {
					description: 'User is banned'
				});
			case ChannelRole.INVITED:
				channelConnection = await this.updateChannelRole(ChannelRole.DEFAULT, targetChannelId, user.id);
		}

		// TODO: Join the socket.id, if specified, to the socket.io room
		return channelConnection;
	}

	//TODO: Fix this garbage function
	checkPassword(channel: Channel, password: string): boolean {
		return channel.password === password;
	}

	async updateChannelRole(role: ChannelRole, targetChannelId: number, targetUserId: number) {
		return await this.prisma.channelConnection
			.update({
				where: {
					connectionId: {
						userId: targetUserId,
						channelId: targetChannelId
					}
				},
				data: { role: role },
				include: { channel: true }
			})
			.catch(() => {
				throw new BadRequestException('Cannot update user status', {
					description: 'Something went wrong, channel or user do no exist'
				});
			});
	}

	async createChannel(user: User, data: ChannelCreationDto) {
		return await this.prisma.channel
			.create({
				data: {
					name: data.name,
					password: data.password,
					kind: data.kind,
					channelConnection: {
						create: {
							userId: user.id,
							role: ChannelRole.OWNER
						}
					}
				},
				include: { channelConnection: true }
			})
			.catch(() => {
				throw new BadRequestException('Cannot create channel', {
					description: 'Channel already exists'
				});
			});
	}

	async joinChannel(user: User, channel: Channel, password?: string): Promise<ChannelConnection> {
		// Perform some checks to make sure the user can join the channel
		switch (channel.kind) {
			case ChannelKind.PRIVATE:
				throw new ForbiddenException('Cannot join channel', {
					description: 'This channel is private'
				});
			case ChannelKind.PROTECTED:
				//TODO: Make this a real function please
				if (!this.checkPassword(channel, password))
					throw new ForbiddenException('Cannot join channel', {
						description: 'Incorrect password'
					});
		}
		return await this.prisma.channelConnection.create({
			data: {
				userId: user.id,
				channelId: channel.id,
				role: ChannelRole.DEFAULT
			},
			include: { channel: true }
		});
	}

	async quit(user: User, targetChannelId: number) {
		const foundChannel = await this.prisma.channel.findFirst({
			where: {
				AND: [{ id: targetChannelId }, { NOT: [{ kind: ChannelKind.DIRECT }] }]
			},
			include: {
				channelConnection: {
					where: {
						NOT: [{ OR: [{ role: ChannelRole.INVITED }, { role: ChannelRole.BANNED }] }]
					}
				}
			}
		});
		if (!foundChannel) {
			console.log('1: Channel not found.');
			throw new ForbiddenException('Cannot quit channel', {
				cause: new Error(),
				description: 'Channel does not exist'
			});
		}
		if (this.isUserOwner(user.id, foundChannel.channelConnection)) {
			let newOwner = await this.prisma.channelConnection.findFirst({
				where: {
					AND: [{ channelId: targetChannelId }, { role: ChannelRole.ADMIN }]
				}
			});
			if (!newOwner) {
				newOwner = await this.prisma.channelConnection.findFirst({
					where: {
						AND: [{ channelId: targetChannelId }, { role: ChannelRole.DEFAULT }]
					}
				});
			}
			if (!newOwner) {
				await this.prisma.channelConnection.deleteMany({
					where: { channelId: targetChannelId }
				});
				await this.prisma.channel.delete({ where: { id: targetChannelId } });
				return;
			}
			await this.prisma.channelConnection.update({
				where: { connectionId: { userId: newOwner.userId, channelId: newOwner.channelId } },
				data: { role: ChannelRole.OWNER }
			});
			await this.prisma.channelConnection.delete({
				where: { connectionId: { userId: user.id, channelId: targetChannelId } }
			});
		} else {
			console.log('3: Found Channel.');
			await this.prisma.channelConnection.deleteMany({
				where: {
					AND: [
						{ userId: user.id },
						{ channelId: targetChannelId },
						{
							NOT: [{ OR: [{ role: ChannelRole.INVITED }, { role: ChannelRole.BANNED }] }]
						}
					]
				}
			});
			if (foundChannel.channelConnection.length === 1) {
				console.log('4: Channel is now empty, deleting it.');
				await this.prisma.channel.delete({ where: { id: targetChannelId } });
			}
		}
	}

	async invite(user: User, targetChannelId: number, targetId: number): Promise<ChannelConnection> {
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: { channelConnection: true }
		});
		if (!channel) {
			throw new ForbiddenException('Cannot invite user', {
				description: 'The channel does not exist'
			});
		}
		if (!this.isUserAdmin(user.id, channel.channelConnection)) {
			throw new ForbiddenException('Cannot invite user', {
				description: "You don't have the necessary rights to invite on this channel"
			});
		}
		if (this.userHasExistingConnection(targetId, targetChannelId, channel.channelConnection)) {
			if (this.isUserConnected(targetId, channel.channelConnection)) {
				throw new ForbiddenException('Cannot invite user', {
					description: 'User is already connected to the channel'
				});
			}
			const invite: ChannelConnection = await this.prisma.channelConnection.update({
				where: { connectionId: { userId: targetId, channelId: targetChannelId } },
				data: { role: ChannelRole.INVITED }
			});
			this.chatService.emitToUser(targetId, 'chat:invite', invite);
			return invite;
		}
		const invite = await this.prisma.channelConnection
			.create({
				data: {
					role: ChannelRole.INVITED,
					userId: targetId,
					channelId: targetChannelId
				}
			})
			.catch(() => {
				throw new BadRequestException('Cannot invite user', {
					description: 'user does not exist'
				});
			});
		this.chatService.emitToUser(targetId, 'chat:invite', invite);
		return invite;
	}

	async kick(user: User, targetChannelId: number, targetId: number) {
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: { channelConnection: true }
		});
		if (!channel) {
			throw new ForbiddenException('Cannot kick user', {
				description: 'The channel does not exist'
			});
		}
		if (!this.isUserAdmin(user.id, channel.channelConnection)) {
			throw new ForbiddenException('Cannot kick user', {
				description: "You don't have the necessary rights to kick on this channel"
			});
		}
		if (this.isUserOwner(targetId, channel.channelConnection)) {
			throw new ForbiddenException('Cannot kick user', {
				description: 'You cannot kick the owner of a channel'
			});
		}
		await this.prisma.channelConnection
			.delete({
				where: { connectionId: { userId: targetId, channelId: targetChannelId } }
			})
			.catch(() => {
				throw new BadRequestException('Cannot kick user', {
					description: 'user does not exist'
				});
			});
		this.chatService.emitToUser(targetId, 'chat:kick', channel);
		return null;
	}

	async ban(user: User, targetChannelId: number, targetId: number): Promise<ChannelConnection> {
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: { channelConnection: true }
		});
		if (!channel) {
			throw new ForbiddenException('Cannot ban user', {
				description: 'The channel does not exist'
			});
		}
		if (!this.isUserAdmin(user.id, channel.channelConnection)) {
			throw new ForbiddenException('Cannot ban user', {
				description: "You don't have the necessary rights to ban on this channel"
			});
		}
		if (this.isUserOwner(targetId, channel.channelConnection)) {
			throw new ForbiddenException('Cannot ban user', {
				description: 'Have you lost your mind trying to ban the owner?'
			});
		}
		const banned = await this.prisma.channelConnection
			.upsert({
				where: { connectionId: { channelId: targetChannelId, userId: targetId } },
				create: {
					channelId: targetChannelId,
					userId: targetId,
					role: ChannelRole.BANNED
				},
				update: { role: ChannelRole.BANNED }
			})
			.catch(() => {
				throw new BadRequestException('Cannot ban user', {
					description: 'user does not exist'
				});
			});
		this.chatService.emitToUser(targetId, 'chat:ban', banned);
		return banned;
	}

	async updateChannel(userId: number, targetChannelId: number, data: ChannelDto): Promise<Channel> {
		const foundChannel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: { channelConnection: true }
		});
		if (!foundChannel) {
			throw new ForbiddenException('Cannot update channel', {
				description: 'Channel does not exist'
			});
		}
		if (data.kind === ChannelKind.PROTECTED && data.password === undefined) {
			throw new ForbiddenException('Cannot update channel', {
				description: 'A protected channel needs a password'
			});
		}
		return await this.prisma.channel
			.update({
				where: { id: targetChannelId },
				data: {
					name: data.name,
					kind: data.kind,
					password: data.password
				}
			})
			.catch(() => {
				throw new BadRequestException('Cannot update channel', {
					description: 'Something went horribly wrong'
				});
			});
	}

	async transfer(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		this.updateChannelRole(ChannelRole.ADMIN, user.id, targetUserId);
		return await this.updateChannelRole(ChannelRole.OWNER, targetChannelId, targetUserId);
	}

	async promote(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot promote user', {
				description: 'Cannot promote the owner'
			});
		}
		return await this.updateChannelRole(ChannelRole.ADMIN, targetChannelId, targetUserId);
	}

	async demote(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot demote user', {
				description: 'Cannot demote the owner'
			});
		}
		return await this.updateChannelRole(ChannelRole.DEFAULT, targetChannelId, targetUserId);
	}

	async mute(user: User, targetChannelId: number, targetUserId: number, time: Date): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot mute user', {
				description: 'Cannot mute the owner'
			});
		}
		return await this.prisma.channelConnection.update({
			where: {
				connectionId: { userId: targetUserId, channelId: targetChannelId }
			},
			data: { muted: time }
		});
	}
}

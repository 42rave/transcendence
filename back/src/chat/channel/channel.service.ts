import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';

import { Channel, User, ChannelConnection, ChannelKind, ChannelRole } from '@prisma/client';

import { PrismaService } from '@prisma/prisma.service';
import { PaginationDto } from '@type/pagination.dto';
import { ChannelCreationDto } from '@type/channel.dto';
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

	async join(user: User, id: number, password?: string): Promise<ChannelConnection> {
		// Get channel if it exists with the user connection
		const channel = await this.prisma.channel.findUnique({
			where: { id },
			include: {
				channelConnection: {
					where: { AND: [{ userId: user.id }, { channelId: id }] },
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
				channelConnection = await this.updateChannelRole(ChannelRole.DEFAULT, channelConnection);
		}

		// TODO: Join the socket.id, if specified, to the socket.io room
		return channelConnection;
	}

	//TODO: Fix this garbage function
	checkPassword(channel: Channel, password: string): boolean {
		return channel.password === password;
	}

	async updateChannelRole(role: ChannelRole, channelCo: ChannelConnection) {
		return await this.prisma.channelConnection.update({
			where: {
				connectionId: {
					userId: channelCo.userId,
					channelId: channelCo.channelId
				}
			},
			data: { role: role },
			include: { channel: true }
		});
	}

	async createChannel(user: User, data: ChannelCreationDto) {
		return await this.prisma.channel.create({
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
		const channel = await this.prisma.channel.findFirst({
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
		if (!channel) {
			console.log('1: Channel not found.');
			throw new ForbiddenException('Cannot quit channel', {
				cause: new Error(),
				description: 'Channel does not exist'
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
			if (channel.channelConnection.length === 1) {
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
}

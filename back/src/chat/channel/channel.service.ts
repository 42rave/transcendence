import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';

import { Channel, User, ChannelConnection, ChannelKind, ChannelRole } from '@prisma/client';

import { PrismaService } from '@prisma/prisma.service';
import { ChannelCreationDto, ChannelDto } from '@type/channel.dto';
import { ChatService } from '@chat/chat.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly chatService: ChatService
	) {}

	async getAll(): Promise<Channel[]> {
		return await this.prisma.channel.findMany({
			where: { NOT: [{ kind: ChannelKind.DIRECT }] }
		});
	}

	async getAllUserChannelConnections(userId: number): Promise<ChannelConnection[]> {
		return await this.prisma.channelConnection.findMany({
			where: {
				AND: [{ userId: userId }, { NOT: { role: ChannelRole.BANNED } }]
			},
			include: { channel: true }
		});
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
		return !!(await this.prisma.channelConnection.findFirst({
			where: {
				AND: [
					{ userId },
					{ channelId },
					{
						OR: [
							{ role: ChannelRole.OWNER },
							{ role: ChannelRole.ADMIN },
							{ role: ChannelRole.DEFAULT },
							{ role: ChannelRole.INVITED }
						]
					}
				]
			}
		}));

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
		if (!channel) {
			throw new ForbiddenException('Cannot find channel', {
				description: 'Channel does not exist'
			});
		}
		return !!channel;
	}

	async canSpeakInChannel(targetUserId: number, targetChannelId: number): Promise<boolean> {
		const foundChannelConnection = await this.prisma.channelConnection.findFirst({
			where: {
				AND: [
					{ userId: targetUserId },
					{ channelId: targetChannelId },
					{
						NOT: [
							{
								OR: [{ role: ChannelRole.BANNED }, { role: ChannelRole.INVITED }, { muted: { gt: new Date() } }]
							}
						]
					}
				]
			}
		});
		return !!foundChannelConnection;
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

	async join(user: User, targetChannelId: number, socketId: string, password?: string): Promise<ChannelConnection> {
		const foundChannel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: {
				channelConnection: {
					where: { AND: [{ userId: user.id }, { channelId: targetChannelId }] },
					include: { channel: true }
				}
			}
		});

		let channelConnection = foundChannel.channelConnection[0];
		if (!channelConnection) {
			return await this.joinChannel(user, foundChannel, socketId, password);
		}

		switch (channelConnection.role) {
			case ChannelRole.BANNED:
				throw new ForbiddenException('Cannot join channel', {
					description: 'User is banned'
				});
			case ChannelRole.INVITED:
				channelConnection = await this.updateChannelRole(ChannelRole.DEFAULT, targetChannelId, user.id);
				break;
		}

		this.chatService.joinRoom(socketId, targetChannelId.toString());
		this.chatService.emit('chat:join', channelConnection, targetChannelId.toString());
		return channelConnection;
	}

	async checkPassword(channel: Channel, password: string): Promise<boolean> {
		return await bcrypt
			.compare(password, channel.password)
			.then(() => {
				return true;
			})
			.catch(() => {
				return false;
			});
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

	async hashPassword(password: string): Promise<string> {
		const hash = await bcrypt.hash(password, 10);
		return hash;
	}

	async createChannel(user: User, data: ChannelCreationDto) {
		const channel = await this.prisma.channel
			.create({
				data: {
					name: 'channel: ' + data.name,
					password: await this.hashPassword(data.password),
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
		this.chatService.emit('chat:create', channel);
		return channel;
	}

	async joinChannel(user: User, channel: Channel, socketId: string, password?: string): Promise<ChannelConnection> {
		switch (channel.kind) {
			case ChannelKind.PRIVATE:
				throw new ForbiddenException('Cannot join channel', {
					description: 'This channel is private'
				});
				break;
			case ChannelKind.PROTECTED:
				if (!(await this.checkPassword(channel, password)))
					throw new ForbiddenException('Cannot join channel', {
						description: 'Incorrect password'
					});
				break;
			case ChannelKind.DIRECT:
				throw new ForbiddenException('Cannot join channel', {
					description: 'Cannot join a private conversation'
				});
		}
		const channelConnection = await this.prisma.channelConnection
			.create({
				data: {
					userId: user.id,
					channelId: channel.id,
					role: ChannelRole.DEFAULT
				},
				include: { channel: true }
			})
			.catch(() => {
				throw new BadRequestException('Cannot join channel', {
					description: 'Something went terribly wrong.'
				});
			});
		this.chatService.joinRoom(socketId, channel.id.toString());
		this.chatService.emit('chat:join', channelConnection, channel.id.toString());
		return channelConnection;
	}

	async quit(user: User, targetChannelId: number) {
		const foundChannel = await this.prisma.channel.findFirst({
			where: {
				AND: [
					{ id: targetChannelId },
					{ NOT: [{ kind: ChannelKind.DIRECT }] },
					{
						channelConnection: {
							some: {
								AND: [
									{ userId: user.id },
									{ NOT: [{ OR: [{ role: ChannelRole.INVITED }, { role: ChannelRole.BANNED }] }] }
								]
							}
						}
					}
				]
			},
			include: {
				channelConnection: {
					where: {
						AND: [{ userId: user.id }, { NOT: [{ OR: [{ role: ChannelRole.INVITED }, { role: ChannelRole.BANNED }] }] }]
					}
				}
			}
		});
		if (!foundChannel) {
			throw new ForbiddenException('Cannot quit channel', {
				cause: new Error(),
				description: 'The channel does not exist or you are not in it'
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
				this.chatService.emit('chat:delete', targetChannelId);
				await this.prisma.channel.delete({ where: { id: targetChannelId } });
				return;
			}
			const promotedOwner = await this.prisma.channelConnection.update({
				where: { connectionId: { userId: newOwner.userId, channelId: newOwner.channelId } },
				data: { role: ChannelRole.OWNER }
			});
			this.chatService.emit('chat:promote', promotedOwner, targetChannelId.toString());
			await this.prisma.channelConnection.delete({
				where: { connectionId: { userId: user.id, channelId: targetChannelId } }
			});
			this.chatService.emit('chat:quit', user.id, targetChannelId.toString());
			this.chatService.quitRoom(user.id, targetChannelId.toString());
		} else {
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
			this.chatService.emit('chat:quit', user.id, targetChannelId.toString());
			this.chatService.quitRoom(user.id, targetChannelId.toString());
			if (foundChannel.channelConnection.length === 1) {
				this.chatService.emit('chat:delete', targetChannelId);
				await this.prisma.channel.delete({ where: { id: targetChannelId } });
			}
		}
	}

	async invite(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: { channelConnection: true }
		});
		if (this.userHasExistingConnection(targetUserId, targetChannelId, channel.channelConnection)) {
			if (this.isUserConnected(targetUserId, channel.channelConnection)) {
				throw new ForbiddenException('Cannot invite user', {
					description: 'User is already connected to the channel'
				});
			}
			const invite: ChannelConnection = await this.prisma.channelConnection.update({
				where: { connectionId: { userId: targetUserId, channelId: targetChannelId } },
				data: { role: ChannelRole.INVITED }
			});
			this.chatService.emitToUser('chat:invite', invite, targetUserId);
			this.chatService.emit('chat:invite', invite, targetChannelId.toString());
			return invite;
		}
		const invite = await this.prisma.channelConnection
			.create({
				data: {
					role: ChannelRole.INVITED,
					userId: targetUserId,
					channelId: targetChannelId
				}
			})
			.catch(() => {
				throw new BadRequestException('Cannot invite user', {
					description: 'user does not exist'
				});
			});
		this.chatService.emitToUser('chat:invite', invite, targetUserId);
		this.chatService.emit('chat:invite', invite, targetChannelId.toString());
		return invite;
	}

	async kick(user: User, targetChannelId: number, targetUserId: number) {
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
		if (this.isUserOwner(targetUserId, channel.channelConnection)) {
			throw new ForbiddenException('Cannot kick user', {
				description: 'You cannot kick the owner of a channel'
			});
		}
		await this.prisma.channelConnection
			.delete({
				where: { connectionId: { userId: targetUserId, channelId: targetChannelId } }
			})
			.catch(() => {
				throw new BadRequestException('Cannot kick user', {
					description: 'user does not exist'
				});
			});
		this.chatService.quitRoom(targetUserId, targetChannelId.toString());
		this.chatService.emit('chat:kicked', targetUserId, targetChannelId.toString());
		this.chatService.emitToUser('chat:kick', channel, targetUserId);
		return null;
	}

	async ban(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
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
		if (this.isUserOwner(targetUserId, channel.channelConnection)) {
			throw new ForbiddenException('Cannot ban user', {
				description: 'Have you lost your mind trying to ban the owner?'
			});
		}
		const banned = await this.prisma.channelConnection
			.upsert({
				where: { connectionId: { channelId: targetChannelId, userId: targetUserId } },
				create: {
					channelId: targetChannelId,
					userId: targetUserId,
					role: ChannelRole.BANNED
				},
				update: { role: ChannelRole.BANNED }
			})
			.catch(() => {
				throw new BadRequestException('Cannot ban user', {
					description: 'user does not exist'
				});
			});
		this.chatService.quitRoom(targetUserId, targetChannelId.toString());
		this.chatService.emit('chat:banning', targetUserId, targetChannelId.toString());
		this.chatService.emitToUser('chat:ban', banned, targetUserId);
		return banned;
	}

	async unban(user: User, targetChannelId: number, targetUserId: number) {
		const channel = await this.prisma.channel.findUnique({
			where: { id: targetChannelId },
			include: { channelConnection: true }
		});
		if (!channel) {
			throw new ForbiddenException('Cannot unban user', {
				description: 'The channel does not exist'
			});
		}
		if (!this.isUserAdmin(user.id, channel.channelConnection)) {
			throw new ForbiddenException('Cannot unban user', {
				description: "You don't have the necessary rights to unban on this channel"
			});
		}
		if (this.isUserOwner(targetUserId, channel.channelConnection)) {
			throw new ForbiddenException('Cannot unban user', {
				description: 'Have you lost your mind trying to unban the owner?'
			});
		}
		const unbanned = await this.prisma.channelConnection
			.deleteMany({
				where: {
						AND: [
								{ userId: targetUserId },
								{ channelId: targetChannelId },
								{ role: ChannelRole.BANNED }
						]}
			})
			.catch(() => {
				throw new BadRequestException('Cannot unban user', {
					description: 'User does not exist or is not banned'
				});
			});
		this.chatService.quitRoom(targetUserId, targetChannelId.toString());
		this.chatService.emit('chat:unbanning', targetUserId, targetChannelId.toString());
		this.chatService.emitToUser('chat:unban', targetChannelId, targetUserId);
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
		const channel = await this.prisma.channel
			.update({
				where: { id: targetChannelId },
				data: {
					name: 'channel: ' + data.name,
					kind: data.kind,
					password: await this.hashPassword(data.password)
				}
			})
			.catch(() => {
				throw new BadRequestException('Cannot update channel', {
					description: 'Something went horribly wrong'
				});
			});
		this.chatService.emit('chat:update', channel);
		return channel;
	}

	async transfer(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		this.updateChannelRole(ChannelRole.ADMIN, targetChannelId, user.id);
		const newOwner = await this.updateChannelRole(ChannelRole.OWNER, targetChannelId, targetUserId);
		this.chatService.emit('chat:transfer', newOwner.channel, targetChannelId.toString());
		return newOwner;
	}

	async promote(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot promote user', {
				description: 'Cannot promote the owner'
			});
		}
		const promotedUser = await this.updateChannelRole(ChannelRole.ADMIN, targetChannelId, targetUserId);
		this.chatService.emit('chat:promote', promotedUser, targetChannelId.toString());
		return promotedUser;
	}

	async demote(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot demote user', {
				description: 'Cannot demote the owner'
			});
		}
		const demotedUser = await this.updateChannelRole(ChannelRole.DEFAULT, targetChannelId, targetUserId);
		this.chatService.emit('chat:demote', demotedUser, targetChannelId.toString());
		return demotedUser;
	}

	async mute(user: User, targetChannelId: number, targetUserId: number, time: Date): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot mute user', {
				description: 'Cannot mute the owner'
			});
		}
		if (!time) {
			throw new ForbiddenException('Cannot mute user', {
				description: 'You did not specify a time'
			});
		}
		const mutedUser = await this.prisma.channelConnection
			.update({
				where: {
					connectionId: { userId: targetUserId, channelId: targetChannelId }
				},
				data: { muted: time }
			})
			.catch(() => {
				throw new BadRequestException('Cannot mute user', {
					description: 'Something went wrong, channel or user do no exist'
				});
			});
		this.chatService.emit('chat:mute', mutedUser, targetChannelId.toString());
		return mutedUser;
	}

	async unmute(user: User, targetChannelId: number, targetUserId: number): Promise<ChannelConnection> {
		if (await this.isUserOwnerInChannel(targetUserId, targetChannelId)) {
			throw new ForbiddenException('Cannot unmute user', {
				description: 'Cannot unmute the owner'
			});
		}
		const unmutedUser = await this.prisma.channelConnection
			.update({
				where: {
					connectionId: { userId: targetUserId, channelId: targetChannelId }
				},
				data: { muted: Date() }
			})
			.catch(() => {
				throw new BadRequestException('Cannot unmute user', {
					description: 'Something went wrong, user does not exist'
				});
			});
		this.chatService.emit('chat:unmute', unmutedUser, targetChannelId.toString());
		return unmutedUser;
	}
}

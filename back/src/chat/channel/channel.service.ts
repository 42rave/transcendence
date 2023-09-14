import {
	Req,
	Injectable,
	HttpException,
	HttpStatus,
	BadRequestException,
	ForbiddenException
} from '@nestjs/common';

import {
	Channel,
	User,
	ChannelConnection,
	ChannelKind,
	ChannelRole
} from '@prisma/client';

import { ChannelDto } from '../../types/channel.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}
	async join(user: User, data: ChannelDto) {
		const channel : Channel = await this.prisma.channel.findUnique({
			where: { name: data.name }
		});
		const channelConnection : ChannelConnection = await this.prisma.channel.findUnique({
			where: { userId: user.id, channelId: channel.id }
		});
		//USER ALREADY INSIDE CHANNEL
		if (channelConnection.role < ChannelRole.INVITED) {
			throw new BadRequestException('Cannot join channel', {
			cause: new Error(), description: 'User already in channel' })
		}
		if (channel) {
			if (this.isUserInvited(channelConnection)) {
				await this.joinChannel(user, channel);
			}
			if (this.isUserBanned(channelConnection)) {
				throw new ForbiddenException('Cannot join channel', {
					cause: new Error(), description: 'User is banned' })
			}
			if (this.isChannelProtected(channel)) {
				if (this.isPasswordOk(user, channel))
					await this.joinChannel(user, channel);
				else {
					throw new ForbiddenException('Cannot join channel', {
					cause: new Error(), description: 'Incorrect password' })
				}
			}
			if (this.isChannelPrivate(channel)) {
				throw new ForbiddenException('Cannot join channel', {
				cause: new Error(), description: 'User not on invite list' })
			}
			else
				await this.joinChannel(user, channel);
		}
		else {
			// -> create an entity in table "channel"
				// -> create an entity in tabel "channelConnection" where owner is user
		}
}
	isChannelProtected(channel: Channel) : boolean {
		if (channel.kind === ChannelKind.PROTECTED)
			return true;
		return false;
	}

	isChannelPrivate(channel: Channel) : boolean {
		if (channel.kind === ChannelKind.PRIVATE)
			return true;
		return false;
	}

	isPasswordOk(channel: Channel, data: ChannelDto) : boolean {
		if (channel.password === data.password)
			return true;
		return false
	}

	userAlreadyInChannel(channelConnection: ChannelConnection) : boolean {
		if (channelConnection.role < 'invited')
			return true;
		return false;
	}

	isUserInvited(channelConnection: ChannelConnection) : boolean {
		if (channelConnection.role === ChannelRole.INVITED)
			return true;
		return false;
	}
	isUserBanned(channelConnection: ChannelConnection) : boolean {
		if (channelConnection.role === ChannelRole.BANNED)
			return true;
		return false;
	}

	async updateChannelRole(role: ChannelRole, channelConnection: ChannelConnection) : ChannelConnection {
		channelConnection = await this.prisma.channelConnection.update({
			where: { id: channelConnection.id },
			data: { role: role }
		});
		return channelConnection;
	}

	async createChannel(user: User, data: ChannelDto) : Channel {
		const channel = await this.prisma.channel.create({
			data: {
				name: data.name,
				password: data.password,
				kind: data.kind,
			}
		});
		const channelConnection = await this.joinChannel(user, data);
		await this.updateChannelRole(ChannelRole.OWNER, channelConnection);
		return channel;	
	}

	async joinChannel(user: User, channel : Channel) : ChannelConnection {
		const channelConnection = await this.prisma.channelConnection.create({
			data: {
				userId: user.id,
				channelId: channel.id,
				role: ChannelRole.DEFAULT
			}
		});
	}

}

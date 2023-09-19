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

import { ChannelDto } from '@type/channel.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}
	async getAll() {
		return await this.prisma.channel.findMany();
	}

	async getAllChannelConnections() {
		return await this.prisma.channelConnection.findMany();
	}

	async join(user: User, data: ChannelDto) {
		const channel : Channel = await this.prisma.channel.findUnique({
			where: { id: data.id }
		});
		if (channel) {
		const channelConnectionList: ChannelConnection[] = await this.prisma.channelConnection.findMany({
			where: {
				AND: [
					{ userId: user.id },
					{ channelId: channel.id }
				]}
		});
		const channelConnection: ChannelConnection = channelConnectionList[0];
		if (channelConnection) {
			if (channelConnection.role < ChannelRole.INVITED) {
			throw new BadRequestException('Cannot join channel', {
			cause: new Error(), description: 'User already in channel' })
		}	
			if (this.isUserInvited(channelConnection)) {
				await this.joinChannel(user, channel);
			}
			if (this.isUserBanned(channelConnection)) {
				throw new ForbiddenException('Cannot join channel', {
					cause: new Error(), description: 'User is banned' })
			}
		}
		else {
			if (this.isChannelProtected(channel)) {
				//TODO: Make this a real function please
				if (this.isPasswordOk(channel, data))
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
			else {
				await this.joinChannel(user, channel);
			}
		}
		}
		else {
			await this.createChannel(user, data);
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

	//TODO: Fix this garbage function
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

	async updateChannelRole(role: ChannelRole, channelConnection: ChannelConnection) : Promise<ChannelConnection> {
		channelConnection = await this.prisma.channelConnection.update({
			where: { id: channelConnection.id },
			data: { role: role }
		});
		return channelConnection;
	}

	async createChannel(user: User, data: ChannelDto) : Promise<Channel> {
		const channel = await this.prisma.channel.create({
			data: {
				name: data.name,
				password: data.password,
				kind: data.kind,
			}
		});
		const channelConnection = await this.joinChannel(user, channel);
		await this.updateChannelRole(ChannelRole.OWNER, channelConnection);
		return channel;	
	}

	async joinChannel(user: User, channel: Channel) : Promise<ChannelConnection> {
		const channelConnection = await this.prisma.channelConnection.create({
			data: {
				userId: user.id,
				channelId: channel.id,
				role: ChannelRole.DEFAULT
			}
		});
		return channelConnection;
	}
	

}

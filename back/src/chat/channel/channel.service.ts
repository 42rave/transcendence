import { Injectable, ForbiddenException } from '@nestjs/common';

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

  async getAllChannelConnections(
    pagination: PaginationDto,
  ): Promise<ChannelConnection[]> {
    return await this.prisma.channelConnection.findMany(pagination);
  }

  async getChannelConnection(
    userId: number,
    channelId: number,
  ): Promise<ChannelConnection> {
    return (
      await this.prisma.channelConnection.findMany({
        where: {
          AND: [{ userId }, { channelId }],
        },
      })
    )[0];
  }

  async getChannelConnections(
    channelId: number,
    pagination: PaginationDto,
  ): Promise<ChannelConnection[]> {
    return await this.prisma.channelConnection.findMany({
      where: { channelId },
      ...pagination,
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

  async join(
    user: User,
    id: number,
    data: ChannelDto,
  ): Promise<ChannelConnection> {
    // Get channel if it exists with the user connection
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: {
        channelConnection: {
          where: { AND: [{ userId: user.id }, { channelId: id }] },
          include: { channel: true },
        },
      },
    });

    if (!channel)
      throw new ForbiddenException('Cannot join channel', {
        description: 'Channel does not exist',
      });

    let channelConnection = channel.channelConnection[0];

    // if the channel connection does not exist, create it
    if (!channelConnection)
      return await this.joinChannel(user, channel, data.password);

    switch (channelConnection.role) {
      case ChannelRole.BANNED:
        throw new ForbiddenException('Cannot join channel', {
          description: 'User is banned',
        });
      case ChannelRole.INVITED:
        channelConnection = await this.updateChannelRole(
          ChannelRole.DEFAULT,
          channelConnection,
        );
    }

    // TODO: Join the socket.id, if specified, to the socket.io room
    return channelConnection;
  }

  //TODO: Fix this garbage function
  checkPassword(channel: Channel, password: string): boolean {
    return channel.password === password;
  }

  async updateChannelRole(
    role: ChannelRole,
    channelConnection: ChannelConnection,
  ) {
    return await this.prisma.channelConnection.update({
      where: { id: channelConnection.id },
      data: { role: role },
      include: { channel: true },
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
            role: ChannelRole.OWNER,
          },
        },
      },
      include: { channelConnection: true },
    });
  }

  async joinChannel(
    user: User,
    channel: Channel,
    password?: string,
  ): Promise<ChannelConnection> {
    // Perform some checks to make sure the user can join the channel
    switch (channel.kind) {
      case ChannelKind.PRIVATE:
        throw new ForbiddenException('Cannot join channel', {
          description: 'This channel is private',
        });
      case ChannelKind.PROTECTED:
        //TODO: Make this a real function please
        if (!this.checkPassword(channel, password))
          throw new ForbiddenException('Cannot join channel', {
            description: 'Incorrect password',
          });
    }
    const channelConnection = await this.prisma.channelConnection.create({
      data: {
        userId: user.id,
        channelId: channel.id,
        role: ChannelRole.DEFAULT,
      },
      include: { channel: true },
    });
		if (channelConnection && socketId) this.chatService.joinRoom(socketId, channel.id.toString());
		return channelConnection;
  }

  async quit(
	user: User,
    id: number,
    data: ChannelDto,
 ) {
    const channel : Channel = await this.prisma.channel.findFirst({
      where: {
        AND: [
          { id: id },
		  {
            NOT : [
              { kind: ChannelKind.DIRECT }
            ]
		  },
        ]
      },
      include: {
        channelConnection: {
          where: { 
            NOT: [
			{
              OR: [
                { role: ChannelRole.INVITED },
                { role: ChannelRole.BANNED },
                ]
			}
            ]
          }
        }
      },
    });
    if (!channel) {
      console.log("1: Channel not found.");
      throw new ForbiddenException('Cannot quit channel', {
      cause: new Error(), description: 'Channel does not exist' })
    }
    else {
      console.log("3: Found Channel.");
      await this.prisma.channelConnection.deleteMany({
        where: {
		AND: [
            { userId: user.id },
            { channelId: channel.id },
          ],
	      NOT: [
		  {
			  OR: [
			    { role: ChannelRole.BANNED },
			    { role: ChannelRole.INVITED },
			  ]
		  },
		  ]
        },
      });
	  //TODO: Fix this condition and add deletion of empty channel.
/*      if (channel.channelConnection.length === 0) {
        console.log("4: Channel is now empty, deleting it.");
        await this.prisma.channel.delete(
			{ where: { id: id } }
        );
      } */
		}
	}
}

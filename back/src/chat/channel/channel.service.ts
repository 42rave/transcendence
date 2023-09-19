import { Injectable, ForbiddenException } from '@nestjs/common';

import {
  Channel,
  User,
  ChannelConnection,
  ChannelKind,
  ChannelRole,
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

  async getChannelConnections(channelId: number): Promise<ChannelConnection[]> {
    return await this.prisma.channelConnection.findMany({
      where: { channelId },
    });
  }

  async isUserInChannel(userId: number, channelId: number): Promise<boolean> {
    return !!(await this.getChannelConnection(userId, channelId));
  }

  async join(user: User, data: ChannelDto): Promise<ChannelConnection> {
    // Get channel if it exists with the user connection
    const channel = await this.prisma.channel.findUnique({
      where: { id: data.id },
      include: {
        channelConnection: {
          where: { AND: [{ userId: user.id }, { channelId: data.id }] },
        },
      },
    });

    // If channel does not exist, create it and return the user connection
    if (!channel) {
      const channel = await this.createChannel(user, data);
      // TODO: Join the socket.id, if specified, to the socket.io room
      // return the user connection
      return channel.channelConnection[0];
    }

    let channelConnection = channel.channelConnection[0];

    // if the channel connection does not exist, create it
    if (!channelConnection) return await this.joinChannel(user, channel, data);

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
  ): Promise<ChannelConnection> {
    return await this.prisma.channelConnection.update({
      where: { id: channelConnection.id },
      data: { role: role },
    });
  }

  async createChannel(user: User, data: ChannelDto) {
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
    data: ChannelDto,
  ): Promise<ChannelConnection> {
    // Perform some checks to make sure the user can join the channel
    switch (channel.kind) {
      case ChannelKind.PRIVATE:
        throw new ForbiddenException('Cannot join channel', {
          description: 'This channel is private',
        });
      case ChannelKind.PROTECTED:
        //TODO: Make this a real function please
        if (!this.checkPassword(channel, data.password))
          throw new ForbiddenException('Cannot join channel', {
            description: 'Incorrect password',
          });
    }
    return await this.prisma.channelConnection.create({
      data: {
        userId: user.id,
        channelId: channel.id,
        role: ChannelRole.DEFAULT,
      },
    });
  }
}

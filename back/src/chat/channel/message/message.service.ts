import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { MessageDto } from '@type/message.dto';
import { Message } from '@prisma/client';
import { PaginationDto } from '@type/pagination.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMessages(channelId: number, pagination: PaginationDto) {
    return await this.prismaService.message.findMany({
      where: { channelId },
      include: { user: true, channel: true },
      ...pagination,
    });
  }

  async sendMessage(
    userId: number,
    channelId: number,
    data: MessageDto,
  ): Promise<Message> {
    return await this.prismaService.message.create({
      data: {
        body: data.body,
        userId,
        channelId,
      },
    });
  }
}

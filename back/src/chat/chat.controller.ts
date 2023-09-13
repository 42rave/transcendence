import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sendTest')
  async send(@Body() body: { message: string }) {
    this.chatService.send(body as { message: string });
  }
}

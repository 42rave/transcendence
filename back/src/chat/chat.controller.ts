import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { ChatService } from './chat.service';
import { Request } from '@type/request';

@Controller('chat')
@UseGuards(...AuthenticatedGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sendTest')
  async send(@Req() req: Request, @Body() body: { message: string }) {
    console.log(`${req.user.username} sent:`, body);
    this.chatService.emit('test:message', body as { message: string });
  }
}

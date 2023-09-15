import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthenticatedGuard } from "../auth/guards/authenticated.guard";
import { Request } from "../types/request";

@Controller('chat')
@UseGuards(...AuthenticatedGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sendTest')
  async send(@Req() req: Request, @Body() body: { message: string }) {
    console.log(`${req.user.username} sent:`, body);
    this.chatService.send(body as { message: string });
  }
}

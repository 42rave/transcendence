import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { Request } from '@type/request';
import { SocialService } from '@chat/social.service';

@Controller('chat')
@UseGuards(...AuthenticatedGuard)
export class ChatController {
	constructor(private readonly socialService: SocialService) {}

	@Post('sendTest')
	async send(@Req() req: Request, @Body() body: { message: string }) {
		console.log(`${req.user.username} sent:`, body);
		this.socialService.emit('test:message', body as { message: string });
	}
}

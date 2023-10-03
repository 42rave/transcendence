import { ChatService } from '@chat/chat.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsUserSocketGuard implements CanActivate {
	constructor(private readonly chatService: ChatService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const userId = request.user.id;
		const socketId: string = request.body.socketId;
		const isUserSocket = await this.chatService.isUserSocket(userId, socketId);
		if (!isUserSocket) {
			throw new ForbiddenException('Cannot do that', {
				description: 'Socket provided does not match user'
			});
		}
		return true;
	}
}

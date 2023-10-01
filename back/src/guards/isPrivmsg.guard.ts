import { PrivmsgService } from '@chat/privmsg/privmsg.service';
import { ArgumentMetadata, CanActivate, ExecutionContext, Injectable, ParseIntPipe } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsPrivmsgGuard implements CanActivate {
	constructor(private readonly privmsgService: PrivmsgService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const privmsgId: number = await new ParseIntPipe().transform(request.params.privmsgId, {} as ArgumentMetadata);
		const userId = request.user.id;
		const isPrivmsg = await this.privmsgService.isPossiblePrivmsg(userId, privmsgId);
		if (!isPrivmsg) {
			throw new ForbiddenException('Cannot do that', {
				description: 'Can only send privmsg to existing users'
			});
		}
		return true;
	}
}

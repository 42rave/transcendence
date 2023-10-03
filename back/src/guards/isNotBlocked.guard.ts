import { PrivmsgService } from '@chat/privmsg/privmsg.service';
import { ArgumentMetadata, CanActivate, ExecutionContext, Injectable, ParseIntPipe } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Relationship } from '@prisma/client';

@Injectable()
export class IsNotBlockedGuard implements CanActivate {
	constructor(private readonly privmsgService: PrivmsgService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const privmsgId: number = await new ParseIntPipe().transform(request.params.privmsgId, {} as ArgumentMetadata);
		const userId = request.user.id;
		const isBlocked: Relationship = await this.privmsgService.getBlockedRelation(userId, privmsgId);
		if (isBlocked && isBlocked.senderId === userId) {
			throw new ForbiddenException('Cannot access private message', {
				description: 'You blocked this user.'
			});
		} else if (isBlocked && isBlocked.receiverId === userId) {
			throw new ForbiddenException('Cannot access private message', {
				description: 'This user blocked you.'
			});
		}
		return true;
	}
}

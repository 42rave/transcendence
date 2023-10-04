import { ChannelService } from '@chat/channel/channel.service';
import { ArgumentMetadata, CanActivate, ExecutionContext, Injectable, ParseIntPipe } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsNotMutedGuard implements CanActivate {
	constructor(private readonly channelService: ChannelService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const targetChannelId: number = await new ParseIntPipe().transform(request.params.targetChannelId, {} as ArgumentMetadata);
		const targetUserId = request.user.id;
		const canSpeak = await this.channelService.canSpeakInChannel(targetUserId, targetChannelId);
		if (!canSpeak) {
			throw new ForbiddenException('Cannot send message', {
				description: 'You are not allowed to send messages in this channel.'
			});
		}
		return true;
	}
}

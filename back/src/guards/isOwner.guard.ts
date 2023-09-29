import { ChannelService } from '@chat/channel/channel.service';
import { ArgumentMetadata, CanActivate, ExecutionContext, Injectable, ParseIntPipe } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsOwnerGuard implements CanActivate {
	constructor(private readonly channelService: ChannelService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const targetChannelId: number = await new ParseIntPipe().transform(
			request.params.targetChannelId,
			{} as ArgumentMetadata
		);
		const targetUserId = request.user.id;
		const isOwner = await this.channelService.isUserOwnerInChannel(targetUserId, targetChannelId);
		if (!isOwner) {
			throw new ForbiddenException('Cannot do that', {
				description: 'User is not the channel owner'
			});
		}
		return true;
	}
}

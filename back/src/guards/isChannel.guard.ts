import { ChannelService } from '@chat/channel/channel.service';
import { ArgumentMetadata, CanActivate, ExecutionContext, Injectable, ParseIntPipe } from '@nestjs/common';

@Injectable()
export class IsChannelGuard implements CanActivate {
	constructor(private readonly channelService: ChannelService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const targetChannelId: number = await new ParseIntPipe().transform(
			request.params.targetChannelId,
			{} as ArgumentMetadata
		);
		const channel = await this.channelService.isExistingChannel(targetChannelId);
		if (!channel) {
			throw new ForbiddenException('Cannot find channel', {
				description: 'Channel does not exist'
			});
		}
		return true;
	}
}

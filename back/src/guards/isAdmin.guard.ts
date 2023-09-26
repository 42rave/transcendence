import { ChannelService } from '@chat/channel/channel.service';
import { ArgumentMetadata, CanActivate, ExecutionContext, Injectable, ParseIntPipe } from '@nestjs/common';

@Injectable()
export class IsAdminGuard implements CanActivate {
	constructor(private readonly channelService: ChannelService) {}
	
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const targetChannelId: number = await new ParseIntPipe().transform(request.params.targetChannelId, {} as ArgumentMetadata);
		const targetUserId = request.user.id;
		return await this.channelService.isUserAdminInChannel(targetUserId, targetChannelId);
	}
}

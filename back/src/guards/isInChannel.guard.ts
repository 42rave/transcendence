import { ChannelService } from '@chat/channel/channel.service';
import {
  ArgumentMetadata,
  CanActivate,
  ExecutionContext,
  Injectable,
  ParseIntPipe,
} from '@nestjs/common';

@Injectable()
export class IsInChannelGuard implements CanActivate {
  constructor(private readonly channelService: ChannelService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const channelId: number = await new ParseIntPipe().transform(
      request.params.id,
      {} as ArgumentMetadata,
    );
    const userId = request.user.id;
    return await this.channelService.isUserInChannel(userId, channelId);
  }
}

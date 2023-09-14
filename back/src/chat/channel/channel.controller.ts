import { Controller,
	Get,
	Post,
	Req,
	Body,
	ValidationPipe,
	UseGuards,
	UsePipes,
} from '@nestjs/common';

import { ChannelDto } from '../../types/channel.dto';
import type { Request } from '../../types/request';
import { AuthGuard } from '@nestjs/passport';
import { ChannelService } from './channel.service';

@Controller('chat/channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Get()
	testIsASuccess() {
		return 'This is a success!'
	}
	@Post('join')
	@UseGuards(AuthGuard('jwt'))
	@UsePipes(new ValidationPipe())
	async join(@Req() req: Request, @Body() data: ChannelDto) {
		return await this.channelService.join(req.user, data);
	}
}

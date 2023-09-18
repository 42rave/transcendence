import { Controller,
	Get,
	Post,
	Req,
	Body,
	ValidationPipe,
	UseGuards,
	UsePipes,
} from '@nestjs/common';

import { ChannelDto } from '@type/channel.dto';
import type { Request } from '@type/request';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { ChannelService } from './channel.service';

@Controller('chat/channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Get()
	@UseGuards(...AuthenticatedGuard)
	testIsASuccess() {
		return 'This is a success!'
	}
	@Post('join')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async join(@Req() req: Request, @Body() data: ChannelDto) {
		return await this.channelService.join(req.user, data);
	}
}

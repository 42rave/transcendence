import { Injectable } from '@nestjs/common';
import { BroadcastService } from '@broadcast/broadcast.service';

@Injectable()
export class SocialService extends BroadcastService {
	constructor() {
		super('SocialService');
	}
}

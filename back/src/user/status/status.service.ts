import { Injectable } from '@nestjs/common';
import { SocialService } from '@chat/social.service';

@Injectable()
export class StatusService {
	constructor(private readonly socialService: SocialService) {}

	async getByUserId(id: number) {
		// TODO: implement some check with gameService to see if user is in game
		const { socketIds } = await this.socialService.fetchSockets(id);
		const status = socketIds.length > 0 ? 'online' : 'offline';
		return { status, count: socketIds.length };
	}

	async getByUserIds(ids: number[]) {
		return await Promise.all(ids.map((id: number) => this.getByUserId(id)));
	}
}

import { Injectable } from '@nestjs/common';
import { SocialService } from '@chat/social.service';
import { GameGateway } from '@game/game.gateway';
import { GameService } from '@game/game.service';

@Injectable()
export class StatusService {
	constructor(
		private readonly socialService: SocialService,
		private readonly gameGateway: GameGateway,
		private readonly gameService: GameService
	) {}

	async getByUserId(id: number) {
		const { socketIds } = await this.socialService.fetchSockets(id);
		let status = socketIds.length > 0 ? 'online' : 'offline';

		const gameSocketIds: { socketIds } = await this.gameService.fetchSockets(id);
		if (gameSocketIds) {
			for (let i = 0; i < gameSocketIds.socketIds.length; i++) {
				if (this.gameGateway.gamesInProgress.get(gameSocketIds.socketIds[i])) {
					status = 'ingame';
					break;
				}
			}
		}
		return { status, count: socketIds.length };
	}

	async getByUserIds(ids: number[]) {
		return await Promise.all(ids.map((id: number) => this.getByUserId(id)));
	}
}

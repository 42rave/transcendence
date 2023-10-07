import { Injectable } from '@nestjs/common';
import { ChatService } from '@chat/chat.service';

@Injectable()
export class StatusService {
	constructor(private readonly chatService: ChatService) {}

	async getByUserId(id: number) {
		// TODO: implement some check with gameService to see if user is in game
		const { socketIds } = await this.chatService.fetchSockets(id);
		const status = socketIds.length > 0 ? 'online' : 'offline';
		return { status };
	}

	async getByUserIds(ids: number[]) {
		return await Promise.all(ids.map((id: number) => this.getByUserId(id)));
	}
}

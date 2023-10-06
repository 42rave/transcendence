import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ChatService } from '@chat/chat.service';
import type { LadderDisplay, HistoryDisplay, GameStats } from '@type/game';
import { GameState } from '@prisma/client';

@Injectable()
export class GameService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly chatService: ChatService
	) {}
	
	/* This returns a LadderDisplay array.
	   LadderDisplay {
	     id: number;
	     username: string;
	     winNb: number;
	   }
	  
	   This needs to be sorted in descending order by the front based on winNb */
	async getLadder(): Promise<LadderDisplay[]> {
		let ladder: Array<LadderDisplay> = []

		const allUsers = await this.prisma.user.findMany({
			where : { gameRecords: { some: {} } },
			include: {
				_count: {
					select: { gameRecords: { where: { result: GameState.WON } } }
				},
			},
		});
		console.log(allUsers);
		for (var i = 0; i < allUsers.length; i++) {
			ladder.push({id: allUsers[i].id, username: allUsers[i].username,
					winNb: allUsers[i]._count.gameRecords });
		}
		return ladder;
	}

	/* This returns a HistoryDisplay array
	   HistoryDisplay {
	     data: Date,
	     player_1: { id: number, username: string, score: number },
	     player_2: { id: number, username: string, score: number },
	     state: GameState
	   }
	   GameState is a prisma enum { WON, LOST, DRAW } */
	async getHistory(userId: number): Promise<HistoryDisplay[]> {
		return null;
	}
	/* This returns a GameState 
	   GameState {
	     data: Date,
	     player_1: { id: number, username: string, score: number },
	     player_2: { id: number, username: string, score: number },
	     state: GameState
	   }
	   GameState is a prisma enum { WON, LOST, DRAW } */

	async getStats(userId: number): Promise<GameStats> {
		return null;
	}
}

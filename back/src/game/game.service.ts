import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { SocialService } from '@chat/social.service';
import { BroadcastService } from '@broadcast/broadcast.service';
import type { LadderDisplay, HistoryDisplay, GameStats } from '@type/game';
import { GameState } from '@prisma/client';

@Injectable()
export class GameService extends BroadcastService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly socialService: SocialService
	) {
		super('BroadcastService');
	}

	/* This returns a LadderDisplay array.
	   LadderDisplay {
	     id: number;
	     username: string;
	     winNb: number;
	   }
	  
	   This needs to be sorted in descending order by the front based on winNb */
	async getLadder(): Promise<LadderDisplay[]> {
		const ladder: Array<LadderDisplay> = [];

		const allUsers = await this.prisma.user.findMany({
			where: { gameRecords: { some: {} } },
			include: {
				_count: {
					select: { gameRecords: { where: { result: GameState.WON } } }
				}
			}
		});
		for (let i = 0; i < allUsers.length; i++) {
			ladder.push({ id: allUsers[i].id, username: allUsers[i].username, winNb: allUsers[i]._count.gameRecords });
		}
		return ladder;
	}

	/* This returns a HistoryDisplay array
	   HistoryDisplay {
	     date: Date,
	     player_1: { id: number, username: string, score: number },
	     player_2: { id: number, username: string, score: number },
	     state: GameState
	   }
	   GameState is a prisma enum { WON, LOST, DRAW } */
	async getHistory(userId: number): Promise<HistoryDisplay[]> {
		const gameHistory: Array<HistoryDisplay> = [];

		const allGames = await this.prisma.game.findMany({
			where: {
				records: {
					some: { playerId: userId }
				}
			},
			include: { records: { include: { player: true }, orderBy: { position: 'asc' } } }
		});
		for (let i = 0; i < allGames.length; i++) {
			gameHistory.push({
				date: allGames[i].createdAt,
				player_1: {
					id: allGames[i].records[0].playerId,
					username: allGames[i].records[0].player.username,
					score: allGames[i].records[0].score
				},
				player_2: {
					id: allGames[i].records[1].playerId,
					username: allGames[i].records[1].player.username,
					score: allGames[i].records[1].score
				},
				state:
					allGames[i].records[0].playerId === userId ? allGames[i].records[0].result : allGames[i].records[1].result
			});
		}
		return gameHistory;
	}

	async getGameNbByResult(userId: number, result: GameState): Promise<number> {
		return this.prisma.game.count({
			where: {
				records: {
					some: {
						AND: [{ playerId: userId }, { result: result }]
					}
				}
			}
		});
	}

	async getGoalTaken(userId: number): Promise<number> {
		const gameRecord = await this.prisma.gameRecord.aggregate({
			where: {
				AND: [{ game: { records: { some: { playerId: userId } } } }, { NOT: [{ playerId: userId }] }]
			},
			_sum: {
				score: true
			}
		});
		return gameRecord._sum.score;
	}

	async getGoalScored(userId: number): Promise<number> {
		const gameRecord = await this.prisma.gameRecord.aggregate({
			where: { playerId: userId },
			_sum: {
				score: true
			}
		});
		return gameRecord._sum.score;
	}

	/* This returns a GameStats class (/!\ != GameState ! /!\ )
	  GameStats {
			gameNb: number;
			wonNb: number;
			lostNb: number;
			drawNb: number;
			goalScored: number;
			goalTaken: number;
			winRatio: number;
			goalRatio: number;
	   }
	*/
	async getStats(userId: number): Promise<GameStats> {
		const gameWon = await this.getGameNbByResult(userId, GameState.WON);
		const gameLost = await this.getGameNbByResult(userId, GameState.LOST);
		const gameDrawn = await this.getGameNbByResult(userId, GameState.DRAW);
		const gameNb = gameWon + gameLost + gameDrawn;

		const goalTaken = await this.getGoalTaken(userId);
		const goalScored = await this.getGoalScored(userId);

		return {
			gameNb: gameNb,
			wonNb: gameWon,
			lostNb: gameLost,
			drawNb: gameDrawn,
			winRatio: gameNb === 0 ? 0 : (gameWon / gameNb) * 100,
			goalScored: 0,
			goalTaken: 0,
			goalRatio: goalTaken === 0 ? goalScored : parseFloat(((goalScored / goalTaken) * 100).toFixed(2))
		};
	}
}

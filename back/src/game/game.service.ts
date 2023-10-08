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
	 */

	async getLadder(): Promise<LadderDisplay[]> {
		return (
			await this.prisma.user.findMany({
				where: { gameRecords: { some: {} } },
				include: {
					_count: {
						select: { gameRecords: { where: { result: GameState.WON } } }
					}
				}
			})
		)
			.map((users) => ({ id: users.id, username: users.username, winNb: users._count.gameRecords }))
			.sort((a, b) => (a.winNb < b.winNb ? 1 : -1));
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
		return (
			await this.prisma.game.findMany({
				where: {
					records: {
						some: { playerId: userId }
					}
				},
				include: { records: { include: { player: true }, orderBy: { position: 'asc' } } }
			})
		)
			.map((games) => ({
				date: games.createdAt,
				player_1: {
					id: games.records[0].playerId,
					username: games.records[0].player.username,
					score: games.records[0].score
				},
				player_2: {
					id: games.records[1].playerId,
					username: games.records[1].player.username,
					score: games.records[1].score
				},
				state: games.records[0].playerId === userId ? games.records[0].result : games.records[1].result
			}))
			.sort((a, b) => (a.date < b.date ? 1 : -1));
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

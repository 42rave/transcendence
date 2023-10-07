import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { SocialService } from '@chat/social.service';
import { BroadcastService } from '@broadcast/broadcast.service';
import { LadderDisplay, HistoryDisplay, GameStats, Colour, Ball, Paddle, Coord, Rectangle, GameField, Player, GameResult } from '@type/game';
import { GameState } from '@prisma/client';
import { Socket } from 'dgram';
import { Result } from '@prisma/client/runtime/library';

//the game itself
@Injectable()
export class GameService extends BroadcastService {
    protected game: GameField;
	protected result: GameResult;

	constructor(
		private readonly prisma: PrismaService,
		private readonly socialService: SocialService,
		//private readonly idPlayer1: number,
		//private readonly socketIdPlayer1: Socket,
		//private readonly idPlayer2: number,
		//private readonly socketIdPlayer2: Socket,
	) {
		super('BroadcastService');
		//this.player1 = { userId: idPlayer1, socketId: socketIdPlayer1, score: 0 };
		//this.player2 = { userId: idPlayer1, socketId: socketIdPlayer1, score: 0 };

		let ball = { colour: Colour.RED, coord: { x: 4.5, y: 8 }, diameter: 1 };
        let field = { colour: Colour.BLACK, width: 9, length: 16 };
		let paddleForm = { colour: Colour.WHITE, width: 3, length: 1 };
		let paddle1 = { coord: { x: 1, y:  8 }, obj: paddleForm };
		let paddle2 = { coord: { x: 15, y: 8 }, obj: paddleForm };
	
        this.game = { field, ball, paddle1, paddle2 };
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


    // -------------------------------------------- THE GAME STARTS HERE -------------------------------------------- //

	/*  This starts game, calculate scores and returns the GameResult
        GameResult {
			player1: { userId: number, socketId: Socket, score: number};
			player2: { userId: number, socketId: Socket, score: number};
			winnerId: number;
        }
    */
	async playGame(): Promise<GameResult> {
		return this.result;
	}
}

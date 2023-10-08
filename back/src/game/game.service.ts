import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { SocialService } from '@chat/social.service';
import { BroadcastService } from '@broadcast/broadcast.service';
import { LadderDisplay, HistoryDisplay, GameStats, Colour, Ball, Paddle, Coord, Rectangle, GameField, Player, GameResult, Move } from '@type/game';
import { GameState } from '@prisma/client';
import { Socket } from 'dgram';
import { Result } from '@prisma/client/runtime/library';

//the game itself
@Injectable()
export class GameService extends BroadcastService {
    protected game: GameField;
	protected player1: Player;
	protected player2: Player;

	constructor(
		private readonly prisma: PrismaService,
		private readonly socialService: SocialService,
		//private readonly idPlayer1: number,
		//private readonly socketIdPlayer1: Socket,
		//private readonly idPlayer2: number,
		//private readonly socketIdPlayer2: Socket,
	) {
		super('BroadcastService');
		this.player1 = { userId: 1, socketId: null, score: 0 };
		this.player2 = { userId: 2, socketId: null, score: 0 };

		let ball = { colour: Colour.RED, coord: null, vect: null, diameter: 0.5 };
        let field = { colour: Colour.BLACK, width: 9, length: 16 };
		let paddleForm = { colour: Colour.WHITE, width: 1.5, length: 0.5 };
		let paddle1 = { coord: { x: 1, y:  8 }, obj: paddleForm, move: Move.NONE };
		let paddle2 = { coord: { x: 15, y: 8 }, obj: paddleForm, move: Move.NONE };
	
        this.game = { field, ball, paddle1, paddle2 };
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
		const gameWon: number = await this.getGameNbByResult(userId, GameState.WON);
		const gameLost: number = await this.getGameNbByResult(userId, GameState.LOST);
		const gameDrawn: number = await this.getGameNbByResult(userId, GameState.DRAW);
		const gameNb: number = gameWon + gameLost + gameDrawn;

		const goalTaken: number = await this.getGoalTaken(userId);
		const goalScored: number = await this.getGoalScored(userId);

		return {
			gameNb: gameNb,
			wonNb: gameWon,
			lostNb: gameLost,
			drawNb: gameDrawn,
			winRatio: gameNb === 0 ? 0 : Math.round((gameWon / gameNb) * 100),
			goalScored: 0,
			goalTaken: 0,
			goalRatio: goalTaken === 0 ? goalScored : parseFloat(((goalScored / goalTaken) * 100).toFixed(2))
		};
	}


    // -------------------------------------------- THE GAME STARTS HERE -------------------------------------------- //
	/*  This function change the state of paddle move attribute when
		a user start or stop pressing a button.
		Move
		{
			UP,
			DOWN,
			NONE,	
		}
	*/
	eventMovePaddle(socketId: Socket, move: Move)
	{
		let paddle;
		if (socketId == this.player1.socketId)
			paddle = this.game.paddle1;
		else if (socketId == this.player2.socketId)
			paddle = this.game.paddle2;
		else
			return; //error

		paddle.move = move;
	}

	/*  This function change the position of a paddle depending on its move attribute.
		Move
		{
			UP, // The paddle goes up
			DOWN, // The paddle goes down
			NONE, // The paddle don't move
		}
	*/
	movePaddle(paddle: Paddle, speed: number)
	{
		if (paddle.move == Move.UP)
		{
			if (paddle.coord.y + paddle.obj.width / 2  + speed >= this.game.field.width)
				paddle.coord.y = this.game.field.width;
			else
				paddle.coord.y += speed;
		}
		else if (paddle.move == Move.DOWN)
		{
			if (paddle.coord.y - paddle.obj.width / 2 - speed <= 0)
				paddle.coord.y = 0;
			else
				paddle.coord.y -= speed;
		}
	}

	/* 
		This function returns the distance between two points
	 */
	distanceBetweenPoints(a: Coord, b: Coord): number
	{
		return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	}

	
	/* 	This function check if the ball has an intersection with te paddle.
		If yes returns intersection point Coord {x: number, y: number}.
		If no returns null.
	*/
	getIntersection(ball: Ball, paddle: Paddle): Coord | null
	{
		let half_width = paddle.obj.width / 2;
		let half_length = paddle.obj.length / 2;
		let radius = ball.diameter / 2;

		if (ball.coord.x >= paddle.coord.x - half_length && ball.coord.x <= paddle.coord.x + half_length)
		{
			if (Math.abs(ball.coord.y - paddle.coord.y - half_width) <= radius)
				return { x: ball.coord.x, y: paddle.coord.y - half_width };
			if (Math.abs(ball.coord.y - paddle.coord.y + half_width) <= radius)
				return { x: ball.coord.x, y: paddle.coord.y + half_width };
		}
		
		else if (ball.coord.y >= paddle.coord.y - half_width && ball.coord.y <= paddle.coord.y + half_width)
		{
			if (Math.abs(ball.coord.x - paddle.coord.x - half_length) <= radius)
				return { x: paddle.coord.x - half_length, y: ball.coord.y };
			if (Math.abs(ball.coord.x - paddle.coord.x + half_length) <= radius)
				return { x: paddle.coord.x + half_length, y: ball.coord.y };
		}

		// Closer to top right corner
		else if (ball.coord.x >= paddle.coord.x + half_length && ball.coord.y <= paddle.coord.y - half_width
			&& this.distanceBetweenPoints(ball.coord, { x: paddle.coord.x + half_length, y: paddle.coord.y - half_width}) <= radius)
		{
			return { x: paddle.coord.x + half_length, y: paddle.coord.y - half_width}
		}

		// Closer to bottom right corner
		else if (ball.coord.x >= paddle.coord.x + half_length && ball.coord.y >= paddle.coord.y + half_width
			&& this.distanceBetweenPoints(ball.coord, { x: paddle.coord.x + half_length, y: paddle.coord.y + half_width}) <= radius)
		{
			return { x: paddle.coord.x + half_length, y: paddle.coord.y + half_width}
		}

		// Closer to bottom left corner
		else if (ball.coord.x <= paddle.coord.x - half_length && ball.coord.y >= paddle.coord.y + half_width
			&& this.distanceBetweenPoints(ball.coord, { x: paddle.coord.x - half_length, y: paddle.coord.y + half_width}) <= radius)
		{
			return { x: paddle.coord.x - half_length, y: paddle.coord.y + half_width}
		}

		// Closer to top left corner
		else if (ball.coord.x <= paddle.coord.x - half_length && ball.coord.y <= paddle.coord.y - half_width
			&& this.distanceBetweenPoints(ball.coord, { x: paddle.coord.x - half_length, y: paddle.coord.y - half_width}) <= radius)
		{
			return { x: paddle.coord.x - half_length, y: paddle.coord.y - half_width}
		}
		return null;
	}

	/* 	This function get the point where the ball bounce occures if there is any.
		Otherwise returns null.
	*/
	getBounceCoord(ball: Ball): Coord | null
	{
		let radius = ball.diameter / 2;
		if (ball.coord.y - radius <= 0)
			return { x: 0, y: ball.coord.y - radius };
		if ((ball.coord.y + radius >= this.game.field.width))
			return { x: this.game.field.width, y: ball.coord.y + radius };
		let ret = this.getIntersection(ball, this.game.paddle1);
		if (ret == null)
			ret = this.getIntersection(ball, this.game.paddle1);
		return ret;
	}

	/* Change ball direction depending on its direction and the bouncePoint.
	*/
	bounceBall(ball: Ball, intersection: Coord)
	{
		let u = { x: intersection.x - ball.coord.x, y: intersection.y - ball.coord.y };
		let v = ball.vect;
		let normV = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
	
		let vectorialProduct = u.x * v.x + u.y * v.y;
		let normalProduct = Math.sqrt(Math.pow(u.x, 2) + Math.pow(u.y, 2)) * normV;
		let originAngle = Math.acos(vectorialProduct / normalProduct);
		let directionalAngle = 180 - (originAngle + 90);

		let x = Math.sin(directionalAngle + 90) / normV;
		let y = Math.cos(directionalAngle + 90) / normV;

		ball.vect.x = x - ball.coord.x;
		ball.vect.y = y - ball.coord.y;

		ball.coord = { x, y };
	}

	/* 
		Recalculate the ball direction if needed and move it.
	 */
	moveBall(ball: Ball)
	{
		let intersection = this.getBounceCoord(ball);
		if (intersection != null)
			this.bounceBall(ball, intersection);
		else
		{
			ball.coord.x += ball.vect.x;
			ball.coord.y += ball.vect.y;
		}
	}

	/* 	Check if a point has been marked.
		If so update player points.
		In any case return a boolean.
	 */
	isMarked(ball: Ball): boolean
	{
		let radius = ball.diameter / 2;
		if (ball.coord.x - radius <= 0)
		{
			this.player2.score += 1;
			return true;
		}
		
		if ((ball.coord.x + radius >= this.game.field.length))
		{
			this.player1.score += 1;
			return true;
		}
		return false;
	}

	/* 	Reset ball.
		Place the ball at the middle of the screen and generate
		a random vector to starts the game with.
	*/
	resetBall(ball: Ball, speed)
	{
		ball.coord = { x: 4.5, y: 8 };
		let vectX =  Math.floor(Math.random() * 2) - 1;
		let vectY = Math.floor(Math.random() * 2) - 1;
		ball.vect = { x: vectX * speed, y: vectY * speed };
	}

	/*  This starts game, calculate scores and returns the GameResult
        GameResult {
			winner: { userId: number, socketId: Socket, score: number };
			looser: { userId: number, socketId: Socket, score: number };
        }
    */
	async playGame(): Promise<GameResult> {
		let speed = 0.10;
		let scoreMax = 13;

		this.resetBall(this.game.ball, speed);
		while (true)
		{
			// if someEventMatchedUserInput call eventMovePaddle
			this.movePaddle(this.game.paddle1, speed);
			this.movePaddle(this.game.paddle2, speed);

			this.moveBall(this.game.ball);
				
			if (this.isMarked(this.game.ball))
				this.resetBall(this.game.ball, speed);

			// if this.player1 isDisconnected
				//return { winner: this.player2, looser: this.player1 }; 

			// if this.player2 isDisconnected
				//return { winner: this.player1, looser: this.player2 };

			if (this.player1.score == 13)
				return { winner: this.player1, looser: this.player2 };

			if (this.player2.score == 13)
				return { winner: this.player2, looser: this.player1}
		}
	}
}

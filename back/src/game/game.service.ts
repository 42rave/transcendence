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

		let ball = { colour: Colour.RED, coord: null, vect: null, radius: 0.25 };
        let field = { colour: Colour.BLACK, width: 9, length: 16 };
		let paddleWidth = 1.5;
		let paddleLength = 0.5;
		let paddleForm = { colour: Colour.WHITE, width: paddleWidth, length: paddleLength };
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
				paddle.coord.y = this.game.field.width - paddle.coord.y - paddle.obj.width / 2;
			else
				paddle.coord.y += speed;
		}
		else if (paddle.move == Move.DOWN)
		{
			if (paddle.coord.y - paddle.obj.width / 2 - speed <= 0)
				paddle.coord.y = 0 + paddle.obj.width / 2;
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

		let nextMove = { x: ball.coord.x + ball.vect.x, y: ball.coord.y + ball.vect.y };
		let half_width = paddle.obj.width / 2;
		let half_length = paddle.obj.length / 2;

		if (nextMove.x - ball.radius  >= paddle.coord.x - half_length && nextMove.x <= paddle.coord.x + half_length)
		{
			if (Math.abs(nextMove.y - paddle.coord.y - half_width) <= ball.radius)
				return { x: nextMove.x, y: paddle.coord.y - half_width };
			if (Math.abs(nextMove.y - paddle.coord.y + half_width) <= ball.radius)
				return { x: nextMove.x, y: paddle.coord.y + half_width };
		}
		
		else if (nextMove.y >= paddle.coord.y - half_width && nextMove.y <= paddle.coord.y + half_width)
		{
			if (Math.abs(nextMove.x - paddle.coord.x - half_length) <= ball.radius)
				return { x: paddle.coord.x - half_length, y: nextMove.y };
			if (Math.abs(nextMove.x - paddle.coord.x + half_length) <= ball.radius)
				return { x: paddle.coord.x + half_length, y: nextMove.y };
		}

		// Closer to top right corner
		else if (nextMove.x >= paddle.coord.x + half_length && nextMove.y <= paddle.coord.y - half_width
			&& this.distanceBetweenPoints(nextMove, { x: paddle.coord.x + half_length, y: paddle.coord.y - half_width}) <= ball.radius)
		{
			return { x: paddle.coord.x + half_length, y: paddle.coord.y - half_width}
		}

		// Closer to bottom right corner
		else if (nextMove.x >= paddle.coord.x + half_length && nextMove.y >= paddle.coord.y + half_width
			&& this.distanceBetweenPoints(nextMove, { x: paddle.coord.x + half_length, y: paddle.coord.y + half_width}) <= ball.radius)
		{
			return { x: paddle.coord.x + half_length, y: paddle.coord.y + half_width}
		}

		// Closer to bottom left corner
		else if (nextMove.x <= paddle.coord.x - half_length && nextMove.y >= paddle.coord.y + half_width
			&& this.distanceBetweenPoints(nextMove, { x: paddle.coord.x - half_length, y: paddle.coord.y + half_width}) <= ball.radius)
		{
			return { x: paddle.coord.x - half_length, y: paddle.coord.y + half_width}
		}

		// Closer to top left corner
		else if (nextMove.x <= paddle.coord.x - half_length && nextMove.y <= paddle.coord.y - half_width
			&& this.distanceBetweenPoints(nextMove, { x: paddle.coord.x - half_length, y: paddle.coord.y - half_width}) <= ball.radius)
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
		let ret;
		if (ball.coord.y - ball.radius + ball.vect.y <= 0)
			ret = { x: ball.coord.x, y:  0};

		else if ((ball.coord.y + ball.radius + ball.vect.y >= this.game.field.width))
			ret = { x: ball.coord.x, y: this.game.field.width };
	
		else
		{
			ret = this.getIntersection(ball, this.game.paddle1);
			if (ret == null)
				ret = this.getIntersection(ball, this.game.paddle1);
		}
		if (ret != null)
		{
			if (ret.x <= 0)
				ret.x = 0;
			else if (ret.x >= this.game.field.length)
				ret.x = this.game.field.length;
			if (ret.y <= 0)
				ret.y = 0;
			else if (ret.y >= this.game.field.width)
				ret.y = this.game.field.width;
		}
		return ret;
	}

	/* Change ball direction depending on its direction and the bouncePoint.
	*/
	bounceBall(ball: Ball, intersection: Coord)
	{
		let u = { x: ball.coord.x - intersection.x, y: ball.coord.y - intersection.y };

		let normU = Math.sqrt(Math.pow(u.x, 2) + Math.pow(u.y, 2));
		let n = { x: u.x / normU, y: u.y / normU }; 
		let v = ball.vect; 

		let vectorialProduct = n.x * v.x + n.y * v.y;
		let u2 = { x: 2 * vectorialProduct * n.x, y: 2 * vectorialProduct * n.y };
		ball.vect = { x: v.x - u2.x, y: v.y - u2.y};

		ball.coord = { x: intersection.x + (n.x * ball.radius), y: intersection.y + (n.y * ball.radius)};
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
			if (ball.coord.y + ball.radius >= 
				this.game.field.width)
				ball.coord.y = this.game.field.width - ball.radius;
			else if (ball.coord.y - ball.radius <= 0)
				ball.coord.y = ball.radius;
		}
	}

	/* 	Check if a point has been marked.
		If so update player points.
		In any case return a boolean.
	 */
	isMarked(ball: Ball): boolean
	{
		if (ball.coord.x - ball.radius <= 0)
		{
			this.player2.score += 1;
			return true;
		}
		
		if ((ball.coord.x + ball.radius >= this.game.field.length))
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
		ball.coord = { x: 8, y: 4.5 };
		let delta = 0.2;

		let randomRad = Math.PI / 2;
		
		while (Math.abs(randomRad - Math.PI / 2) < delta  || Math.abs(randomRad - 3 * Math.PI / 2) < delta)
			randomRad = Math.random() * 2 * Math.PI;

		ball.vect = { x: Math.cos(randomRad) * speed, y: Math.sin(randomRad) * speed };
	}

	/*  This starts game, calculate scores and returns the GameResult
        GameResult {
			winner: { userId: number, socketId: Socket, score: number };
			looser: { userId: number, socketId: Socket, score: number };
        }
    */
	async playGame(): Promise<GameResult> {
		let speed = 0.2;
		let scoreMax = 13;

		this.resetBall(this.game.ball, speed);
		for (let i = 0; i < 10; i++)
		{
			// if someEventMatchedUserInput call eventMovePaddle
			//this.movePaddle(this.game.paddle1, speed);
			//this.movePaddle(this.game.paddle2, speed);

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

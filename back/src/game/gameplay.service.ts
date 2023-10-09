import { Ball, Paddle, GameField, Player, Move, Vector2 } from '@type/gameplay';
import Socket from '@type/socket';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

const frameRate = 60;
const speed_factor = 0.005;
const acceleration_factor = 1.05;

//the game itself
export class GameplayService {
	private logger = new Logger(this.constructor.name);
	protected game: GameField;
	protected player_1: Player;
	protected player_2: Player;
	protected date: Date = new Date();
	private gameSpeed = speed_factor;

	protected debugLogger: any;

	protected frames = {
		previous: 0,
		delta: 0
	};

	protected winner = undefined;

	constructor(
		player_1: Socket,
		player_2: Socket,
		private readonly prisma: PrismaService
	) {
		this.game = new GameField({});

		this.logger.log(this.game);

		this.player_1 = new Player(player_1.user.id, player_1, this.game.paddle1);
		this.player_2 = new Player(player_2.user.id, player_2, this.game.paddle2);
		this.player_1.socket?.emit('game:start', { side: 'left' });
		this.player_2.socket?.emit('game:start', { side: 'right' });

		this.logger.log(`Game started between ${this.player_1.socket.id} and ${this.player_2.socket.id}`);
		this.startDebugLogger();
		this.resetBall(this.game.ball);
		try {
			this.gameLoop();
		} catch (e) {
			this.logger.error(e);
		}
	}

	/* ---- SOCKET MANAGEMENT  PART ---- */
	emitToPlayers(event: string, data: any) {
		this.player_1.socket?.emit(event, data);
		this.player_2.socket?.emit(event, data);
	}

	getSocketIds() {
		return [this.player_1.socket?.id, this.player_2.socket?.id];
	}

	getSockets() {
		return [this.player_1.socket, this.player_2.socket];
	}

	disconnectedUser(socketId: string) {
		this.logger.error(`User ${socketId} disconnected`);
		this.logger.error(`user1: ${this.player_1.socket?.id} user2: ${this.player_2.socket?.id}`);
		this.winner = this.player_1.socket.id === socketId ? this.player_2.socket.user : this.player_1.socket.user;
	}
	/* ---- END OF SOCKET MANAGEMENT  PART ---- */

	/*
		This function returns the content of the game.
	 */
	getContent() {
		return { field: this.game, player_1: this.player_1.userId, player_2: this.player_2.userId };
	}

	toString() {
		return JSON.stringify(this.getContent());
	}

	startDebugLogger() {
		if (!Logger.isLevelEnabled('debug')) return;
		if (this.debugLogger) clearInterval(this.debugLogger);
		this.debugLogger = setInterval(() => {
			this.logger.debug(
				`${this.player_1.socket.id} vs ${this.player_2.socket.id}, FPS: ${(1000 / this.frames.delta).toFixed(
					2
				)} (delta: ${this.frames.delta.toFixed(4)} ms)`
			);
		}, 1000);
	}

	stopDebugLogger() {
		if (!Logger.isLevelEnabled('debug')) return;
		if (this.debugLogger) clearInterval(this.debugLogger);
	}

	// /*  This function change the state of paddle move attribute when
	// 	a user start or stop pressing a button.
	// 	Move
	// 	{
	// 		UP,
	// 		DOWN,
	// 		NONE,
	// 	}
	// */
	eventMovePaddle(socket: Socket, move: Move) {
		//this.logger.debug(`eventMovePaddle ${socket.id} ${move}`);
		const side = socket.id == this.player_1.socket.id ? 'left' : 'right';
		const paddle: Paddle = side === 'left' ? this.game.paddle1 : this.game.paddle2;
		paddle.move = move;
		this.emitToPlayers('game:move', { move, side });
	}

	/*  This function change the position of a paddle depending on its move attribute.
		Move
		{
			UP, // The paddle goes up
			DOWN, // The paddle goes down
			NONE, // The paddle don't move
		}
	*/
	movePaddle(paddle: Paddle) {
		let speed: Vector2 = Vector2.zero();
		if (paddle.move == Move.UP) {
			speed = Vector2.up();
		} else if (paddle.move == Move.DOWN) speed = Vector2.down();

		paddle.position.add(speed.mul(this.gameSpeed * this.frames.delta));
		if (paddle.position.y < paddle.size.y / 2) {
			paddle.position.y = paddle.size.y / 2;
		}
		if (paddle.position.y > this.game.field.y - paddle.size.y / 2) {
			paddle.position.y = this.game.field.y - paddle.size.y / 2;
		}
	}

	/* 	This function check if the ball has an intersection with te paddle.
		If yes returns intersection point position {x: number, y: number}.
		If no returns null.
	*/
	getIntersection(ball: Ball, paddle: Paddle): Vector2 | null {
		const nextMove = ball.position.clone().add(ball.speed.clone().mul(this.gameSpeed * this.frames.delta));
		const half_size = paddle.size.clone().div(2.0);

		if (nextMove.x - ball.radius >= paddle.position.x - half_size.x && nextMove.x <= paddle.position.x + half_size.x) {
			if (Math.abs(nextMove.y - paddle.position.y - half_size.y) <= ball.radius)
				return new Vector2(nextMove.x, paddle.position.y - half_size.y);
			if (Math.abs(nextMove.y - paddle.position.y + half_size.y) <= ball.radius)
				return new Vector2(nextMove.x, paddle.position.y + half_size.y);
		} else if (nextMove.y >= paddle.position.y - half_size.y && nextMove.y <= paddle.position.y + half_size.y) {
			if (Math.abs(nextMove.x - paddle.position.x - half_size.x) <= ball.radius)
				return new Vector2(paddle.position.x - half_size.x, nextMove.y);
			if (Math.abs(nextMove.x - paddle.position.x + half_size.x) <= ball.radius)
				return new Vector2(paddle.position.x + half_size.x, nextMove.y);
		}
		// Closer to top right corner
		else if (
			nextMove.x >= paddle.position.x + half_size.x &&
			nextMove.y <= paddle.position.y - half_size.y &&
			Vector2.distance(nextMove, new Vector2(paddle.position.x + half_size.x, paddle.position.y - half_size.y)) <=
				ball.radius
		) {
			return new Vector2(paddle.position.x + half_size.x, paddle.position.y - half_size.y);
		}
		// Closer to bottom right corner
		else if (
			nextMove.x >= paddle.position.x + half_size.x &&
			nextMove.y >= paddle.position.y + half_size.y &&
			Vector2.distance(nextMove, paddle.position.clone().add(half_size)) <= ball.radius
		) {
			return paddle.position.clone().add(half_size);
		}
		// Closer to bottom left corner
		else if (
			nextMove.x <= paddle.position.x - half_size.x &&
			nextMove.y >= paddle.position.y + half_size.y &&
			Vector2.distance(nextMove, new Vector2(paddle.position.x - half_size.x, paddle.position.y + half_size.y)) <=
				ball.radius
		) {
			return new Vector2(paddle.position.x - half_size.x, paddle.position.y + half_size.y);
		}
		// Closer to top left corner
		else if (
			nextMove.x <= paddle.position.x - half_size.x &&
			nextMove.y <= paddle.position.y - half_size.y &&
			Vector2.distance(nextMove, paddle.position.clone().sub(half_size)) <= ball.radius
		) {
			return paddle.position.clone().sub(half_size);
		}
	}

	/*
	Recalculate the ball direction if needed and move it.
 */
	moveBall(ball: Ball) {
		this.bounceBall(ball);
		ball.position.add(ball.speed.clone().mul(this.gameSpeed * this.frames.delta));
	}

	//}
	/* Change ball direction depending on its direction and the bouncePoint.
	 */
	bounceBall(ball: Ball) {
		let collide = false;

		if (ball.speed.y > 0 && ball.position.y + ball.radius > this.game.field.y) {
			ball.position.y = this.game.field.y;
			ball.speed.y = -ball.speed.y;
			//this.emitToPlayers('game:ball', { position: ball.position, speed: ball.speed, radius: ball.radius });
			collide = true;
		} else if (ball.speed.y < 0 && ball.position.y - ball.radius < 0) {
			ball.position.y = 0;
			ball.speed.y = -ball.speed.y;
			//this.emitToPlayers('game:ball', { position: ball.position, speed: ball.speed, radius: ball.radius });
			collide = true;
		}

		const paddle = ball.speed.x < 0 ? this.game.paddle1 : this.game.paddle2;
		const side = ball.speed.x < 0;

		const intersect = this.getIntersection(ball, paddle);
		if (intersect != null) {
			if (side && intersect.x < paddle.position.x) {
				ball.speed.x = -ball.speed.x;
				collide = true;
			}
			if (!side && intersect.x > paddle.position.x) {
				ball.speed.x = -ball.speed.x;
				collide = true;
			}
		}
		if (collide) {
			ball.speed.mul(acceleration_factor);
			this.emitToPlayers('game:ball', { position: ball.position, speed: ball.speed, radius: ball.radius });
		}
	}

	// /* 	Check if a point has been marked.
	// 	If so update player points.
	// 	In any case return a boolean.
	//  */
	isMarked(ball: Ball): boolean {
		if (ball.position.x - ball.radius <= 0) {
			this.player_2.score += 1;
			this.emitToPlayers('game:score', { player: this.player_2?.userId, score: this.player_2.score });
			return true;
		}
		if (ball.position.x + ball.radius >= this.game.field.x) {
			this.player_1.score += 1;
			this.emitToPlayers('game:score', { player: this.player_1?.userId, score: this.player_1.score });
			return true;
		}
		return false;
	}

	// /* 	Reset ball.
	// 	Place the ball at the middle of the screen and generate
	// 	a random vector to starts the game with.
	// */
	resetBall(ball: Ball) {
		ball.position = this.game.field.clone().div(2.0);
		const delta = 0.6;
		let randomRad = 0;
		do {
			randomRad = Math.random() * 2 * Math.PI;
		} while (Math.abs(randomRad - Math.PI / 2) < delta || Math.abs(randomRad - (3 * Math.PI) / 2) < delta);
		ball.speed = new Vector2(Math.cos(randomRad), Math.sin(randomRad));
		this.emitToPlayers('game:ball', { position: ball.position, speed: ball.speed });
	}

	async gameLoop() {
		if (!this.frames.previous) this.frames.previous = Date.now();
		this.frames.delta = Date.now() - this.frames.previous;
		this.frames.previous = Date.now();

		this.movePaddle(this.game.paddle1);
		this.movePaddle(this.game.paddle2);
		this.moveBall(this.game.ball);

		if (this.isMarked(this.game.ball)) {
			this.resetBall(this.game.ball);
		}

		if (!this.winner) {
			setTimeout(() => {
				this.gameLoop();
			}, 1000 / frameRate);
		} else {
			// TODO: insert game history in database
			this.stopDebugLogger();
		}
	}
}

import { Ball, Paddle, Coord, Rectangle, GameField, Player, GameResult, Move } from '@type/gameplay';
import Socket from '@type/socket';
import { Logger } from '@nestjs/common';

//the game itself
export class GameplayService {
	private logger = new Logger(this.constructor.name);
	protected game: GameField;
	protected player_1: Player;
	protected player_2: Player;

	constructor(player_1: Socket, player_2: Socket) {
		this.game = new GameField({});

		//this.logger.log(game);
		console.log(this.game);
		this.player_1 = new Player(player_1.user.id, player_1, this.game.paddle1);
		this.player_2 = new Player(player_2.user.id, player_2, this.game.paddle2);
		this.player_1.socket?.emit('game:start', { side: 'left' });
		this.player_2.socket?.emit('game:start', { side: 'right' });
	}

	getContent() {
		return { field: this.game, player_1: this.player_1.userId, player_2: this.player_2.userId };
	}

	toString() {
		return JSON.stringify(this.getContent());
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
	// eventMovePaddle(socket: Socket, move: Move) {
	// 	let paddle = undefined;
	// 	if (socket.id === this.player1.socket.id) paddle = this.game.paddle1;
	// 	else if (socket.id == this.player2.socket.id) paddle = this.game.paddle2;
	// 	else return; //error
	// 	paddle.move = move;
	// }
	// /*  This function change the position of a paddle depending on its move attribute.
	// 	Move
	// 	{
	// 		UP, // The paddle goes up
	// 		DOWN, // The paddle goes down
	// 		NONE, // The paddle don't move
	// 	}
	// */
	// movePaddle(paddle: Paddle, speed: number) {
	// 	if (paddle.move == Move.UP) {
	// 		if (paddle.coord.y + paddle.obj.width / 2 + speed >= this.game.field.width)
	// 			paddle.coord.y = this.game.field.width - paddle.coord.y - paddle.obj.width / 2;
	// 		else paddle.coord.y += speed;
	// 	} else if (paddle.move == Move.DOWN) {
	// 		if (paddle.coord.y - paddle.obj.width / 2 - speed <= 0) paddle.coord.y = 0 + paddle.obj.width / 2;
	// 		else paddle.coord.y -= speed;
	// 	}
	// }
	// /*
	// 	This function returns the distance between two points
	//  */
	// distanceBetweenPoints(a: Coord, b: Coord): number {
	// 	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	// }
	// /* 	This function check if the ball has an intersection with te paddle.
	// 	If yes returns intersection point Coord {x: number, y: number}.
	// 	If no returns null.
	// */
	// getIntersection(ball: Ball, paddle: Paddle): Coord | null {
	// 	const nextMove = { x: ball.coord.x + ball.vect.x, y: ball.coord.y + ball.vect.y };
	// 	const half_width = paddle.obj.width / 2;
	// 	const half_length = paddle.obj.length / 2;
	// 	if (nextMove.x - ball.radius >= paddle.coord.x - half_length && nextMove.x <= paddle.coord.x + half_length) {
	// 		if (Math.abs(nextMove.y - paddle.coord.y - half_width) <= ball.radius)
	// 			return { x: nextMove.x, y: paddle.coord.y - half_width };
	// 		if (Math.abs(nextMove.y - paddle.coord.y + half_width) <= ball.radius)
	// 			return { x: nextMove.x, y: paddle.coord.y + half_width };
	// 	} else if (nextMove.y >= paddle.coord.y - half_width && nextMove.y <= paddle.coord.y + half_width) {
	// 		if (Math.abs(nextMove.x - paddle.coord.x - half_length) <= ball.radius)
	// 			return { x: paddle.coord.x - half_length, y: nextMove.y };
	// 		if (Math.abs(nextMove.x - paddle.coord.x + half_length) <= ball.radius)
	// 			return { x: paddle.coord.x + half_length, y: nextMove.y };
	// 	}
	// 	// Closer to top right corner
	// 	else if (
	// 		nextMove.x >= paddle.coord.x + half_length &&
	// 		nextMove.y <= paddle.coord.y - half_width &&
	// 		this.distanceBetweenPoints(nextMove, { x: paddle.coord.x + half_length, y: paddle.coord.y - half_width }) <=
	// 			ball.radius
	// 	) {
	// 		return { x: paddle.coord.x + half_length, y: paddle.coord.y - half_width };
	// 	}
	// 	// Closer to bottom right corner
	// 	else if (
	// 		nextMove.x >= paddle.coord.x + half_length &&
	// 		nextMove.y >= paddle.coord.y + half_width &&
	// 		this.distanceBetweenPoints(nextMove, { x: paddle.coord.x + half_length, y: paddle.coord.y + half_width }) <=
	// 			ball.radius
	// 	) {
	// 		return { x: paddle.coord.x + half_length, y: paddle.coord.y + half_width };
	// 	}
	// 	// Closer to bottom left corner
	// 	else if (
	// 		nextMove.x <= paddle.coord.x - half_length &&
	// 		nextMove.y >= paddle.coord.y + half_width &&
	// 		this.distanceBetweenPoints(nextMove, { x: paddle.coord.x - half_length, y: paddle.coord.y + half_width }) <=
	// 			ball.radius
	// 	) {
	// 		return { x: paddle.coord.x - half_length, y: paddle.coord.y + half_width };
	// 	}
	// 	// Closer to top left corner
	// 	else if (
	// 		nextMove.x <= paddle.coord.x - half_length &&
	// 		nextMove.y <= paddle.coord.y - half_width &&
	// 		this.distanceBetweenPoints(nextMove, { x: paddle.coord.x - half_length, y: paddle.coord.y - half_width }) <=
	// 			ball.radius
	// 	) {
	// 		return { x: paddle.coord.x - half_length, y: paddle.coord.y - half_width };
	// 	}
	// 	return null;
	// }
	// /* 	This function get the point where the ball bounce occures if there is any.
	// 	Otherwise returns null.
	// */
	// getBounceCoord(ball: Ball): Coord | null {
	// 	let ret;
	// 	if (ball.coord.y - ball.radius + ball.vect.y <= 0) ret = { x: ball.coord.x, y: 0 };
	// 	else if (ball.coord.y + ball.radius + ball.vect.y >= this.game.field.width)
	// 		ret = { x: ball.coord.x, y: this.game.field.width };
	// 	else {
	// 		ret = this.getIntersection(ball, this.game.paddle1);
	// 		if (ret == null) ret = this.getIntersection(ball, this.game.paddle1);
	// 	}
	// 	if (ret != null) {
	// 		if (ret.x <= 0) ret.x = 0;
	// 		else if (ret.x >= this.game.field.length) ret.x = this.game.field.length;
	// 		if (ret.y <= 0) ret.y = 0;
	// 		else if (ret.y >= this.game.field.width) ret.y = this.game.field.width;
	// 	}
	// 	return ret;
	// }
	// /* Change ball direction depending on its direction and the bouncePoint.
	//  */
	// bounceBall(ball: Ball, intersection: Coord) {
	// 	const u = { x: ball.coord.x - intersection.x, y: ball.coord.y - intersection.y };
	// 	const normU = Math.sqrt(Math.pow(u.x, 2) + Math.pow(u.y, 2));
	// 	const n = { x: u.x / normU, y: u.y / normU };
	// 	const v = ball.vect;
	// 	const vectorialProduct = n.x * v.x + n.y * v.y;
	// 	const u2 = { x: 2 * vectorialProduct * n.x, y: 2 * vectorialProduct * n.y };
	// 	ball.vect = { x: v.x - u2.x, y: v.y - u2.y };
	// 	ball.coord = { x: intersection.x + n.x * ball.radius, y: intersection.y + n.y * ball.radius };
	// }
	// /*
	// 	Recalculate the ball direction if needed and move it.
	//  */
	// moveBall(ball: Ball) {
	// 	const intersection = this.getBounceCoord(ball);
	// 	if (intersection != null) this.bounceBall(ball, intersection);
	// 	else {
	// 		ball.coord.x += ball.vect.x;
	// 		ball.coord.y += ball.vect.y;
	// 		if (ball.coord.y + ball.radius >= this.game.field.width) ball.coord.y = this.game.field.width - ball.radius;
	// 		else if (ball.coord.y - ball.radius <= 0) ball.coord.y = ball.radius;
	// 	}
	// }
	// /* 	Check if a point has been marked.
	// 	If so update player points.
	// 	In any case return a boolean.
	//  */
	// isMarked(ball: Ball): boolean {
	// 	if (ball.coord.x - ball.radius <= 0) {
	// 		this.player2.score += 1;
	// 		return true;
	// 	}
	// 	if (ball.coord.x + ball.radius >= this.game.field.length) {
	// 		this.player1.score += 1;
	// 		return true;
	// 	}
	// 	return false;
	// }
	// /* 	Reset ball.
	// 	Place the ball at the middle of the screen and generate
	// 	a random vector to starts the game with.
	// */
	// resetBall(ball: Ball, speed) {
	// 	ball.coord = { x: 8, y: 4.5 };
	// 	const delta = 0.2;
	// 	let randomRad = Math.PI / 2;
	// 	while (Math.abs(randomRad - Math.PI / 2) < delta || Math.abs(randomRad - (3 * Math.PI) / 2) < delta)
	// 		randomRad = Math.random() * 2 * Math.PI;
	// 	ball.vect = { x: Math.cos(randomRad) * speed, y: Math.sin(randomRad) * speed };
	// }
	// /*  This starts game, calculate scores and returns the GameResult
	//       GameResult {
	// 		winner: { userId: number, socketId: Socket, score: number };
	// 		looser: { userId: number, socketId: Socket, score: number };
	//       }
	//   */
	// async playGame(): Promise<GameResult> {
	// 	const speed = 0.2;
	// 	const scoreMax = 13;
	// 	this.resetBall(this.game.ball, speed);
	// 	for (let i = 0; i < 10; i++) {
	// 		// if someEventMatchedUserInput call eventMovePaddle
	// 		//this.movePaddle(this.game.paddle1, speed);
	// 		//this.movePaddle(this.game.paddle2, speed);
	// 		this.moveBall(this.game.ball);
	// 		if (this.isMarked(this.game.ball)) this.resetBall(this.game.ball, speed);
	// 		// if this.player1 isDisconnected
	// 		//return { winner: this.player2, looser: this.player1 };
	// 		// if this.player2 isDisconnected
	// 		//return { winner: this.player1, looser: this.player2 };
	// 		if (this.player1.score == 13) return { winner: this.player1, looser: this.player2 };
	// 		if (this.player2.score == 13) return { winner: this.player2, looser: this.player1 };
	// 	}
	// }
}

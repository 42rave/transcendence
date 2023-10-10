import Socket from '@type/socket';

export class Vector2 {
	constructor(
		public x: number = 0.0,
		public y: number = 0.0
	) {}

	set(v: Vector2 | number) {
		const type = typeof v;
		this.x = type === 'number' ? (v as number) : (v as Vector2).x;
		this.y = type === 'number' ? (v as number) : (v as Vector2).y;
		return this;
	}

	add(v: Vector2 | number) {
		const type = typeof v;
		this.x += type == 'number' ? (v as number) : (v as Vector2).x;
		this.y += type == 'number' ? (v as number) : (v as Vector2).y;
		return this;
	}

	sub(v: Vector2 | number) {
		const type = typeof v;
		this.x -= type == 'number' ? (v as number) : (v as Vector2).x;
		this.y -= type == 'number' ? (v as number) : (v as Vector2).y;
		return this;
	}

	mul(v: Vector2 | number) {
		const type = typeof v;
		this.x *= type == 'number' ? (v as number) : (v as Vector2).x;
		this.y *= type == 'number' ? (v as number) : (v as Vector2).y;
		return this;
	}

	div(v: Vector2 | number) {
		const type = typeof v;
		this.x /= type == 'number' ? (v as number) : (v as Vector2).x;
		this.y /= type == 'number' ? (v as number) : (v as Vector2).y;
		return this;
	}

	dot(v: Vector2) {
		return this.x * v.x + this.y * v.y;
	}

	equals(v: Vector2, delta: number = 0.01) {
		return Math.abs(this.x - v.x) <= delta && Math.abs(this.y - v.y) <= delta;
	}

	signs(s_x: number, s_y: number) {
		return new Vector2(this.x * s_x, this.y * s_y);
	}

	normalize() {
		const norm = Math.sqrt(this.x ** 2 + this.y ** 2);
		return this.clone().div(norm);
	}

	clone() {
		return new Vector2(this.x, this.y);
	}

	copy(v: Vector2) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	toString() {
		return `(${this.x.toFixed(4)}, ${this.y.toFixed(4)})`;
	}

	static fromAngle(angle: number) {
		return new Vector2(Math.cos(angle), Math.sin(angle));
	}

	static distance(a: Vector2, b: Vector2) {
		return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
	}

	static angle(a: Vector2, b: Vector2) {
		return Math.atan2(b.y - a.y, b.x - a.x);
	}

	static random() {
		return new Vector2(Math.random(), Math.random());
	}

	static zero() {
		return new Vector2();
	}

	static one() {
		return new Vector2(1, 1);
	}

	static up() {
		return new Vector2(0, -1);
	}

	static down() {
		return new Vector2(0, 1);
	}

	static left() {
		return new Vector2(-1, 0);
	}

	static right() {
		return new Vector2(1, 0);
	}
}

export class GameObject {
	public position: Vector2;
	public size: Vector2;
	public speed: Vector2;
	public move: Move;
	public color: string;

	constructor({
		position,
		size,
		speed,
		color,
		move
	}: {
		position?: Vector2;
		size?: Vector2;
		speed?: Vector2;
		color?: string;
		move?: Move;
	}) {
		this.position = position || Vector2.zero();
		this.size = size || Vector2.one();
		this.speed = speed || Vector2.zero();
		this.color = color || '#fff';
		this.move = move || Move.NONE;
	}

	setPosition(position: Vector2) {
		this.position = position;
		return this;
	}

	setSpeed(speed: Vector2) {
		this.speed = speed;
		return this;
	}

	toString() {
		return `${this.constructor.name}(${this.position.toString()}, ${this.speed.toString()})`;
	}

	static fromObject(obj: GameObject) {
		return new GameObject({ ...obj });
	}

	clone() {
		return GameObject.fromObject(this);
	}
}

export enum Move {
	NONE,
	UP,
	DOWN,
	LEFT,
	RIGHT
}

export interface Coord {
	x: number;
	y: number;
}

export interface Rectangle {
	color: string;
	width: number;
	length: number;
}

export class Ball extends GameObject {
	radius: number;

	constructor(args: object, radius: number) {
		super(args);
		this.radius = radius;
	}
}

export class Paddle extends GameObject {}

export class GameField {
	field: Vector2;
	ball: Ball;
	paddle1: Paddle;
	paddle2: Paddle;

	constructor({ field, ball, paddle1, paddle2 }: { field?: Vector2; ball?: Ball; paddle1?: Paddle; paddle2?: Paddle }) {
		this.field = field || new Vector2(16, 9);
		this.ball =
			ball ||
			new Ball(
				{
					color: '#fff',
					position: this.field.clone().div(2.0),
					speed: Vector2.zero()
				},
				0.25
			);
		this.paddle1 =
			paddle1 ||
			new Paddle({
				color: '#fff',
				position: new Vector2(0.5, this.field.y / 2.0),
				size: new Vector2(0.25, 1.5)
			});
		this.paddle2 =
			paddle2 ||
			new Paddle({
				color: '#fff',
				position: new Vector2(this.field.x - 0.5, this.field.y / 2.0),
				size: new Vector2(0.25, 1.5)
			});
	}
}

export class Player {
	userId: number;
	socket: Socket; // Handled by Socket IO
	score: number;
	paddle: Paddle;

	constructor(userId: number, socket: Socket, paddle: Paddle) {
		this.userId = userId;
		this.socket = socket;
		this.score = 0;
		this.paddle = paddle;
	}
}

export interface GameResult {
	winner: Player;
	looser: Player;
}

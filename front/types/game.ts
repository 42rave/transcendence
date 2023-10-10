export enum GameState {
	WON = 'WON',
	LOST = 'LOST',
	DRAW = 'DRAW'
}

export declare type LadderDisplay = {
	id: number;
	username: string;
	winNb: number;
}

export declare type HistoryDisplay = {
	date: Date;
	player_1: { id: number, username: string, score: number };
	player_2: { id: number, username: string, score: number };
	state: GameState;
}

export declare type GameStats = {
	gameNb: number;
	wonNb: number;
	lostNb: number;
	drawNb: number;
	goalScored: number;
	goalTaken: number;
	winRatio: number;
	goalRatio: number;
}

export class Vector2 { constructor (public x: number = 0, public y: number = 0) {}
	add(v: Vector2 | number) {
		const type = typeof v;
		this.x += (type == 'number' ? v as number : (v as Vector2).x);
		this.y += (type == 'number' ? v as number : (v as Vector2).y);
		return this;
	}

	sub(v: Vector2 | number) {
		const type = typeof v;
		this.x -= (type == 'number' ? v as number : (v as Vector2).x);
		this.y -= (type == 'number' ? v as number : (v as Vector2).y);
		return this;
	}

	mul(v: Vector2 | number) {
		const type = typeof v;
		this.x *= (type == 'number' ? v as number : (v as Vector2).x);
		this.y *= (type == 'number' ? v as number : (v as Vector2).y);
		return this;
	}

	div(v: Vector2 | number) {
		const type = typeof v;
		this.x /= (type == 'number' ? v as number : (v as Vector2).x);
		this.y /= (type == 'number' ? v as number : (v as Vector2).y);
		return this;
	}

	equals(v: Vector2, delta: number = 0.01) {
		return Math.abs(this.x - v.x) <= delta && Math.abs(this.y - v.y) <= delta;
	}

	clone() {
		return new Vector2(this.x, this.y);
	}

	toString() {
		return `(${this.x}, ${this.y})`;
	}

	static fromAngle(angle: number) {
		return new Vector2(Math.cos(angle), Math.sin(angle));
	}

	static distance(a: Vector2, b: Vector2) {
		return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
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
	public color: string;

	constructor ({ position, size, speed, color }: { position?: Vector2, size?: Vector2, speed?: Vector2, color?: string }) {
		this.position = position || Vector2.zero();
		this.size = size || Vector2.one();
		this.speed = speed || Vector2.zero();
		this.color = color || '#fff';
	}

	setPosition(position: Vector2) {
		this.position = position;
		return this;
	}

	setSpeed(speed: Vector2) {
		this.speed = speed;
		return this;
	}

	update(delta: number, bounds: Vector2) {
		this.position.add(this.speed.clone().mul(delta));
		//console.log(this.position.toString(), this.speed.toString(), this.speed.mul(delta).toString());
		if (this.position.x < this.size.x / 2) {
			this.position.x = this.size.x / 2;
		} else if (this.position.x > bounds.x - this.size.x / 2) {
			this.position.x = bounds.x - this.size.x / 2;
		}
		if (this.position.y < this.size.y / 2) {
			this.position.y = this.size.y / 2;
		} else if (this.position.y > bounds.y - this.size.y / 2) {
			this.position.y = bounds.y - this.size.y / 2;
		}
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

	display(ctx: CanvasRenderingContext2D, ratio: Vector2){
		const { x, y } = this.position.clone().sub(this.size.clone().div(2));
		const { x: w, y: h } = this.size.clone().mul(ratio);
		ctx.fillStyle = this.color;

		ctx.fillRect(x * ratio.x, y * ratio.y, w, h);
	}
}

export class Player extends GameObject {}

export class Ball extends GameObject {}

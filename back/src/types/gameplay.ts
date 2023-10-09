import Socket from '@type/socket';

export enum Colour {
	RED = 'RED',
	WHITE = 'WHITE',
	BLACK = 'BLACK'
}

export enum Move {
	UP,
	DOWN,
	NONE
}

export interface Coord {
	x: number;
	y: number;
}

export interface Rectangle {
	colour: Colour;
	width: number;
	length: number;
}

export interface Ball {
	colour: Colour;
	coord: Coord;
	vect: Coord; // Contains the ball directional vector
	radius: number;
}

export interface Paddle {
	coord: Coord; // Center of the paddle
	obj: Rectangle;
	move: Move;
}

export interface GameField {
	field: Rectangle;
	ball: Ball;
	paddle1: Paddle;
	paddle2: Paddle;
}

export interface Player {
	userId: number;
	socket: Socket; // Handled by Socket IO
	score: number;
}

export interface GameResult {
	winner: Player;
	looser: Player;
}

import { GameState } from '@prisma/client';
import { Socket } from 'dgram';

export declare type LadderDisplay = {
	id: number;
	username: string;
	winNb: number;
};

export declare type HistoryDisplay = {
	date: Date;
	player_1: { id: number; username: string; score: number };
	player_2: { id: number; username: string; score: number };
	state: GameState;
};

export declare type GameStats = {
	gameNb: number;
	wonNb: number;
	lostNb: number;
	drawNb: number;
	goalScored: number;
	goalTaken: number;
	winRatio: number;
	goalRatio: number;
};

export enum Colour {
	RED = "RED",
	WHITE = "WHITE",
	BLACK = "BLACK",
};

export enum Move {
	UP,
	DOWN,
	NONE,	
};

export interface Coord {
	x: number;
	y: number;
};

export interface Rectangle {
	colour: Colour;
	width: number;
	length: number;
};

export interface Ball {
	colour: Colour;
	coord: Coord;
	vect: Coord; // Contains the ball directional vector
	radius: number;
};

export interface Paddle {
	coord: Coord; // Center of the paddle
	obj: Rectangle;
	move: Move;
};

export interface GameField {
	field: Rectangle;
	ball: Ball;
	paddle1: Paddle;
	paddle2: Paddle;
};

export interface Player {
	userId: number;
	socketId: Socket; // Handled by Socket IO
	score: number;
};

export interface GameResult {
	winner: Player;
	looser: Player;
}

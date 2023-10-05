import { GameState } from '@prisma/client';

export declare type LadderDisplay = {
	id: number,
	username: string,
	winNb: number,
}

export declare type HistoryDisplay = {
	date: Date,
	player_1: { id: number, username: string, score: number },
	player_2: { id: number, username: string, score: number },
	state: GameState,
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

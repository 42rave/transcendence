import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import type { LadderDisplay, HistoryDisplay, GameStats } from '@type/game';
import { AuthenticatedGuard } from '@guard/authenticated.guard';

//The request handler
@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	//@Get()
	//@UseGuards(...AuthenticatedGuard)
	//async getAll(
	//@Req() req: Request,
	//): Promise<

	@Get('ladder')
	@UseGuards(...AuthenticatedGuard)
	async getLadder(): Promise<LadderDisplay[]> {
		return await this.gameService.getLadder();
	}

	@Get('history/:userId')
	@UseGuards(...AuthenticatedGuard)
	async getHistory(@Param('userId', ParseIntPipe) userId: number): Promise<HistoryDisplay[]> {
		return await this.gameService.getHistory(userId);
	}

	@Get('stats/:userId')
	@UseGuards(...AuthenticatedGuard)
	async getStats(@Param('userId', ParseIntPipe) userId: number): Promise<GameStats> {
		return await this.gameService.getStats(userId);
	}
}

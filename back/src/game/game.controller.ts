import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import type { LadderDisplay, HistoryDisplay, GameStats, GameResult } from '@type/game';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { Result } from '@prisma/client/runtime/library';


//The request handler
@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {
		void this.gameService;
	}

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

	@Get('play')
	@UseGuards(...AuthenticatedGuard)
	async playGame(): Promise<GameResult> {
		return await this.gameService.playGame();
	}

}

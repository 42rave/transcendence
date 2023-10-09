import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { AuthService } from '@auth/auth.service';
import { GameService } from './game.service';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';
import type { Server } from '@type/server';
import { GameplayService } from '@game/gameplay.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
	namespace: 'game',
	cors: {
		origin: authConfig.webAppURL,
		credentials: true
	}
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger = new Logger(this.constructor.name);

	protected userGame = new Map<number, GameplayService>();
	protected userQueue = new Array<Socket>();
	protected disconnectedQueue = new Array<number>();

	constructor(
		private gameService: GameService,
		private authService: AuthService
	) {}

	afterInit(): void {
		this.gameService.server = this.server;
	}

	async handleConnection(socket: Socket): Promise<void> {
		const user = await this.authService.getWsUser(socket);
		if (!user) {
			socket.disconnect(true);
			return;
		}
		await this.gameService.onConnection(socket);
	}

	async handleDisconnect(socket: Socket): Promise<void> {
		if (!socket.user) return;
		await this.gameService.onDisconnection(socket);

		// remove from userQueue
		this.disconnectedQueue.push(socket.user.id);
		setTimeout(() => {
			if (this.disconnectedQueue.includes(socket.user.id)) {
				this.disconnectedQueue.splice(this.disconnectedQueue.indexOf(socket.user.id), 1);
				// TODO: remove from userGame and set the other player as winner
			}
		});
	}

	// TODO: Remove this one, only for testing purpose
	@SubscribeMessage('test')
	async test(socket: Socket): Promise<void> {
		// TODO: Uncomment this line, it permit to remove duplicate user in the queue
		//this.userQueue = this.userQueue.filter((_s) => _s.user.id !== socket.user.id);

		this.userQueue.push(socket);

		this.logger.debug(`${this.userQueue.length} users waiting for a game`);

		if (this.userQueue.length >= 2) {
			const users = this.userQueue.splice(0, 2);
			const game = new GameplayService(users[0], users[1]);
			this.userGame.set(users[0].user.id, game);
			this.userGame.set(users[1].user.id, game);
			this.logger.debug(`Game start with users ${users[0].user.id} and ${users[1].user.id}`);
		} else {
			socket.emit('test:response', false);
		}
	}

	@SubscribeMessage('game:move')
	async move(socket: Socket, move: string): Promise<void> {}
}

import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { AuthService } from '@auth/auth.service';
import { GameService } from './game.service';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';
import type { Server } from '@type/server';

@WebSocketGateway({
	namespace: 'game',
	cors: {
		origin: authConfig.webAppURL,
		credentials: true
	}
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

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
	}
}

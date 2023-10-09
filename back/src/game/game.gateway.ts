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
import { SocialService } from '@chat/social.service';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { StatusService } from '@user/status/status.service';
import { Move } from '@type/gameplay';

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

	public gamesInProgress = new Map<string, GameplayService>();
	protected matchMaking = new Array<Socket>();
	protected disconnectedUsers = new Array<string>();

	constructor(
		private gameService: GameService,
		private authService: AuthService,
		private socialService: SocialService,
		private prisma: PrismaService,
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
		// TODO:  Check if user is already in a game
		await this.gameService.onConnection(socket);
	}

	async handleDisconnect(socket: Socket): Promise<void> {
		if (!socket.user) return;
		this.socialService.emit(`user:${socket.user.id}:status`, { status: 'online' });
		await this.gameService.onDisconnection(socket);

		if (this.gamesInProgress.has(socket.id)) {
			// remove from matchMaking
			this.disconnectedUsers.push(socket.id);

			const game = this.gamesInProgress.get(socket.id);

			this.logger.debug(
				`User ${socket.user.id} (${socket.id}) disconnected, waiting 10s before removing him from the queue`
			);
			setTimeout(() => {
				if (this.disconnectedUsers.includes(socket.id)) {
					this.disconnectedUsers.splice(this.disconnectedUsers.indexOf(socket.id), 1);
					this.logger.debug(`User ${socket.user.id} (${socket.id}) removed from the disconnected queue`);
					game.disconnectedUser(socket.id);

					// TODO: remove from gamesInProgress and set the other player as winner
				}
			}, 5000);
		}
	}

	// TODO: Remove this one, only for testing purpose
	@SubscribeMessage('test')
	async test(socket: Socket): Promise<void> {
		// TODO: Uncomment this line, it permit to remove duplicate user in the queue
		// this.matchMaking = this.matchMaking.filter((_s) => _s.user.id !== socket.user.id);

		// TODO: Check if user is already in a game, if yes don't allow him to join the queue
		this.matchMaking.push(socket);

		this.logger.debug(`${this.matchMaking.length} users waiting for a game`);

		if (this.matchMaking.length >= 2) {
			const sockets = this.matchMaking.splice(0, 2);
			const game = new GameplayService(sockets[0], sockets[1], this.prisma);
			this.gamesInProgress.set(sockets[0].id, game);
			this.gamesInProgress.set(sockets[1].id, game);
			this.logger.debug(`Game start with users ${sockets[0].user.id} and ${sockets[1].user.id}`);
			this.socialService.emit(`user:${sockets[0].user.id}:status`, { status: 'ingame' });
			this.socialService.emit(`user:${sockets[1].user.id}:status`, { status: 'ingame' });
		} else {
			socket.emit('game:queueing');
		}
	}

	@SubscribeMessage('game:move')
	async move(socket: Socket, move: Move): Promise<void> {
		const game = this.gamesInProgress.get(socket.id);
		if (!game) return;
		game.eventMovePaddle(socket, move);
	}
}

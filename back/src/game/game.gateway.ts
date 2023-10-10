import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket
} from '@nestjs/websockets';
import { AuthService } from '@auth/auth.service';
import { GameService } from './game.service';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';
import type { Server } from '@type/server';
import { GameplayService } from '@game/gameplay.service';
import { SocialService } from '@chat/social.service';
import { Logger, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Move } from '@type/gameplay';
import { SingleTargetDto } from '@type/user.dto';

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
	//map<senderUserId, InviteeUserId, Socket of Sender
	protected privateMatchMaking = new Map<number, Map<number, Socket>>();
	protected disconnectedUsers = new Map<number, GameplayService>();

	constructor(
		private gameService: GameService,
		private authService: AuthService,
		private socialService: SocialService,
		private prisma: PrismaService
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
		//this should be a get status but because of circular imports defaulting to online.
		this.socialService.emit(`user:${socket.user.id}:status`, { status: 'online' });
		await this.gameService.onDisconnection(socket);

		//cancel queue if tab is closed
		this.matchMaking = this.matchMaking.filter((arg) => arg !== socket);

		if (this.gamesInProgress.has(socket.id)) {
			const game = this.gamesInProgress.get(socket.id);

			//removing user from gameInProgress
			this.gamesInProgress.delete(socket.id);

			if (game.winner) return;
			// add to the disconnectedUserList
			this.disconnectedUsers.set(socket.user.id, game);
			this.logger.debug(
				`User ${socket.user.id} (${socket.id}) disconnected, waiting 10s before removing him from the queue`
			);
			setTimeout(() => {
				if (this.disconnectedUsers.has(socket.user.id)) {
					this.disconnectedUsers.delete(socket.user.id);
					this.logger.debug(`User ${socket.user.id} (${socket.id}) removed from the disconnected queue`);

					// TODO: remove from gamesInProgress and set the other player as winner
				}
			}, 10000);
		}
	}

	@SubscribeMessage('game:queueing')
	startQueueing(@ConnectedSocket() socket: Socket) {
		this.matchMaking = this.matchMaking.filter((_s) => _s.user.id !== socket.user.id);

		// Checks if the user is already in a game
		const liveGame = this.gamesInProgress.get(socket.id);
		if (liveGame) {
			if (liveGame.winner) {
				this.gamesInProgress.delete(socket.id);
			} else {
				liveGame.reconnectUser(socket.user.id, socket);
				return;
			}
		}
		// Checks if user is in the disconnected queue, if yes don't allow him to join the queue
		const game = this.disconnectedUsers.get(socket.user.id);
		if (game) {
			if (game.winner) {
				this.disconnectedUsers.delete(socket.user.id);
			} else {
				this.disconnectedUsers.delete(socket.user.id);

				//reconnect the user to the game.
				this.gamesInProgress.set(socket.id, game);
				game.reconnectUser(socket.user.id, socket);
				return;
			}
		}
		//if one of the disconnected users is this user
		//reconnect user, remove him from disconnected users and return

		this.matchMaking.push(socket);

		this.logger.debug(`${this.matchMaking.length} users waiting for a game`);

		if (this.matchMaking.length >= 2) {
			const sockets = this.matchMaking.splice(0, 2);
			const game = new GameplayService(
				sockets[0],
				sockets[1],
				this.prisma,
				this.gamesInProgress,
				this.matchMaking,
				this.privateMatchMaking,
				this.disconnectedUsers,
				this.socialService
			);
			this.gamesInProgress.set(sockets[0].id, game);
			this.gamesInProgress.set(sockets[1].id, game);
			this.logger.debug(`Game start with users ${sockets[0].user.id} and ${sockets[1].user.id}`);
			this.socialService.emit(`user:${sockets[0].user.id}:status`, { status: 'ingame' });
			this.socialService.emit(`user:${sockets[1].user.id}:status`, { status: 'ingame' });
		} else {
			socket.emit('game:queueing');
		}
	}

	@UsePipes(ValidationPipe)
	@SubscribeMessage('game:invite')
	privateQueueing(@ConnectedSocket() socket: Socket, @Body() data: SingleTargetDto) {
		//check is game condition start (user invited you as well)
		const opponentInvites: Map<number, Socket> = this.privateMatchMaking.get(data.targetUserId);
		if (opponentInvites) {
			const myOpponentSocket = opponentInvites.get(socket.user.id);
			if (myOpponentSocket) {
				this.privateMatchMaking.delete(socket.user.id);
				this.privateMatchMaking.delete(data.targetUserId);
				const game = new GameplayService(
					socket,
					myOpponentSocket,
					this.prisma,
					this.gamesInProgress,
					this.matchMaking,
					this.privateMatchMaking,
					this.disconnectedUsers,
					this.socialService
				);
				socket?.emit('game:redirect');
				myOpponentSocket?.emit('game:redirect');
				this.gamesInProgress.set(socket.id, game);
				this.gamesInProgress.set(myOpponentSocket.id, game);
				this.logger.debug(`Game start with users ${socket.user.id} and ${myOpponentSocket.user.id}`);
				this.socialService.emit(`user:${socket.user.id}:status`, { status: 'ingame' });
				this.socialService.emit(`user:${myOpponentSocket.user.id}:status`, { status: 'ingame' });
				return;
			}
		} else {
			let myInvites: Map<number, Socket> = this.privateMatchMaking.get(socket.user.id);
			if (!myInvites) myInvites = new Map<number, Socket>();
			myInvites.set(data.targetUserId, socket);
			this.privateMatchMaking.set(socket.user.id, myInvites);
			return;
		}
	}

	@SubscribeMessage('game:move')
	async move(socket: Socket, move: Move): Promise<void> {
		const game = this.gamesInProgress.get(socket.id);
		if (!game) return;
		game.eventMovePaddle(socket, move);
	}

	@SubscribeMessage('game:invite')
	async debugInvite(): Promise<void> {}
}

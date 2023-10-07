import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { AuthService } from '@auth/auth.service';
import { SocialService } from './social.service';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';
import type { Server } from '@type/server';
import { StatusService } from '@user/status/status.service';

@WebSocketGateway({
	namespace: 'chat',
	cors: {
		origin: authConfig.webAppURL,
		credentials: true
	}
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	constructor(
		private socialService: SocialService,
		private authService: AuthService,
		private statusService: StatusService
	) {}

	afterInit(): void {
		this.socialService.server = this.server;
	}

	async handleConnection(socket: Socket): Promise<void> {
		const user = await this.authService.getWsUser(socket);
		if (!user) {
			socket.disconnect(true);
			return;
		}
		await this.socialService.onConnection(socket);
		const { status, count } = await this.statusService.getByUserId(user.id);
		if (count === 1) this.socialService.emit(`user:${user.id}:status`, { status });
	}

	async handleDisconnect(socket: Socket): Promise<void> {
		if (!socket.user) return;
		const { status, count } = await this.statusService.getByUserId(socket.user.id);
		if (count === 0) this.socialService.emit(`user:${socket.user.id}:status`, { status });
		await this.socialService.onDisconnection(socket);
	}
}

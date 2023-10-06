import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { AuthService } from '@auth/auth.service';
import { ChatService } from './chat.service';
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
		private chatService: ChatService,
		private authService: AuthService,
		private statusService: StatusService
	) {}

	afterInit(): void {
		this.chatService.server = this.server;
	}

	async handleConnection(socket: Socket): Promise<void> {
		const user = await this.authService.getWsUser(socket);
		if (!user) {
			socket.disconnect(true);
			return;
		} else await this.chatService.onConnection(socket);
		this.chatService.emit(`user:${user.id}:status`, await this.statusService.getByUserId(user.id));
	}

	async handleDisconnect(socket: Socket): Promise<void> {
		if (!socket.user) return;
		this.chatService.emit(`user:${socket.user.id}:status`, await this.statusService.getByUserId(socket.user.id));
	}
}

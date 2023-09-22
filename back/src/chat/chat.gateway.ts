import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from '@auth/auth.service';
import { ChatService } from './chat.service';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';

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
		private authService: AuthService
	) {}

	afterInit(): void {
		this.chatService.server = this.server;
	}

	async handleConnection(socket: Socket): Promise<void> {
		const user = await this.authService.getWsUser(socket);
		if (!user) socket.disconnect(true);
		else this.chatService.onConnection(socket);
	}

	async handleDisconnect(socket: Socket): Promise<void> {
		if (socket.user) this.chatService.onDisconnection(socket);
	}
}

import { OnGatewayConnection, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from '@auth/auth.service';
import { ChatService } from './chat.service';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';
import type { Server } from '@type/server';

@WebSocketGateway({
	namespace: 'chat',
	cors: {
		origin: authConfig.webAppURL,
		credentials: true
	}
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
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
		else await this.chatService.onConnection(socket);
	}
}

import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthService } from "../auth/auth.service";
import { UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import Socket from '../types/socket';
import authConfig from '../config/auth.config';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: authConfig.webAppURL,
    credentials: true,
  },
})
@UseGuards(...AuthenticatedGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService, private authService: AuthService) {
    this.authService = authService;
  }

  afterInit() {
    this.chatService.server = this.server;
  }

  async handleConnection(socket: Socket) {
    const user = await this.authService.getWsUser(socket);
    if (!user) socket.disconnect(true);
  }
}
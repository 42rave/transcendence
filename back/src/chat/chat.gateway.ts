import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import authConfig from "../config/auth.config";
import { ChatService } from "./chat.service";

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: authConfig.webAppURL,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    this.chatService.server = server;
  }
}

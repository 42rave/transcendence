import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class ChatService {
    server: Server;

    send(data: { message: string }) {
        this.server.emit('test:message', data);
    }
}
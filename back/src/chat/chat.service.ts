import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import Socket from '../types/socket';

@Injectable()
export class ChatService {
    server: Server;
    clientMap: Map<number, string[]> = new Map();

    addSocket(socket: Socket) {
        if (!this.clientMap.has(socket.user.id))
            this.clientMap.set(socket.user.id, [socket.id]);
        else
            this.clientMap.get(socket.user.id).push(socket.id);
    }

    removeSocket(socket: Socket) {
        if (this.clientMap.has(socket.user.id)) { this.clientMap.set(
                socket.user.id,
                this.clientMap.get(socket.user.id).filter((s: string) => s !== socket.id)
            );
        }
    }

    onConnection(socket: Socket) {
        this.addSocket(socket);
        console.log(`${socket.user.username}: `, this.clientMap.get(socket.user.id))
    }

    onDisconnection(socket: Socket) {
        this.removeSocket(socket);
        console.log(`${socket.user.username}: `, this.clientMap.get(socket.user.id))
    }

    sendToUser(userId: number, data: any): void {
        if (this.clientMap.has(userId))
            this.server.to(this.clientMap.get(userId)).emit('test:message', data);
    }

    send(data: { message: string }) {
        this.server.emit('test:message', data);
    }
}
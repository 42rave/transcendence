import { BadRequestException, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import Socket from '@type/socket';

@Injectable()
export class ChatService {
	server: Server;
	clientMap: Map<number, string[]> = new Map();

	addSocket(socket: Socket) {
		if (!this.clientMap.has(socket.user.id)) this.clientMap.set(socket.user.id, [socket.id]);
		else this.clientMap.get(socket.user.id).push(socket.id);
	}

	removeSocket(socket: Socket) {
		if (this.clientMap.has(socket.user.id)) {
			const sockets: string[] = this.clientMap.get(socket.user.id).filter((s: string) => s !== socket.id);
			if (sockets.length === 0) this.clientMap.delete(socket.user.id);
			else this.clientMap.set(socket.user.id, sockets);
		}
	}

	onConnection(socket: Socket) {
		this.addSocket(socket);
		console.log(`${socket.user.username}: `, this.clientMap.get(socket.user.id));
	}

	onDisconnection(socket: Socket) {
		this.removeSocket(socket);
		console.log(`${socket.user.username}: `, this.clientMap.get(socket.user.id));
	}

	emitToUser(userId: number, event: string, data: any): void {
		if (this.clientMap.has(userId)) this.server.to(this.clientMap.get(userId)).emit(event, data);
	}

	emit(event: string, data: any, rooms?: string | string[]) {
		if (rooms) this.server.to(rooms).emit(event, data);
		else this.server.emit(event, data);
	}

	joinRoom(socket_id: string, room: string) {
		const socket: Socket = (this.server.sockets as any as Map<string, Socket>).get(socket_id);

		if (!socket) throw new BadRequestException(`Socket ${socket_id} not found.`);

		for (const room of socket.rooms) {
			if (room === socket.id) continue;
			socket.leave(room);
		}

		socket.join(room);
	}
}

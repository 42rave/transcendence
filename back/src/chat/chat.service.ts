import { BadRequestException, Injectable } from '@nestjs/common';
import Socket from '@type/socket';
import type { Server } from '@type/server';

@Injectable()
export class ChatService {
	server: Server;

	async fetchSockets(userId: number) {
		const sockets = await this.server.in(`user:${userId}`).fetchSockets();
		return { sockets, socketIds: sockets.map((socket) => socket.id) };
	}

	async onConnection(socket: Socket) {
		socket.join(`user:${socket.user.id}`);
		const { socketIds } = await this.fetchSockets(socket.user.id);
		console.log(`${socket.user.username} (onConnection): `, socketIds);
	}

	emit(event: string, data: any, rooms?: string | string[]) {
		if (rooms) this.server.to(rooms).emit(event, data);
		else this.server.emit(event, data);
	}

	emitToUser(userId: number, event: string, data: any): void {
		this.emit(event, data, `user:${userId}`);
	}

	joinRoom(socketId: string, room: string) {
		const socket: Socket = this.server.sockets.get(socketId);

		if (!socket) {
			throw new BadRequestException(`Socket ${socketId} not found.`);
		}

		for (const room of socket.rooms) {
			if (room && (room === socket.id || room.startsWith('user:'))) continue;
			socket.leave(room);
		}

		socket.join(room);
	}
}

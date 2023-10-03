import { UnauthorizedException, BadRequestException, Injectable } from '@nestjs/common';
import Socket from '@type/socket';
import type { Server } from '@type/server';

@Injectable()
export class ChatService {
	server: Server;

	// Get all sockets for a given userId, return an object with a list of sockets and a list of socket ids
	// Example: { sockets: [socket1, socket2], socketIds: [socket1.id, socket2.id] }
	async fetchSockets(userId: number) {
		const sockets = await this.server.in(`user:${userId}`).fetchSockets();
		return { sockets, socketIds: sockets.map((socket) => socket.id) };
	}

	async isUserSocket(userId: number, socketId: string): Promise<boolean> {
		const socket = await this.server.sockets.get(socketId)

			if (!socket) throw new UnauthorizedException(`Socket ${socketId} not found!`);
  			return socket.user.id === userId;
	}

	async onConnection(socket: Socket) {
		socket.join(`user:${socket.user.id}`);

		// Simply log the socket ids of the user
		// here we fetch the sockets of the user and store them in the socketIds variable. Then we log them.
		const { socketIds } = await this.fetchSockets(socket.user.id);
		console.log(`${socket.user.username} (onConnection): `, socketIds);
	}

	emit(event: string, data: any, rooms?: string | string[]) {
		if (rooms) this.server.to(rooms).emit(event, data);
		else this.server.emit(event, data);
	}

	emitToUser(event: string, data: any, userId: number): void {
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

	async quitRoom(userId: number, room: string) {
		const { sockets } = await this.fetchSockets(userId);

		for (const socket of sockets) {
			if (!socket) continue;
			if (socket && room === room) socket.leave(room);
		}
	}
}

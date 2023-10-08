import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import Socket from '@type/socket';
import type { Server } from '@type/server';
import { Logger } from '@nestjs/common';

export class BroadcastService {
	server: Server;

	private namespace: string;
	private logger: Logger;

	constructor(namespace: string) {
		this.namespace = namespace;
		this.logger = new Logger(namespace);
		this.logger.debug(`${this.namespace} instantiated`);
	}

	async onConnection(socket: Socket) {
		socket.join(`user:${socket.user.id}`);

		// Simply log the socket ids of the user
		// here we fetch the sockets of the user and store them in the socketIds variable. Then we log them.
		if (!Logger.isLevelEnabled('debug')) return;
		const { socketIds } = await this.fetchSockets(socket.user.id);
		this.logger.debug(`${socket.user.username} (onConnection): ${JSON.stringify({ socketIds })}`);
	}

	async onDisconnection(socket: Socket) {
		if (!Logger.isLevelEnabled('debug')) return;
		const { socketIds } = await this.fetchSockets(socket.user.id);
		this.logger.debug(`${socket.user.username} (onDisconnection): ${JSON.stringify({ socketIds })}`);
	}

	// Get all sockets for a given userId, return an object with a list of sockets and a list of socket ids
	// Example: { sockets: [socket1, socket2], socketIds: [socket1.id, socket2.id] }
	async fetchSockets(userId: number) {
		const sockets = await this.server.in(`user:${userId}`).fetchSockets();
		return { sockets, socketIds: sockets.map((socket) => socket.id) };
	}

	async isUserSocket(userId: number, socketId: string): Promise<boolean> {
		const socket = this.server.sockets.get(socketId);

		if (!socket) throw new UnauthorizedException(`Socket ${socketId} not found!`);
		return socket.user.id === userId;
	}

	emit(event: string, data: any, rooms?: string | string[]) {
		if (rooms) this.server.to(rooms).emit(event, data);
		else this.server.emit(event, data);
		this.logger.debug(`Emitting ${event} ${JSON.stringify(data)} to ${rooms ? rooms : 'all'}`);
	}

	emitToUser(event: string, data: any, userId: number): void {
		this.emit(event, data, `user:${userId}`);
		this.logger.debug(`Emitting ${event} (${data}) to user:${userId}`);
	}

	joinRoom(socketId: string, room: string) {
		const socket: Socket = this.server.sockets.get(socketId);

		if (!socket) {
			throw new BadRequestException(`Socket ${socketId} not found.`);
		}

		for (const room of socket.rooms) {
			if (room && (room === socket.id || room.startsWith('user:'))) continue;
			socket.leave(room);
			this.logger.debug(`Socket ${socket.id} left room ${room}`);
		}

		this.logger.debug(`Socket ${socket.id} joined room ${room}`);
		socket.join(room);
	}

	async quitRoom(userId: number, room: string) {
		const { sockets } = await this.fetchSockets(userId);

		for (const socket of sockets) {
			socket.leave(room);
			this.logger.debug(`Socket ${socket.id} left room ${room}`);
		}
	}
}

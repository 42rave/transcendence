import { Socket } from 'socket.io';
import { User } from '@prisma/client';

export default interface SocketWithUser extends Socket {
    user: User
}
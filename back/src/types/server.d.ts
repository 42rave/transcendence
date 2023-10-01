import { Server as IoServer } from 'socket.io';
import Socket from '@type/socket';

export declare type Server = IoServer & { sockets: Map<string, Socket> };

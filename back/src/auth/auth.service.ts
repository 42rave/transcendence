import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';
import { UserService } from '@user/user.service';
import { UserDto } from '@type/user.dto';
import { User } from '@prisma/client';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	) {}

	async validateUser(user: UserDto) {
		// generate a signed json web token with the contents of user object and return it
		const payload = { sub: { id: user.id } };
		return {
			access_token: this.jwtService.sign(payload, {
				secret: authConfig.secret
			})
		};
	}

	async getWsUser(socket: Socket): Promise<User | undefined> {
		try {
			const token = parse(socket.handshake.headers.cookie)['access_token'];
			const payload = this.jwtService.verify(token, {
				secret: authConfig.secret
			});
			socket.user = await this.userService.getById(payload.sub.id);
			return socket.user;
		} catch {
			return undefined;
		}
	}
}

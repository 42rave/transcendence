import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';
import { UserService } from '@user/user.service';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { encode } from 'hi-base32';
import * as qrcode from 'qrcode';
import authConfig from '@config/auth.config';
import Socket from '@type/socket';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	) {}

	async validateUser(user: User, twoFALogged = false): Promise<{ access_token: string }> {
		// generate a signed json web token with the contents of user object and return it
		const payload = { sub: { id: user.id } };
		if (user.twoFAEnabled) payload['sub']['twoFALogged'] = twoFALogged;

		return {
			access_token: this.jwtService.sign(payload, {
				secret: authConfig.secret
			})
		};
	}

	async getWsUser(socket: Socket): Promise<User | undefined> {
		try {
			const token = parse(socket.handshake.headers.cookie || '')['access_token'];
			const payload = this.jwtService.verify(token, {
				secret: authConfig.secret
			});
			const user = await this.userService.getById(payload.sub.id);
			if (user.twoFAEnabled && !payload.sub.twoFALogged) return undefined;
			socket.user = user;
			return socket.user;
		} catch (err) {
			return undefined;
		}
	}

	async generateTotp(user: User) {
		if (user.twoFAEnabled)
			throw new ForbiddenException('Cannot generate secret', { description: 'You already have a secret' });
		const secret = randomBytes(32).toString('hex');
		const iv = randomBytes(16).toString('hex');
		await this.userService.setSecret(user.id, secret, iv);
		const otpauth = `otpauth://totp/Transcendence:${user.username}?secret=${encode(secret)}&issuer=Transcendence`;
		return {
			secret,
			iv,
			qr_code: await qrcode.toDataURL(otpauth),
			otpauth
		};
	}

	async generateOrGetTotp(user: User) {
		if (user.twoFAEnabled)
			throw new ForbiddenException('Cannot get the secret', {
				description: "You can't get the secret since 2fa is enabled"
			});
		const secret = await this.userService.getSecret(user.id);
		if (!secret) return this.generateTotp(user);
		const otpauth = `otpauth://totp/Transcendence:${user.username}?secret=${encode(
			secret.secret
		)}&issuer=Transcendence`;
		return {
			secret: secret.secret,
			iv: secret.iv,
			qr_code: await qrcode.toDataURL(otpauth),
			otpauth
		};
	}
}

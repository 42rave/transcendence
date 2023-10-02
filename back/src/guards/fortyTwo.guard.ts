import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

export class ftGuard extends AuthGuard('42') {
	handleRequest<TUser = User>(err: Error, user: TUser) {
		if (err) throw new UnauthorizedException('Cannot log in with 42.', { description: err.message });
		return user;
	}
}

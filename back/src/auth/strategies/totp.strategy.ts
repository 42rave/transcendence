import { Strategy } from 'passport-totp';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from '@user/user.service';

@Injectable()
export class TotpStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly userService: UserService) {
		super({ window: 1 }, async (user: User, done: (err: Error, key: Buffer, period: number) => any) => {
			const otp = await this.userService.getSecret(user.id);
			if (!otp) {
				return done(
					new ForbiddenException('Cannot validate totp', { description: 'You need to generate a secret first' }),
					null,
					null
				);
			}
			const key = {
				key: Buffer.from(otp.secret),
				period: 30
			};
			return done(null, key.key, key.period);
		});
	}
}

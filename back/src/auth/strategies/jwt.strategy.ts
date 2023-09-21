import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { UserService } from '@user/user.service';
import authConfig from '@config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private userService: UserService) {
		super({
			jwtFromRequest: (req: any) => (req && req.cookies ? req.cookies['access_token'] : null),
			ignoreExpiration: false,
			secretOrKey: authConfig.secret
		});
	}

	async validate(payload: any) {
		return await this.userService.getById(payload.sub.id);
	}
}

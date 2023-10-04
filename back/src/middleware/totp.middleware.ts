import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import type { Request } from '@type/request';
import { JwtService } from '@nestjs/jwt';
import authConfig from '@config/auth.config';
import { DeviceService } from '@auth/device/device.service';

@Injectable()
export class TotpMiddleware implements NestMiddleware {
	constructor(
		private readonly jwtService: JwtService,
		private readonly deviceService: DeviceService
	) {}
	async use(req: Request, res: Response, next: NextFunction) {
		const token = req.cookies['access_token'];
		if (!token) return next();
		let payload = null;
		try {
			payload = this.jwtService.verify(token, { secret: authConfig.secret });
		} catch {
			return next();
		}
		req.twoFALogged =
			(payload.sub.twoFALogged || false) && (await this.deviceService.isTrustedDevice(req, payload.sub.id));
		next();
	}
}

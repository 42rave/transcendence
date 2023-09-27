import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TOTPGuard implements CanActivate {
	async canActivate(context: any): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		if (request.user.twoFAEnabled && !request.twoFALogged)
			throw new UnauthorizedException('Cannot authenticate request', { description: 'You need to log in with 2FA' });
		return true;
	}
}

import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { DeviceService } from '@auth/device/device.service';

@Injectable()
export class TOTPGuard implements CanActivate {
	constructor(private readonly deviceService: DeviceService) {}

	async canActivate(context: any): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		if (request.user.twoFAEnabled) {
			if (!(await this.deviceService.isTrustedDevice(request, request.user.id)))
				throw new UnauthorizedException('Cannot authenticate request', {
					description: 'The current device is unknown.'
				});
			else if (!request.twoFALogged)
				throw new UnauthorizedException('Cannot authenticate request', {
					description: 'You need to log in with 2FA'
				});
		}
		return true;
	}
}

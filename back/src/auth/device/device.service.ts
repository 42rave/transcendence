import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import type { Request } from '@type/request';
import appConfig from '@config/app.config';
import { TrustedDevice } from '@prisma/client';

interface DeviceAccumulator {
	current: TrustedDevice | null;
	devices: TrustedDevice[];
}

@Injectable()
export class DeviceService {
	constructor(private readonly prisma: PrismaService) {}

	async getDevices(userId: number, request: Request): Promise<DeviceAccumulator> {
		const devices = await this.prisma.trustedDevice.findMany({
			where: { userId }
		});
		const currentIp: string = String(appConfig.NODE_ENV === 'development' ? request.ip : request.headers['x-real-ip']);
		console.log(currentIp);
		return devices.reduce(
			(acc: DeviceAccumulator, device) => {
				if (device.ip === currentIp) acc.current = device;
				else acc.devices.push(device);
				return acc;
			},
			{ current: null, devices: [] } as DeviceAccumulator
		);
	}

	async createDevice(userId: number, ip: string): Promise<TrustedDevice> {
		return this.prisma.trustedDevice
			.create({
				data: {
					userId,
					ip
				}
			})
			.catch(() => {
				throw new ConflictException('Cannot create device', { description: 'ip already exists' });
			});
	}

	async deleteDevice(deviceId: number): Promise<TrustedDevice> {
		return this.prisma.trustedDevice.delete({
			where: { id: deviceId }
		});
	}

	async isTrustedDevice(request: Request): Promise<boolean> {
		const currentIp: string = String(appConfig.NODE_ENV === 'development' ? request.ip : request.headers['x-real-ip']);
		const device = await this.prisma.trustedDevice.findUnique({
			where: { ip: currentIp }
		});
		return device?.userId === request.user.id;
	}
}

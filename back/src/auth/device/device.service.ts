import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';
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

	async createDevice(request: Request): Promise<TrustedDevice> {
		const userId = request.user.id;
		const ip: string = String(appConfig.NODE_ENV === 'development' ? request.ip : request.headers['x-real-ip']);

		return this.prisma.trustedDevice.upsert({
			where: { ip },
			update: { userId },
			create: { ip, userId }
		});
	}

	async deleteDevice(deviceId: number, userId: number): Promise<TrustedDevice> {
		return this.prisma.trustedDevice
			.delete({
				where: { id: deviceId, userId }
			})
			.catch(() => {
				throw new BadRequestException('Cannot delete device', { description: 'The device does not exist.' });
			});
	}

	async deleteAllDevices(userId: number): Promise<Prisma.BatchPayload> {
		return this.prisma.trustedDevice
			.deleteMany({
				where: { userId }
			})
			.catch(() => {
				throw new BadRequestException('Cannot delete devices', { description: 'The devices do not exist.' });
			});
	}

	async isTrustedDevice(request: Request, userId: number): Promise<boolean> {
		const currentIp: string = String(appConfig.NODE_ENV === 'development' ? request.ip : request.headers['x-real-ip']);
		const device = await this.prisma.trustedDevice.findUnique({
			where: { ip: currentIp }
		});
		return device?.userId === userId;
	}
}

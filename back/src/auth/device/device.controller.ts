import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import type { Request } from '@type/request';
import { DeviceService } from '@auth/device/device.service';
import { TrustedDevice } from '@prisma/client';

@Controller('/auth/devices')
@UseGuards(...AuthenticatedGuard)
export class DeviceController {
	constructor(private readonly deviceService: DeviceService) {}

	@Get()
	async getDevices(@Req() req: Request): Promise<{ current: TrustedDevice; devices: TrustedDevice[] }> {
		return await this.deviceService.getDevices(req.user.id, req);
	}

	@Delete('/:deviceId')
	async deleteDevice(@Param('deviceId', ParseIntPipe) id: number): Promise<number> {
		return (await this.deviceService.deleteDevice(id)).id;
	}

	@Post()
	async createDevice(@Req() req: Request, @Body() data: { ip: string }): Promise<TrustedDevice> {
		return await this.deviceService.createDevice(req.user.id, data.ip);
	}
}

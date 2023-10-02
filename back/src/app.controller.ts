import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import appConfig from '@config/app.config';

@Controller()
export class AppController {
	@Get()
	status(@Res() res: Response) {
		res.status(200).json({
			message: 'OK',
			status: 200,
			baseURL: appConfig.BASE_URL,
			timestamp: new Date().toISOString(),
			environment: appConfig.NODE_ENV
		});
	}
}

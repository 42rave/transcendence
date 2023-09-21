import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { AuthService } from './auth.service';
import type { Request } from '@type/request';
import { User } from '@prisma/client';
import authConfig from '@config/auth.config';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('login')
	@UseGuards(AuthGuard('42'))
	async login() {}

	@Get('logout')
	async logout(@Req() req: Request, @Res() res: Response) {
		res.clearCookie('access_token', { httpOnly: true }).status(200).send();
	}

	@Get('callback')
	@UseGuards(AuthGuard('42'))
	async callback(@Req() req: Request, @Res() res: Response) {
		const token: { access_token: string } = await this.authService.validateUser(req.user);
		res.cookie('access_token', token.access_token, { httpOnly: true }).redirect(authConfig.webAppURL);
	}

	@Get('me')
	@UseGuards(...AuthenticatedGuard)
	me(@Req() req: Request): User {
		return req.user;
	}
}

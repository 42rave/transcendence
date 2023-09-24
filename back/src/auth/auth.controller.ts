import { Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { JwtGuard } from '@guard/authenticated.guard';
import { AuthService } from './auth.service';
import type { Request } from '@type/request';
import { User } from '@prisma/client';
import authConfig from '@config/auth.config';
import { UserService } from '@user/user.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}

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
	@UseGuards(JwtGuard)
	me(@Req() req: Request): User & { twoFALogged?: boolean } {
		return { ...req.user, twoFALogged: req.twoFALogged };
	}

	@Post('totp')
	@UseGuards(JwtGuard)
	async generateTotp(@Req() req: Request) {
		return this.authService.generateTotp(req.user);
	}

	@Post('totp/verify')
	@UseGuards(JwtGuard, AuthGuard('totp'))
	async verifyTotp(@Req() req: Request, @Res() res: Response) {
		const token: { access_token: string } = await this.authService.validateUser(req.user, true);
		res
			.cookie('access_token', token.access_token, { httpOnly: true })
			.status(200)
			.json({ ...(await this.userService.enableTotp(req.user.id)), twoFALogged: true });
	}

	@Delete('totp')
	@UseGuards(JwtGuard, AuthGuard('totp'))
	async disableTotp(@Req() req: Request, @Res() res: Response) {
		const user = await this.userService.disableTotp(req.user.id);
		const token: { access_token: string } = await this.authService.validateUser(user);
		res.cookie('access_token', token.access_token, { httpOnly: true }).status(200).json(user);
	}
}

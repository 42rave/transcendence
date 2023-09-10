import {Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import authConfig from "../config/auth.config";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('42'))
  async login() {}

  @Get('callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req: any, @Res() res: any) {
    const token: { access_token: string } = await this.authService.validateUser(req.user);
    console.log(authConfig);
    res.cookie('access_token', token.access_token, {httpOnly: true}).redirect(authConfig.webAppURL);
  }
}

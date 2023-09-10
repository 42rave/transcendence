import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import intraConfig from 'src/config/intra.config';
import { UserDto } from "../../types/user.dto";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy){
  constructor(
    private readonly authService: AuthService,
    private userService: UserService
  ) {
    super({
      clientID: intraConfig.uid,
      clientSecret: intraConfig.secret,
      callbackURL: intraConfig.callbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const fortyTwoUser = {
      id: Number.parseInt(profile.id),
      username : profile.username,
      avatar: profile._json.image.link,
    };
    return await this.userService.createOrUpdate(fortyTwoUser as UserDto);
  }
}
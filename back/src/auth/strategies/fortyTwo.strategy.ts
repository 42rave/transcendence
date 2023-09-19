import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { AuthService } from '@auth/auth.service';
import { UserService } from '@user/user.service';
import { UserDto } from '@type/user.dto';
import intraConfig from '@config/intra.config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {
    super({
      clientID: intraConfig.uid,
      clientSecret: intraConfig.secret,
      callbackURL: intraConfig.callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const fortyTwoUser = {
      id: Number.parseInt(profile.id),
      username: profile.username,
      avatar: profile._json.image.link,
    };
    return await this.userService.createOrUpdate(fortyTwoUser as UserDto);
  }
}

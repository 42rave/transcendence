import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import authConfig from 'src/config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(
    private userService: UserService
  ){
    super({
      jwtFromRequest: (req: any) => (req && req.cookies) ? req.cookies['access_token'] : null,
      ignoreExpiration: false,
      secretOrKey: authConfig.secret,
    })
  }

  async validate(payload: any){
    return await this.userService.getById(payload.sub.id);
  }
}
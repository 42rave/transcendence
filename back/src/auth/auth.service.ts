import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from "../types/user.dto";
import authConfig from "../config/auth.config";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(user: UserDto) {
    // generate a signed json web token with the contents of user object and return it
    const payload = { sub: { id: user.id } };
    return {
      access_token: this.jwtService.sign(payload, { secret: authConfig.secret }),
    }
  }
}

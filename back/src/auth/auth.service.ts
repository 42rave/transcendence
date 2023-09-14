import { Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { UserService } from "../user/user.service";
import { UserDto } from "../types/user.dto";
import { User } from "@prisma/client";
import Socket from '../types/socket';
import authConfig from "../config/auth.config";

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async validateUser(user: UserDto) {
    // generate a signed json web token with the contents of user object and return it
    const payload = { sub: { id: user.id } };
    return {
      access_token: this.jwtService.sign(payload, { secret: authConfig.secret }),
    }
  }

  async getWsUser(socket: Socket) : Promise<User | undefined> {
    try {
      const token = parse(socket.handshake.headers.cookie)['access_token'];
        const payload = this.jwtService.verify(token, { secret: authConfig.secret });
        socket.user = await this.userService.getById(payload.sub.id);
        return socket.user;
    }
    catch {
      return undefined;
    }
  }
}

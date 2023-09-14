import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    switch (context.getType()) {
      case 'http': {
        return super.canActivate(context);
      }
      case 'ws': {
        const socket = context.switchToWs().getClient();
        console.log('socket', socket.handshake.headers);
        this.authService.getWsUser(socket).then(user => {
          socket.user = user;
        });
        return !!socket.user;
      }
    }
  }
}

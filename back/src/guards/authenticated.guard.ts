import { AuthGuard } from '@nestjs/passport';
import { TOTPGuard } from '@guard/totp.guard';

export const AuthenticatedGuard = [AuthGuard('jwt'), TOTPGuard];
export const JwtGuard = AuthGuard('jwt');

import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { Type } from '@nestjs/common';

export const AuthenticatedGuard: Type<IAuthGuard>[] = [
    AuthGuard('jwt'),
];
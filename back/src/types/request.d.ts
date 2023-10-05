import * as express from 'express';
import { User } from '@prisma/client';

export declare type Request = express.Request & {
	user: User;
	twoFALogged?: boolean;
};

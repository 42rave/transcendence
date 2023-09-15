import * as express from 'express';
import { User } from '@prisma/client';

export declare type Request<T = any> = express.Request & {
    user: User,
}
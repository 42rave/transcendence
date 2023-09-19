import * as express from 'express';
import { User } from '@prisma/client';
import { PaginationDto } from '@type/pagination.dto';

export declare type Request<T = any> = express.Request & {
    user: User,
    pagination: PaginationDto,
}
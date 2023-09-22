import * as express from 'express';
import { User } from '@prisma/client';
import { PaginationDto } from '@type/pagination.dto';

export declare type Request = express.Request & {
	user: User;
	pagination: PaginationDto;
};

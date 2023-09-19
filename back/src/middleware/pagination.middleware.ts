import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import type { Request } from '@type/request';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '@type/pagination.dto';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const pagination: PaginationDto = plainToInstance(
      PaginationDto,
      req.query,
      { enableImplicitConversion: true },
    );

    const errors: ValidationError[] = await validate(pagination);
    if (errors.length > 0) {
      /*
       ** A Validation error contains an object 'constraints', the keys are the Validator type
       ** (i.e. IsNumber, IsOptional), and the value is an error message like 'variable must be a ...'
       ** The following instructions builds a list containing each constraint of each ValidationError
       */
      const constraints: string[] = errors.reduce(
        (accumulator: string[], error: ValidationError) => {
          const errorValues: string[] = Object.values(error.constraints);
          return [...accumulator, ...errorValues];
        },
        [],
      );
      throw new BadRequestException(constraints);
    }
    req.pagination = pagination;
    next();
  }
}

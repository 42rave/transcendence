import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ServeStaticExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost): any {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		if (exception.code === 'ENOENT') response.status(HttpStatus.NOT_FOUND).json(exception);
		else if (status === 500) console.error(exception);
		response.status(status).json(exception.response);
	}
}

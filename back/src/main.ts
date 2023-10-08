import { ServeStaticExceptionFilter } from '@/filters/serve-static.exception';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import apiConfig from './config/api.config';
import authConfig from './config/auth.config';
import * as cookieParser from 'cookie-parser';
import { mkdirSync } from 'fs';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log', 'debug', 'verbose']
	});
	app.use(cookieParser());
	app.enableCors({
		origin: authConfig.webAppURL,
		credentials: true
	});
	mkdirSync('./avatars', { recursive: true });
	app.useGlobalFilters(new ServeStaticExceptionFilter());
	await app.listen(apiConfig.port);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import apiConfig from './config/api.config';
import authConfig from "./config/auth.config";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: authConfig.webAppURL,
    credentials: true,
  })
  await app.listen(apiConfig.port);
}
bootstrap();

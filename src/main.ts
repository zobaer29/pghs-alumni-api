import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const clientUrls = (process.env.CLIENT_URL ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: clientUrls.length > 0 ? clientUrls : true,
    credentials: true,
  });

  app.use(cookieParser());
  
  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 5000);
  await app.listen(port);
  console.log(`🚀 NestJS Alumni API Server running on port ${port}`);
}

bootstrap();

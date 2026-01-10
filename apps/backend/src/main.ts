import { join } from 'path';
import { config } from 'dotenv';
config({ path: join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('BACKEND_PORT') ?? 3001;

  console.log('=== ENV DEBUG ===');
  console.log('DATABASE_URL:', configService.get('DATABASE_URL'));
  console.log('BACKEND_PORT:', configService.get('BACKEND_PORT'));
  console.log('================');

  // Enable CORS for better-auth OAuth callbacks
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // Global validation pipe
  // app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}`);
}
bootstrap();

import { join } from 'path';
import { config } from 'dotenv';
config({ path: join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('BOT_PORT') ?? 3002;
  await app.listen(port);
  console.log(`Bot app is running on: http://localhost:${port}`);
}
bootstrap();

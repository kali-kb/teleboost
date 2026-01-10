import { join } from 'path';
import { config } from 'dotenv';
config({ path: join(process.cwd(), '.env') });

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramModule } from './telegram/telegram.module';
import { ApiClientModule } from './api/api-client.module';
import { session } from 'telegraf';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('BOT_TOKEN')!,
        middlewares: [session()],
      }),
    }),
    TelegramModule,
    ApiClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

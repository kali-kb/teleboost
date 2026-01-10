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
import { UpstashRedisStore } from './telegram/upstash-redis.store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const token = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
        const botToken = configService.get<string>('BOT_TOKEN');

        console.log('--- Telegraf Module Initialization ---');
        console.log('BOT_TOKEN defined:', !!botToken);
        console.log('REDIS_URL defined:', !!url);
        console.log('REDIS_TOKEN defined:', !!token);

        const store = new UpstashRedisStore(url!, token!);
        return {
          token: botToken!,
          middlewares: [
            (ctx: any, next: any) => {
              console.log(`>>> Incoming Update [${ctx.updateType}]`);
              if (ctx.message) console.log('Message text:', ctx.message.text);
              return next();
            },
            session({ store }),
            async (ctx: any, next: any) => {
              const text = ctx.message?.text;
              if (text?.startsWith('/start') || text === '/reset' || text === '/cancel') {
                if (ctx.session?.__scenes) {
                  console.log(`[Middleware] Clearing trapped scene state for command: ${text}`);
                  delete ctx.session.__scenes;
                }
              }
              return next();
            },
          ],
        };
      },
    }),
    TelegramModule,
    ApiClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

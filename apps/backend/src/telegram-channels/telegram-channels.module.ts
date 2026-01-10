import { Module } from '@nestjs/common';
import { TelegramChannelsService } from './telegram-channels.service';
import { TelegramChannelsController } from './telegram-channels.controllers';

@Module({
  controllers: [TelegramChannelsController],
  providers: [TelegramChannelsService],
  exports: [TelegramChannelsService],
})
export class TelegramChannelsModule {}

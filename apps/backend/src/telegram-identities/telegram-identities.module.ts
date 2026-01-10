import { Module } from '@nestjs/common';
import { TelegramIdentitiesService } from './telegram-identities.service';
import { TelegramIdentitiesController } from './telegram-identities.controller';

@Module({
  controllers: [TelegramIdentitiesController],
  providers: [TelegramIdentitiesService],
})
export class TelegramIdentitiesModule {}

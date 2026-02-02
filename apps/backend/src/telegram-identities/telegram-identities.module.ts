import { Module } from '@nestjs/common';
import { TelegramIdentitiesService } from './telegram-identities.service';
import { TelegramIdentitiesController } from './telegram-identities.controller';

import { WalletModule } from '../wallet/wallet.module';
import { DatabaseModule } from '../../drizzle/db/database.module';

@Module({
  imports: [DatabaseModule, WalletModule],
  controllers: [TelegramIdentitiesController],
  providers: [TelegramIdentitiesService],
  exports: [TelegramIdentitiesService],
})
export class TelegramIdentitiesModule { }

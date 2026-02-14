import { join } from 'path';
import { config } from 'dotenv';
config({ path: join(process.cwd(), '.env') });

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../drizzle/db/database.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from 'lib/auth';
import { UserModule } from './user/user.module';
// import { DebugController } from './debug/debug.controller';
import { TelegramIdentitiesModule } from './telegram-identities/telegram-identities.module';
import { TelegramChannelsModule } from './telegram-channels/telegram-channels.module';
import { AdvertiserModule } from './advertiser/advertiser.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { WalletModule } from './wallet/wallet.module';
import { BankAccountModule } from './bank-accounts/bank-account.module';
import { WithdrawalModule } from './withdrawals/withdrawal.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule.forRoot({
      auth,
    }),
    UserModule,
    TelegramIdentitiesModule,
    TelegramChannelsModule,
    AdvertiserModule,
    CampaignsModule,
    WalletModule,
    BankAccountModule,
    WithdrawalModule,
    PaymentsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

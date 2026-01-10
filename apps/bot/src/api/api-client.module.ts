import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramIdentityService } from './telegram-identity/telegram-identity.service';
import { TelegramChannelService } from './telegram-channel/telegram-channel.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramIdentityService, TelegramChannelService],
  exports: [TelegramIdentityService, TelegramChannelService],
})
export class ApiClientModule {}

import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { RegisterChannelWizard } from './register-channel.scene';
import { ApiClientModule } from '../api/api-client.module';

@Module({
  imports: [ApiClientModule],
  providers: [TelegramService, TelegramUpdate, RegisterChannelWizard],
  exports: [TelegramService],
})
export class TelegramModule {}

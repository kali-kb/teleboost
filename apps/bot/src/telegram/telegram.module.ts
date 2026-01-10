import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { RegisterChannelWizard } from './scenes/register-channel.scene';
import { EditChannelWizard } from './scenes/edit-channel.scene';
import { ApiClientModule } from '../api/api-client.module';

@Module({
  imports: [ApiClientModule],
  providers: [
    TelegramService,
    TelegramUpdate,
    RegisterChannelWizard,
    EditChannelWizard,
  ],
  exports: [TelegramService],
})
export class TelegramModule { }

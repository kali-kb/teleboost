import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { RegisterChannelWizard } from './register-channel.scene';

@Module({
    providers: [TelegramService, TelegramUpdate, RegisterChannelWizard],
    exports: [TelegramService],
})
export class TelegramModule { }

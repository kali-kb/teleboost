import { Module } from '@nestjs/common';
import { AdvertiserController } from './advertiser.controller';
import { AdvertiserService } from './advertiser.service';
import { WalletModule } from '../wallet/wallet.module';
import { DatabaseModule } from '../../drizzle/db/database.module';

@Module({
    imports: [DatabaseModule, WalletModule],
    controllers: [AdvertiserController],
    providers: [AdvertiserService],
    exports: [AdvertiserService],
})
export class AdvertiserModule { }

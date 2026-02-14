import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WalletModule } from '../wallet/wallet.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { AdvertiserModule } from '../advertiser/advertiser.module';

@Module({
    imports: [WalletModule, CampaignsModule, AdvertiserModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }

import { Injectable } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { AdvertiserService } from '../advertiser/advertiser.service';
import { CampaignStatus } from '../../drizzle/db/schema/enums/campaign_status';

@Injectable()
export class DashboardService {
    constructor(
        private readonly walletService: WalletService,
        private readonly campaignsService: CampaignsService,
        private readonly advertiserService: AdvertiserService,
    ) { }

    async getDashboardData(userId: string) {
        // 1. Get Wallet info
        const wallet = await this.walletService.getWalletByUserId(userId);
        let walletInfo: any = null;
        let recentTransactions: any[] = [];

        if (wallet) {
            walletInfo = await this.walletService.getBalance(wallet.id);
            recentTransactions = await this.walletService.getTransactions(wallet.id);
        }

        // 2. Get Campaigns info
        const campaigns = await this.campaignsService.getCampaignsByAdvertiserId(userId);

        const campaignsSummary = {
            total: campaigns.length,
            active: campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length,
            draft: campaigns.filter(c => c.status === CampaignStatus.DRAFT).length,
            completed: campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length,
        };

        // 3. Get profile status
        const profile = await this.advertiserService.getProfile(userId);

        return {
            wallet: walletInfo,
            recentTransactions: recentTransactions.slice(0, 5), // Only last 5
            campaignsSummary,
            recentCampaigns: campaigns.slice(0, 5), // Only last 5
            profileStatus: profile ? 'COMPLETE' : 'INCOMPLETE',
        };
    }
}

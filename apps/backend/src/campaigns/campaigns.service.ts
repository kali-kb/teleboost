import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/db/schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { campaigns } from '../../drizzle/db/schema/campaigns';
import { CampaignStatus } from '../../drizzle/db/schema/enums/campaign_status';
import { eq, and } from 'drizzle-orm';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async createCampaign(advertiser_id: string, createCampaignDto: CreateCampaignDto) {
        return await this.db.transaction(async (tx) => {
            const { placements, ...campaignData } = createCampaignDto;

            const [campaign] = await tx
                .insert(campaigns)
                .values({
                    ...campaignData,
                    advertiser_id,
                    status: campaignData.status ?? CampaignStatus.DRAFT,
                })
                .returning();

            if (placements && placements.length > 0) {
                await tx.insert(schema.campaign_placements).values(
                    placements.map((p) => ({
                        campaign_id: campaign.id,
                        channel_id: p.channel_id,
                        price: p.price,
                        status: schema.CampaignPlacementStatus.PENDING_PAYMENT,
                    })),
                );
            }

            return campaign;
        });
    }

    async getCampaigns() {
        return this.db.select().from(campaigns);
    }

    async getCampaignById(id: string) {
        const [result] = await this.db.select().from(campaigns).where(eq(campaigns.id, id));
        return result;
    }

    async getCampaignsByAdvertiserId(advertiser_id: string) {
        return this.db.query.campaigns.findMany({
            where: eq(campaigns.advertiser_id, advertiser_id),
            with: {
                placements: true,
            },
            orderBy: (campaigns, { desc }) => [desc(campaigns.created_at)],
        });
    }

    async updateCampaign(id: string, advertiser_id: string, updateCampaignDto: UpdateCampaignDto) {
        return this.db
            .update(campaigns)
            .set(updateCampaignDto)
            .where(and(eq(campaigns.id, id), eq(campaigns.advertiser_id, advertiser_id)))
            .returning();
    }
}

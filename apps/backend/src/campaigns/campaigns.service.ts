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
        const [result] = await this.db
            .insert(campaigns)
            .values({
                ...createCampaignDto,
                advertiser_id,
                status: createCampaignDto.status ?? CampaignStatus.DRAFT,
            })
            .returning();
        return result;
    }

    async getCampaigns() {
        return this.db.select().from(campaigns);
    }

    async getCampaignById(id: string) {
        const [result] = await this.db.select().from(campaigns).where(eq(campaigns.id, id));
        return result;
    }

    async getCampaignsByAdvertiserId(advertiser_id: string) {
        return this.db.select().from(campaigns).where(eq(campaigns.advertiser_id, advertiser_id));
    }

    async updateCampaign(id: string, advertiser_id: string, updateCampaignDto: UpdateCampaignDto) {
        return this.db
            .update(campaigns)
            .set(updateCampaignDto)
            .where(and(eq(campaigns.id, id), eq(campaigns.advertiser_id, advertiser_id)))
            .returning();
    }
}

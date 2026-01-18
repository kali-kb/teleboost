import { Injectable } from "@nestjs/common";
import { DRIZZLE } from "../../drizzle/db/database.module";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../drizzle/db/schema";
import { Inject } from "@nestjs/common";

@Injectable()
export class CampaignPlacementsService { 
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async createBulkCampaignPlacements(data: (typeof schema.campaign_placements.$inferInsert)[]) {
        return await this.db.insert(schema.campaign_placements).values(data).returning();
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdvertiserService {
    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async getProfile(userId: string) {
        console.log(`[AdvertiserService] Searching for profile for user: ${userId}`);
        const results = await this.db
            .select()
            .from(schema.advertiser_profiles)
            .where(eq(schema.advertiser_profiles.user_id, userId as any))
            .limit(1);

        console.log(`[AdvertiserService] Profile search found ${results.length} results`);
        return results[0];
    }

    async upsertProfile(userId: string, data: {
        type: 'INDIVIDUAL' | 'ENTERPRISE';
        companyName?: string;
        registrationNumber?: string;
        website?: string;
    }) {
        try {
            console.log(`[AdvertiserService] Upserting profile for user ${userId}`, JSON.stringify(data, null, 2));
            const existing = await this.getProfile(userId);

            if (existing) {
                console.log(`[AdvertiserService] Found existing profile for ${userId}, updating...`);
                const updated = await this.db
                    .update(schema.advertiser_profiles)
                    .set({
                        type: data.type || 'INDIVIDUAL',
                        company_name: data.companyName,
                        company_registration_number: data.registrationNumber,
                        website: data.website,
                    })
                    .where(eq(schema.advertiser_profiles.user_id, userId as any))
                    .returning();
                console.log(`[AdvertiserService] Profile updated successfully for ${userId}`);
                return updated[0];
            }

            console.log(`[AdvertiserService] No profile found for ${userId}, creating new...`);
            const created = await this.db
                .insert(schema.advertiser_profiles)
                .values({
                    user_id: userId as any,
                    type: data.type || 'INDIVIDUAL',
                    company_name: data.companyName,
                    company_registration_number: data.registrationNumber,
                    website: data.website,
                })
                .returning();

            console.log(`[AdvertiserService] Profile created successfully for ${userId}`);

            // Verification check
            const check = await this.getProfile(userId);
            console.log(`[AdvertiserService] Verification check result for ${userId}:`, check ? 'Stored' : 'Not Stored');

            return created[0];
        } catch (error) {
            console.error(`[AdvertiserService] Error in upsertProfile for user ${userId}:`, error);
            throw error;
        }
    }
}

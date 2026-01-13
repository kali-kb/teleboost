import { Controller, Post, Get, Body } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { AdvertiserService } from './advertiser.service';
import { CreateAdvertiserProfileDto } from './dto/create-advertiser-profile.dto';

@Controller('advertiser')
export class AdvertiserController {
    constructor(private readonly advertiserService: AdvertiserService) { }

    @Get('profile')
    async getProfile(@Session() session: UserSession) {
        if (!session?.user) return null;
        console.log(`[AdvertiserController] GET /profile check for user ${session.user.id}`);
        const profile = await this.advertiserService.getProfile(session.user.id);
        console.log(`[AdvertiserController] Profile search result:`, profile ? 'Found' : 'Not Found');
        if (!profile) return { exists: false };
        return { ...profile, exists: true };
    }

    @Post('profile')
    async createProfile(
        @Session() session: UserSession,
        @Body()
        body: CreateAdvertiserProfileDto,
    ) {
        console.log(`[AdvertiserController] POST /profile received from ${session?.user?.id}`, body);
        if (!session?.user) return { error: 'Unauthorized' };
        const result = await this.advertiserService.upsertProfile(session.user.id, body);
        console.log(`[AdvertiserController] Profile upsert result:`, result ? 'Success' : 'Failed');
        return result;
    }
}

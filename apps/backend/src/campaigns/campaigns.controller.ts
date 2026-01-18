import { Controller, Post, Body, Get, Param, Patch, UnauthorizedException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  @Post()
  async createCampaign(@Session() session: UserSession, @Body() createCampaignDto: CreateCampaignDto) {
    if (!session?.user?.id) throw new UnauthorizedException();
    return this.campaignsService.createCampaign(session.user.id, createCampaignDto);
  }

  @Get()
  async getMyCampaigns(@Session() session: UserSession) {
    if (!session?.user?.id) throw new UnauthorizedException();
    return this.campaignsService.getCampaignsByAdvertiserId(session.user.id);
  }

  @Get(':id')
  async getCampaignById(@Session() session: UserSession, @Param('id') id: string) {
    if (!session?.user?.id) throw new UnauthorizedException();
    const campaign = await this.campaignsService.getCampaignById(id);
    if (!campaign || campaign.advertiser_id !== session.user.id) {
      throw new UnauthorizedException('Campaign not found or access denied');
    }
    return campaign;
  }

  @Patch(':id')
  async updateCampaign(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    if (!session?.user?.id) throw new UnauthorizedException();
    return this.campaignsService.updateCampaign(id, session.user.id, updateCampaignDto);
  }
}

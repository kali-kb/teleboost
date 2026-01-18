import { Module } from '@nestjs/common';
import { CampaignPlacementsService } from './campaign-placements.service';

@Module({
//   controllers: [CampaignPlacementsController],
  providers: [CampaignPlacementsService],
  exports: [CampaignPlacementsService],
})
export class CampaignPlacementsModule {}

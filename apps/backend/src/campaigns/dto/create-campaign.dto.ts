import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum, IsUUID } from 'class-validator';
import { CampaignStatus } from '../../../drizzle/db/schema/enums/campaign_status';

export class CreateCampaignDto {
    @IsString()
    @IsNotEmpty()
    marketing_copy: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @IsEnum(CampaignStatus)
    @IsOptional()
    status?: CampaignStatus;
}

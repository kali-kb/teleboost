import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  IsDecimal,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChannelAudienceDto {
  @IsString()
  @IsOptional()
  primaryCountry?: string;

  @IsString()
  @IsOptional()
  primaryCity?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  niche?: string;

  @IsBoolean()
  @IsOptional()
  isLocal?: boolean;
}

export class CreateTelegramChannelsDto {
  @IsString()
  ownerId: string;

  @IsString()
  channelId: string;

  @IsString()
  channelName: string;

  @IsString()
  @IsOptional()
  channelUsername?: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(1)
  subscribers: number;

  @IsNumber()
  avgViews: number;

  @IsNumber()
  pricePerPost: number;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsString()
  @IsOptional()
  verificationMethod?: string;

  @IsNumber()
  trustScore: number;

  @ValidateNested()
  @Type(() => CreateChannelAudienceDto)
  @IsOptional()
  audience?: CreateChannelAudienceDto;
}

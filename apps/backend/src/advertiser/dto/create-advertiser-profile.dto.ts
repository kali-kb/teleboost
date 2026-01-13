import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator";
import { AdvertiserType } from "../../../drizzle/db/schema/enums/advertiser_types";

export class CreateAdvertiserProfileDto {
    @IsEnum(AdvertiserType)
    type: AdvertiserType;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    registrationNumber?: string;

    @IsOptional()
    @IsString()
    website?: string;
}

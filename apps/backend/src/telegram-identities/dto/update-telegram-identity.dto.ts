import { PartialType } from '@nestjs/mapped-types';
import { CreateTelegramIdentityDto } from './create-telegram-identity.dto';

export class UpdateTelegramIdentityDto extends PartialType(CreateTelegramIdentityDto) {}

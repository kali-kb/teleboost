import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TelegramIdentitiesService } from './telegram-identities.service';
import { CreateTelegramIdentityDto } from './dto/create-telegram-identity.dto';
import { UpdateTelegramIdentityDto } from './dto/update-telegram-identity.dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('telegram-identities')
@AllowAnonymous()
export class TelegramIdentitiesController {
  constructor(private readonly telegramIdentitiesService: TelegramIdentitiesService) {}

  @Post()
  create(@Body() createTelegramIdentityDto: CreateTelegramIdentityDto) {
    return this.telegramIdentitiesService.create(createTelegramIdentityDto);
  }

  @Get()
  findAll() {
    return this.telegramIdentitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telegramIdentitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTelegramIdentityDto: UpdateTelegramIdentityDto) {
    return this.telegramIdentitiesService.update(id, updateTelegramIdentityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telegramIdentitiesService.remove(id);
  }
}

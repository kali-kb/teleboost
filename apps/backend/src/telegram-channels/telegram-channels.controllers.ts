import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TelegramChannelsService } from './telegram-channels.service';
import { CreateTelegramChannelsDto } from './dto/create-telegram-channels.dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('telegram-channels')
@AllowAnonymous()
export class TelegramChannelsController {
  constructor(
    private readonly telegramChannelsService: TelegramChannelsService,
  ) {}

  @Get()
  async getAllTelegramChannels() {
    return this.telegramChannelsService.getAllTelegramChannels();
  }

  @Get(':id')
  async getTelegramChannelById(@Param('id') id: string) {
    return this.telegramChannelsService.getTelegramChannelById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTelegramChannel(@Body() dto: CreateTelegramChannelsDto) {
    return this.telegramChannelsService.createTelegramChannel(dto);
  }

  @Put(':id')
  async updateTelegramChannel(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTelegramChannelsDto>,
  ) {
    return this.telegramChannelsService.updateTelegramChannel(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTelegramChannel(@Param('id') id: string) {
    await this.telegramChannelsService.deleteTelegramChannel(id);
  }
}

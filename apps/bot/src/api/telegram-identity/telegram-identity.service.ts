import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CreateTelegramIdentityDto {
  telegramId: string;
  userName: string;
  firstName: string;
}

export interface TelegramIdentity {
  id: string;
  telegram_id: string;
  user_name: string;
  first_name: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TelegramIdentityService {
  private readonly logger = new Logger(TelegramIdentityService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL =
      this.configService.get<string>('API_URL') ||
      'http://localhost:3001/api';

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async create(data: CreateTelegramIdentityDto): Promise<TelegramIdentity> {
    try {
      const response = await this.client.post('/telegram-identities', data);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create telegram identity: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<TelegramIdentity[]> {
    try {
      const response = await this.client.get('/telegram-identities');
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch telegram identities: ${error.message}`,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<TelegramIdentity> {
    try {
      const response = await this.client.get(`/telegram-identities/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch telegram identity ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<CreateTelegramIdentityDto>,
  ): Promise<TelegramIdentity> {
    try {
      const response = await this.client.patch(
        `/telegram-identities/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to update telegram identity ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<TelegramIdentity> {
    try {
      const response = await this.client.delete(`/telegram-identities/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to delete telegram identity ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByTelegramId(telegramId: string): Promise<TelegramIdentity | null> {
    try {
      const identities = await this.findAll();
      return (
        identities.find((identity) => identity.telegram_id === telegramId) ||
        null
      );
    } catch (error) {
      this.logger.error(
        `Failed to find identity by telegram ID ${telegramId}: ${error.message}`,
      );
      return null;
    }
  }
}

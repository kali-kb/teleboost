import { Test, TestingModule } from '@nestjs/testing';
import { TelegramIdentitiesService } from './telegram-identities.service';

describe('TelegramIdentitiesService', () => {
  let service: TelegramIdentitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramIdentitiesService],
    }).compile();

    service = module.get<TelegramIdentitiesService>(TelegramIdentitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

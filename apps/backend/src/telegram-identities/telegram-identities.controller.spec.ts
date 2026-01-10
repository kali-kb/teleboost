import { Test, TestingModule } from '@nestjs/testing';
import { TelegramIdentitiesController } from './telegram-identities.controller';
import { TelegramIdentitiesService } from './telegram-identities.service';

describe('TelegramIdentitiesController', () => {
  let controller: TelegramIdentitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramIdentitiesController],
      providers: [TelegramIdentitiesService],
    }).compile();

    controller = module.get<TelegramIdentitiesController>(TelegramIdentitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

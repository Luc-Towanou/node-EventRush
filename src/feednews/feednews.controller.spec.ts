import { Test, TestingModule } from '@nestjs/testing';
import { FeednewsController } from './feednews.controller';

describe('FeednewsController', () => {
  let controller: FeednewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeednewsController],
    }).compile();

    controller = module.get<FeednewsController>(FeednewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FeednewsService } from './feednews.service';

describe('FeednewsService', () => {
  let service: FeednewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeednewsService],
    }).compile();

    service = module.get<FeednewsService>(FeednewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

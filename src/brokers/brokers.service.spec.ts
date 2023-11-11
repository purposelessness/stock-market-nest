import { Test, TestingModule } from '@nestjs/testing';
import { BrokersService } from './brokers.service';

describe('BrokersService', () => {
  let service: BrokersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrokersService],
    }).compile();

    service = module.get<BrokersService>(BrokersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BrokersGateway } from './brokers.gateway';
import { BrokersService } from './brokers.service';

describe('BrokersGateway', () => {
  let gateway: BrokersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrokersGateway, BrokersService],
    }).compile();

    gateway = module.get<BrokersGateway>(BrokersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

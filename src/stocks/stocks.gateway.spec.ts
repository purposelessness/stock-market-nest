import { Test, TestingModule } from '@nestjs/testing';
import { StocksGateway } from './stocks.gateway';
import { StocksService } from './stocks.service';

describe('StocksGateway', () => {
  let gateway: StocksGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StocksGateway, StocksService],
    }).compile();

    gateway = module.get<StocksGateway>(StocksGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

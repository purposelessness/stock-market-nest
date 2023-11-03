import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksGateway } from './stocks.gateway';

@Module({
  controllers: [StocksGateway],
  providers: [StocksGateway, StocksService],
})
export class StocksModule {}

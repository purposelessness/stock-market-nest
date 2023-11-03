import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { ControllerModule } from './controller/controller.module';

@Module({
  imports: [StocksModule, ControllerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

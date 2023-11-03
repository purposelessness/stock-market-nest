import { Module } from '@nestjs/common';
import { ControllerService } from './controller.service';
import { ControllerGateway } from './controller.gateway';

@Module({
  providers: [ControllerGateway, ControllerService],
})
export class ControllerModule {}

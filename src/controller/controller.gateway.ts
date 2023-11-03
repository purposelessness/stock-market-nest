import {
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ControllerService } from './controller.service';
import { Controller, Post } from '@nestjs/common';

@Controller('/controller')
@WebSocketGateway()
export class ControllerGateway {
  @WebSocketServer() server: any;

  constructor(private readonly controllerService: ControllerService) {
    controllerService.onClock = this.clock;
  }

  @Post('set-date')
  setDate(@MessageBody() date: Date): void {
    this.server.emit('clockStocks', this.controllerService.setDate(date));
  }

  @Post('start-clock')
  startClock() {
    this.controllerService.startClock();
  }

  @Post('stop-clock')
  stopClock() {
    this.controllerService.stopClock();
  }

  private clock = (date: Date): void => {
    this.server.emit('clockStocks', date);
  };
}

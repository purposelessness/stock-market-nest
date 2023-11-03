import {
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ControllerService } from './controller.service';
import { Controller, Get, Post } from '@nestjs/common';

@Controller('/controller')
@WebSocketGateway()
export class ControllerGateway {
  @WebSocketServer() server: any;

  constructor(private readonly controllerService: ControllerService) {
    controllerService.onClock = this.clock;
  }

  @Post('date')
  setDate(@MessageBody() date: Date): void {
    this.controllerService.date = date;
    this.server.emit('clockStocks', this.controllerService.date);
  }

  @Get('date')
  getDate(): Date {
    return this.controllerService.date;
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

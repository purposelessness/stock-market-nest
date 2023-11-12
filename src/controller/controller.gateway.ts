import { Controller, Get, Logger, Post } from '@nestjs/common';
import {
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { io } from 'socket.io-client';

import { ControllerService } from './controller.service';
import { STOCKS_SOCKET_URI } from '../consts';

@Controller('/controller')
@WebSocketGateway({
  namespace: '/controller',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  },
})
export class ControllerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger: Logger = new Logger(ControllerGateway.name);

  private readonly stocksIo = io(STOCKS_SOCKET_URI);

  constructor(private readonly controllerService: ControllerService) {
    controllerService.onClock = this.clock;
  }

  public afterInit(): any {
    this.stocksIo.on('connect', () => {
      this.logger.debug('Connected to stocks');
    });
    this.logger.debug('Initialized');
  }

  public handleConnection(client: any): any {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: any): any {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('setDate')
  setDate(@MessageBody() date: string): void {
    this.logger.debug(`Date set: ${date}`);
    this.controllerService.date = new Date(date);
    this.stocksIo.emit('clockStocks', {
      date: this.controllerService.date,
    });
  }

  @SubscribeMessage('setClockDelay')
  setClockDelay(@MessageBody() delay: number): void {
    this.logger.debug(`Clock delay set: ${delay}`);
    this.controllerService.setClockSpeed(delay);
  }

  @SubscribeMessage('startClock')
  startClockMessage(): void {
    this.logger.debug(`Clock started`);
    this.controllerService.startClock();
  }

  @SubscribeMessage('stopClock')
  stopClockMessage(): void {
    this.logger.debug(`Clock stopped`);
    this.controllerService.stopClock();
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

  @Post('set-clock-delay')
  setClockSpeed(@MessageBody('delay') delay: number) {
    this.controllerService.setClockSpeed(delay);
  }

  private clock = (date: Date): void => {
    this.stocksIo.emit('clockStocks', {
      date: date,
    });
  };
}

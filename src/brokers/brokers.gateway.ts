import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { BrokersService } from './brokers.service';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Broker } from './entities/broker.entity';
import { io } from 'socket.io-client';

@WebSocketGateway({
  namespace: '/brokers',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  },
})
export class BrokersGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  private readonly stockIo = io('http://localhost:3000/stocks');

  private readonly logger = new Logger(BrokersGateway.name);

  constructor(private readonly brokersService: BrokersService) {}

  afterInit() {
    this.stockIo.on('updateStock', () => {
      this.updateBrokers();
    });
  }

  private send(event: string, message: any) {
    this.server.emit(event, message);
    return message;
  }

  private updateBrokers() {
    this.brokersService.findAll().forEach((broker) => {
      this.send('updated', broker.toJson());
    });
  }

  @SubscribeMessage('create')
  create(@MessageBody() createBrokerDto: CreateBrokerDto) {
    const res = this.brokersService.create(createBrokerDto);
    return this.send('created', res);
  }

  @SubscribeMessage('findAll')
  findAll() {
    return this.brokersService.findAll().map((broker) => broker.toJson());
  }

  @SubscribeMessage('find')
  find(@MessageBody() id: number) {
    return this.brokersService.findOne(id).toJson();
  }

  @SubscribeMessage('findByLogin')
  findByLogin(@MessageBody() login: string) {
    return this.brokersService.findByLogin(login).toJson();
  }

  @SubscribeMessage('update')
  update(@MessageBody() updateBrokerDto: UpdateBrokerDto) {
    const res = this.brokersService.update(updateBrokerDto.id, updateBrokerDto);
    return this.send('updated', res.toJson());
  }

  @SubscribeMessage('remove')
  remove(@MessageBody() id: number) {
    const res = this.brokersService.remove(id);
    return this.send('removed', res);
  }

  @SubscribeMessage('buy')
  buy(
    @MessageBody('brokerId') brokerId: number,
    @MessageBody('stockId') stockId: number,
    @MessageBody('quantity') quantity: number,
  ) {
    const broker = this.brokersService.findOne(brokerId);
    this.stockIo.emit(
      'buy',
      {
        id: stockId,
        quantity: quantity,
      },
      (response: any | null) => {
        if (response === null) {
          return null;
        }

        const { quantity, price, stockImprint } = response;
        broker.buy(stockId, stockImprint.name, quantity, price);
        return this.send('updated', broker.toJson());
      },
    );
  }

  @SubscribeMessage('sell')
  sell(
    @MessageBody('brokerId') brokerId: number,
    @MessageBody('stockId') stockId: number,
    @MessageBody('quantity') quantity: number,
  ) {
    const broker = this.brokersService.findOne(brokerId);
    this.stockIo.emit(
      'sell',
      {
        id: stockId,
        quantity: quantity,
      },
      (response: any | null) => {
        if (response === null) {
          return null;
        }

        const { quantity, price } = response;
        broker.sell(stockId, quantity, price);
        return this.send('updated', broker.toJson());
      },
    );
  }
}
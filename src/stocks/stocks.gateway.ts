import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';

import { map, Observable, of } from 'rxjs';
import { Server } from 'socket.io';

import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { FindStockImprintDto } from './dto/find-all.dto';
import { StockImprint } from './entities/stock-imprint.entity';
import { FindStockDto } from './dto/find-all-detailed.dto';

@Controller('/stocks')
@WebSocketGateway({
  namespace: '/stocks',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  },
})
export class StocksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger: Logger = new Logger(StocksGateway.name);

  constructor(private readonly stocksService: StocksService) {}

  public handleConnection(client: any): any {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: any): any {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @Get('details')
  findAllDetailed(): Observable<FindStockDto[]> {
    return this.stocksService.findAllDetailed();
  }

  @Post()
  create(@Body() createStockDto: CreateStockDto): Observable<number> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  findAll(): Observable<FindStockImprintDto[]> {
    return of(this.stocksService.findAll());
  }

  @SubscribeMessage('findAll')
  findAllSocket() {
    this.stocksService.findAll().forEach((stockImprint) => {
      this.server.emit('updateStock', stockImprint);
      console.log(stockImprint);
    });
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<FindStockImprintDto> {
    return this.stocksService.findOne(id);
  }

  @SubscribeMessage('clockStocks')
  clockStocks(@MessageBody('date') date: Date): Observable<void> {
    this.stocksService.updateDate(date);
    return new Observable<void>((observer) => {
      this.stocksService.findAll().forEach((stockImprint) => {
        this.server.emit('updateStock', stockImprint);
        observer.next();
      });
    });
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStockDto: CreateStockDto,
  ): Observable<WsResponse<StockImprint>> {
    return this.stocksService.update(id, updateStockDto).pipe(
      map((stockImprint: StockImprint) => {
        return {
          event: 'updateStock',
          data: stockImprint,
        };
      }),
    );
  }

  @Patch(':id')
  patch(
    @Param('id') id: number,
    @Body() patchStockDto: CreateStockDto,
  ): Observable<WsResponse<StockImprint>> {
    return this.stocksService.patch(id, patchStockDto).pipe(
      map((stockImprint: StockImprint) => {
        return {
          event: 'updateStock',
          data: stockImprint,
        };
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number): Observable<number> {
    return this.stocksService.remove(id);
  }

  @SubscribeMessage('buy')
  buy(
    @MessageBody('id') id: number,
    @MessageBody('quantity') quantity: number,
  ) {
    const res = this.stocksService.buy(id, quantity);
    if (res === null) {
      return null;
    }

    this.server.emit('updateStock', res.stockImprint);
    return res;
  }

  @SubscribeMessage('sell')
  sell(
    @MessageBody('id') id: number,
    @MessageBody('quantity') quantity: number,
  ) {
    const res = this.stocksService.sell(id, quantity);
    if (res === null) {
      return null;
    }

    this.server.emit('updateStock', res.stockImprint);
    return res;
  }

  @SubscribeMessage('activateStock')
  activate(@MessageBody('id') id: number): Observable<void> {
    return this.stocksService.activate(id).pipe(
      map((stockImprint: StockImprint) => {
        this.server.emit('updateStock', {
          date: this.stocksService.date,
          stockImprint: stockImprint,
        });
      }),
    );
  }

  @SubscribeMessage('deactivateStock')
  deactivate(@MessageBody('id') id: number): Observable<void> {
    return this.stocksService.deactivate(id).pipe(
      map((stockImprint: StockImprint) => {
        this.server.emit('updateStock', {
          date: this.stocksService.date,
          stockImprint: stockImprint,
        });
      }),
    );
  }
}

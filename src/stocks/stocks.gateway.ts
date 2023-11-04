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

import { map, Observable } from 'rxjs';
import { Server } from 'socket.io';

import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { FindStockDto } from './dto/find-all.dto';
import { StockImprint } from './entities/stock-imprint.entity';

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

  @Post()
  create(@Body() createStockDto: CreateStockDto): Observable<number> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  findAll(): Observable<FindStockDto> {
    return this.stocksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<FindStockDto> {
    return this.stocksService.findOne(id);
  }

  @SubscribeMessage('clockStocks')
  clockStocks(
    @MessageBody('date') date: Date,
  ): Observable<WsResponse<FindStockDto>> {
    this.stocksService.updateDate(date);
    return this.stocksService.findAll().pipe(
      map((findStockDto: FindStockDto) => {
        return {
          event: 'updateStock',
          data: findStockDto,
        };
      }),
    );
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

  @Post('buy/:id')
  buy(
    @Param('id') id: number,
    @Query('quantity') quantity: number,
  ): Observable<number> {
    return this.stocksService.buy(id, quantity).pipe(
      map(({ price, stockImprint }) => {
        this.server.emit('updateStock', stockImprint);
        return price;
      }),
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';

import { map, Observable } from 'rxjs';

import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { FindStockDto } from './dto/find-all.dto';
import { StockImprint } from './entities/stock-imprint.entity';

@Controller('/stocks')
@WebSocketGateway()
export class StocksGateway {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto): Observable<number> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  findAll(@Query('date') date: Date): Observable<FindStockDto> {
    return this.stocksService.findAll(date);
  }

  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Query('date') date: Date,
  ): Observable<FindStockDto> {
    return this.stocksService.findOne(id, date);
  }

  @SubscribeMessage('clockStocks')
  clockStocks(@MessageBody() date: Date): Observable<WsResponse<FindStockDto>> {
    return this.stocksService.findAll(date).pipe(
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
    @Query('date') date: Date,
    @Body() updateStockDto: CreateStockDto,
  ): Observable<WsResponse<StockImprint>> {
    return this.stocksService.update(id, date, updateStockDto).pipe(
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
    @Query('date') date: Date,
    @Body() patchStockDto: CreateStockDto,
  ): Observable<WsResponse<StockImprint>> {
    return this.stocksService.patch(id, date, patchStockDto).pipe(
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
}

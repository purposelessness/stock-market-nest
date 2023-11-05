import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { from, map, Observable, of } from 'rxjs';

import { __data_dir } from '../consts';
import { CreateStockDto } from './dto/create-stock.dto';
import { FindStockImprintDto } from './dto/find-all.dto';
import { Stock } from './entities/stock.entity';
import { StockImprint } from './entities/stock-imprint.entity';
import { PatchStockDto } from './dto/patch-stock.dto';
import { FindStockDto } from './dto/find-all-detailed.dto';

@Injectable()
export class StocksService implements OnModuleInit {
  private static readonly STOCKS_FILE: string = path.join(
    __data_dir,
    'stocks.json',
  );

  private readonly logger: Logger = new Logger(StocksService.name);

  private stocks: Map<number, Stock> = new Map();
  private date?: Date;

  onModuleInit(): void {
    this.loadStocks();
  }

  updateDate(date: Date): void {
    this.date = date;
  }

  findAllDetailed(): Observable<FindStockDto> {
    return from(this.stocks).pipe(
      map(([, stock]) => {
        return {
          id: stock.id,
          name: stock.name,
          prices: stock.prices,
          quantity: stock.quantity,
        };
      }),
    );
  }

  create(createStockDto: CreateStockDto): Observable<number> {
    const id = this.stocks.size + 1;
    const stock = new Stock(
      id,
      createStockDto.name,
      createStockDto.prices,
      createStockDto.quantity || 0,
    );
    this.stocks.set(id, stock);
    return of(id);
  }

  findAll(): Observable<FindStockImprintDto> {
    return from(this.stocks).pipe(
      map(([, stock]) => {
        if (stock.getPrice(this.date)) {
          return { date: this.date, stockImprint: stock.getImprint(this.date) };
        } else {
          return { date: this.date, stockImprint: null };
        }
      }),
    );
  }

  findOne(id: number): Observable<FindStockImprintDto> {
    const stock = this.stocks.get(id);
    if (stock) {
      return of({
        date: this.date,
        stockImprint: stock.getImprint(this.date),
      });
    } else {
      this.logger.warn(`Stock with id ${id} not found.`);
      return of({
        date: new Date(),
        stockImprint: null,
      });
    }
  }

  update(
    id: number,
    updateStockDto: CreateStockDto,
  ): Observable<StockImprint | null> {
    if (this.stocks.has(id)) {
      const stock = this.stocks.get(id);
      stock.name = updateStockDto.name;
      stock.prices = updateStockDto.prices;
      stock.quantity = updateStockDto.quantity;
      return of(stock.getImprint(this.date));
    } else {
      this.logger.warn(`Stock with id ${id} not found.`);
      return of(null);
    }
  }

  patch(
    id: number,
    patchStockDto: PatchStockDto,
  ): Observable<StockImprint | null> {
    if (this.stocks.has(id)) {
      const stock = this.stocks.get(id);
      if (patchStockDto.name != null) {
        stock.name = patchStockDto.name;
      }
      if (patchStockDto.prices != null) {
        stock.prices = patchStockDto.prices;
      }
      if (patchStockDto.quantity != null) {
        stock.quantity = patchStockDto.quantity;
      }
      return of(stock.getImprint(this.date));
    } else {
      this.logger.warn(`Stock with id ${id} not found.`);
      return of(null);
    }
  }

  remove(id: number): Observable<number> {
    this.stocks.delete(id);
    return of(id);
  }

  buy(
    id: number,
    quantity: number,
  ): Observable<{ price: number; stockImprint: StockImprint } | null> {
    if (this.stocks.has(id)) {
      const stock = this.stocks.get(id);
      stock.quantity -= quantity;
      if (stock.quantity < 0) {
        quantity += stock.quantity;
        stock.quantity = 0;
      }
      const imprint = stock.getImprint(this.date);
      return of({ price: quantity * imprint.price, stockImprint: imprint });
    } else {
      this.logger.warn(`Stock with id ${id} not found.`);
      return of(null);
    }
  }

  private loadStocks(): void {
    if (!fs.existsSync(StocksService.STOCKS_FILE)) {
      this.logger.warn(`File ${StocksService.STOCKS_FILE} not found.`);
      return;
    }
    const data = fs.readFileSync(StocksService.STOCKS_FILE, 'utf8');
    const stocks = JSON.parse(data);

    const streams = [];
    for (const stock of stocks) {
      const parsedPrices: Map<Date, number> = new Map();
      streams.push(
        fs
          .createReadStream(path.join(__data_dir, stock.prices))
          .pipe(csv())
          .on('data', (data) => {
            const date = new Date(data['Date']);
            const openPrice = Number((data['Open'] as string).split('$')[1]);
            parsedPrices.set(date, openPrice);
          })
          .on('end', () => {
            this.stocks.set(
              stock.id,
              new Stock(stock.id, stock.name, parsedPrices, stock.quantity),
            );
            this.logger.debug(`Loaded stock ${stock.id}: ${stock.name}`);
          }),
      );
    }
    this.logger.debug(`${stocks.length} stocks to be loaded.`);
  }
}

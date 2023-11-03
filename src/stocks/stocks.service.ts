import { Injectable } from '@nestjs/common';

import { from, map, Observable, of } from 'rxjs';

import { CreateStockDto } from './dto/create-stock.dto';
import { FindStockDto } from './dto/find-all.dto';
import { Stock } from './entities/stock.entity';
import { StockImprint } from './entities/stock-imprint.entity';
import { PatchStockDto } from './dto/patch-stock.dto';

@Injectable()
export class StocksService {
  private stocks: Map<number, Stock> = new Map();
  private date?: Date;

  updateDate(date: Date): void {
    this.date = date;
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

  findAll(): Observable<FindStockDto> {
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

  findOne(id: number): Observable<FindStockDto> {
    const stock = this.stocks.get(id);
    if (stock) {
      return of({
        date: this.date,
        stockImprint: stock.getImprint(this.date),
      });
    } else {
      console.warn(`[StocksService] Stock with id ${id} not found.`);
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
      console.warn(`[StocksService] Stock with id ${id} not found.`);
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
      console.warn(`[StocksService] Stock with id ${id} not found.`);
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
      console.warn(`[StocksService] Stock with id ${id} not found.`);
      return of(null);
    }
  }
}

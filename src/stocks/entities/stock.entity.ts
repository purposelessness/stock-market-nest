// Stocks contain price of named stock on each day of some period of time.
import { StockImprint } from './stock-imprint.entity';

export class Stock {
  constructor(
    public readonly id: number,
    public name: string,
    public prices: Map<Date, number>,
    public quantity: number,
  ) {}

  // Returns price of this stock on given date.
  getPrice(date: Date): number {
    return this.prices.get(date);
  }

  // Returns imprint of this stock.
  getImprint(date: Date): StockImprint {
    return new StockImprint(
      this.id,
      this.name,
      this.getPrice(date),
      this.quantity,
    );
  }
}
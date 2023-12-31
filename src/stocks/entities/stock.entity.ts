// Stocks contain price of named stock on each day of some period of time.
import { StockImprint } from './stock-imprint.entity';

export class Stock {
  constructor(
    public readonly id: number,
    public name: string,
    public prices: Map<string, number>,
    public quantity: number,
    public enabled: boolean = true,
  ) {}

  // Returns price of this stock on given date.
  getPrice(date: string): number {
    return this.prices.get(date);
  }

  // Returns imprint of this stock.
  getImprint(date: string): StockImprint {
    return new StockImprint(
      this.id,
      this.name,
      this.prices.has(date) ? this.prices.get(date) : undefined,
      this.quantity,
      this.enabled,
    );
  }
}

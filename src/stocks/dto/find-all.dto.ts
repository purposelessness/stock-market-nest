import { StockImprint } from '../entities/stock-imprint.entity';

export class FindStockImprintDto {
  constructor(
    public readonly date: string,
    public readonly stockImprint: StockImprint,
  ) {}
}

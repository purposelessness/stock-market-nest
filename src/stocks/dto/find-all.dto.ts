import { StockImprint } from '../entities/stock-imprint.entity';

export class FindStockImprintDto {
  constructor(
    public readonly date: Date,
    public readonly stockImprint: StockImprint | null,
  ) {}
}

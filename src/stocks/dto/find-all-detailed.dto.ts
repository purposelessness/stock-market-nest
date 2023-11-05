export class FindStockDto {
  public readonly id: number;
  public readonly name: string;
  public readonly prices: Map<Date, number>;
  public readonly quantity: number;
}

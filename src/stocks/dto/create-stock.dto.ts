export class CreateStockDto {
  public readonly name: string;
  public readonly prices: Map<Date, number>;
  public readonly quantity?: number;
}

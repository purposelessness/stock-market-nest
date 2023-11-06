export class CreateStockDto {
  public readonly name: string;
  public readonly prices: Map<string, number>;
  public readonly quantity?: number;
}

export class StockImprint {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly enabled: boolean,
  ) {}
}

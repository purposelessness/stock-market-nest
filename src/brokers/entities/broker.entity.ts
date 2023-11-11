import { Active } from './active.entity';

export class Broker {
  constructor(
    public readonly id: number,
    public login: string,
    public money: number,
    public actives: Map<number, Active[]> = new Map(),
  ) {}

  buy(stockId: number, name: string, quantity: number, price: number) {
    if (!this.actives.has(stockId)) {
      this.actives.set(stockId, []);
    }

    const actives = this.actives.get(stockId);
    actives.push(new Active(stockId, name, quantity, price));
    this.money -= quantity * price;
  }

  sell(stockId: number, quantity: number, price: number) {
    const actives = this.actives.get(stockId);
    this.money += quantity * price;
    for (let i = 0; i < actives.length; i++) {
      if (actives[i].quantity < quantity) {
        quantity -= actives[i].quantity;
        actives.splice(i, 1);
      } else {
        actives[i].quantity -= quantity;
        break;
      }
    }
  }

  toJson(): any {
    return {
      id: this.id,
      login: this.login,
      money: this.money,
      actives: [...this.actives.entries()].map(([stockId, actives]) => ({
        id: stockId,
        value: actives,
      })),
    };
  }
}

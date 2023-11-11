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
    actives.push(new Active(stockId, name, price, quantity));
    this.money -= price * quantity;
  }

  getActiveQuantity(stockId: number): number {
    const actives = this.actives.get(stockId);
    if (!actives) {
      return 0;
    }
    return actives.reduce((acc, active) => acc + active.quantity, 0);
  }

  sell(stockId: number, quantity: number, price: number) {
    const actives = this.actives.get(stockId);
    for (let i = 0; i < actives.length; i++) {
      const active = actives[i];
      if (active.quantity >= quantity) {
        active.quantity -= quantity;
        if (active.quantity === 0) {
          actives.splice(i, 1);
        }
        break;
      }
      quantity -= active.quantity;
      actives.splice(i, 1);
    }
    this.money += price * quantity;
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

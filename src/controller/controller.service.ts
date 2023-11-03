import { Injectable } from '@nestjs/common';

@Injectable()
export class ControllerService {
  public onClock?: (date: Date) => void;

  private static readonly CLOCK_TIMER = 1000;

  private clockTimeout?: NodeJS.Timeout;
  private currentDate: Date;

  constructor() {
    this.currentDate = this.roundDateToMidnight(new Date());
  }

  roundDateToMidnight(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  public set date(date: Date) {
    this.currentDate = this.roundDateToMidnight(date);
  }

  public get date(): Date {
    return this.currentDate;
  }

  startClock(): void {
    if (this.clockTimeout != null) {
      console.warn('[Controller] Clock already started.');
      return;
    }
    if (this.currentDate == null) {
      console.warn('[Controller] No date set for clock.');
      return;
    }

    this.clockTimeout = setInterval(() => {
      this.clock();
    }, ControllerService.CLOCK_TIMER);
  }

  stopClock(): void {
    if (this.clockTimeout == null) {
      console.warn('[Controller] Clock not started.');
      return;
    }

    clearInterval(this.clockTimeout);
    this.clockTimeout = undefined;
  }

  private clock() {
    this.currentDate = new Date(
      this.currentDate.getTime() + 24 * 60 * 60 * 1000,
    );
    if (this.onClock) {
      this.onClock(this.currentDate);
    }
  }
}

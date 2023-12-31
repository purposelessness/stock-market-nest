import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ControllerService {
  public onClock?: (date: Date) => void;

  private readonly logger = new Logger(ControllerService.name);

  private clockTimeout?: NodeJS.Timeout;
  private currentDate: Date;
  private delay = 1000;

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
      this.logger.warn('[Controller] Clock already started.');
      return;
    }
    if (this.currentDate == null) {
      this.logger.warn('[Controller] No date set for clock.');
      return;
    }

    this.clockTimeout = setInterval(() => {
      this.clock();
    }, this.delay);
  }

  setClockSpeed(delay: number): void {
    this.delay = delay;
    console.log(`[Controller] Clock speed set to ${delay}ms.`);
    if (this.clockTimeout != null) {
      this.stopClock();
      this.startClock();
    }
  }

  stopClock(): void {
    if (this.clockTimeout == null) {
      this.logger.warn('[Controller] Clock not started.');
      return;
    }

    clearInterval(this.clockTimeout);
    this.clockTimeout = undefined;
  }

  private clock() {
    this.currentDate = new Date(
      this.currentDate.getTime() + 24 * 60 * 60 * 1000,
    );
    // this.logger.debug(`Clock ticked: ${this.currentDate}.`);
    if (this.onClock) {
      this.onClock(this.currentDate);
    }
  }
}

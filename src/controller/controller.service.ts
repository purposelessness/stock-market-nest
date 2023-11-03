import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class ControllerService {
  public onClock?: (date: Date) => void;

  private static readonly CLOCK_TIMER = 1000;

  private clockTimeout?: NodeJS.Timeout;
  private currentDate?: Date;

  constructor(private readonly logger: LoggerService) {}

  roundDateToMidnight(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  setDate(date: Date): Date {
    this.currentDate = this.roundDateToMidnight(date);
    return this.currentDate;
  }

  startClock(): void {
    if (this.clockTimeout != null) {
      this.logger.warn('Clock already started.');
      return;
    }
    if (this.currentDate == null) {
      this.logger.warn('No date set for clock.');
      return;
    }

    this.clockTimeout = setInterval(() => {
      this.clock();
    }, ControllerService.CLOCK_TIMER);
  }

  stopClock(): void {
    if (this.clockTimeout == null) {
      this.logger.warn('Clock not started.');
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

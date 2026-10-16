import type { IsoDate } from "@rumbo/core";

export interface DateRange {
  start?: IsoDate;
  end?: IsoDate;
}

export interface DateTimeValue extends DateRange {
  time?: string;
}

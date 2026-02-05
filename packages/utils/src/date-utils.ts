/**
 * @file packages/utils/src/date-utils.ts
 * @description 날짜 관련 유틸리티 함수
 */

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  formatISO,
  isValid,
  parseISO,
} from "date-fns";
import { PeriodType } from "@fms/types";

export function getTodayIsoDate(): string {
  return formatISO(new Date(), { representation: "date" });
}

export function calculateNextScheduleDate(
  baseDateStr: string | Date,
  periodType: PeriodType,
  periodValue: number
): string {
  let baseDate =
    typeof baseDateStr === "string" ? parseISO(baseDateStr) : baseDateStr;

  if (!isValid(baseDate)) {
    console.warn(
      `Invalid baseDate provided to calculateNextScheduleDate: ${baseDateStr}. Defaulting to today.`
    );
    baseDate = new Date();
  }

  if (periodValue <= 0) {
    console.warn(
      `Period value (${periodValue}) must be positive. Returning base date.`
    );
    return formatISO(baseDate, { representation: "date" });
  }

  let nextDate: Date;

  switch (periodType) {
    case PeriodType.DAILY:
      nextDate = addDays(baseDate, periodValue);
      break;
    case PeriodType.WEEKLY:
      nextDate = addWeeks(baseDate, periodValue);
      break;
    case PeriodType.MONTHLY:
      nextDate = addMonths(baseDate, periodValue);
      break;
    case PeriodType.QUARTERLY:
      nextDate = addMonths(baseDate, periodValue * 3);
      break;
    case PeriodType.SEMI_ANNUALLY:
      nextDate = addMonths(baseDate, periodValue * 6);
      break;
    case PeriodType.ANNUALLY:
      nextDate = addYears(baseDate, periodValue);
      break;
    case PeriodType.CUSTOM_DAYS:
      nextDate = addDays(baseDate, periodValue);
      break;
    case PeriodType.CUSTOM_WEEKS:
      nextDate = addWeeks(baseDate, periodValue);
      break;
    case PeriodType.CUSTOM_MONTHS:
      nextDate = addMonths(baseDate, periodValue);
      break;
    case PeriodType.CUSTOM_YEARS:
      nextDate = addYears(baseDate, periodValue);
      break;
    case PeriodType.ON_DEMAND:
      nextDate = baseDate;
      break;
    default:
      console.warn(`Unhandled period type: ${periodType}. Returning base date.`);
      nextDate = baseDate;
      break;
  }
  return formatISO(nextDate, { representation: "date" });
}

export const formatDateTime = (
  date: Date | string | number | null | undefined
): string => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const formatDate = (
  date: Date | string | number | null | undefined
): string => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

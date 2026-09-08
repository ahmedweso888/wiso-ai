import { SYLLABUS_DEADLINE } from "./constants";

export function toArabicSafeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number | null | undefined): string {
  return `${Math.round(value ?? 0)}%`;
}

export function formatDate(value: string | Date | null | undefined, locale = "ar-EG"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined, locale = "ar-EG"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} د`;
  if (m === 0) return `${h} س`;
  return `${h} س ${m} د`;
}

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function countdownTo(target: Date, from: Date = new Date()): Countdown {
  const diff = target.getTime() - from.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    expired: false,
  };
}

export function daysUntilDeadline(from: Date = new Date()): number {
  return countdownTo(SYLLABUS_DEADLINE, from).days;
}

/** After the deadline the product switches to the revision / extreme-practice phase. */
export function currentPhase(from: Date = new Date()): "syllabus" | "revision" {
  return from.getTime() < SYLLABUS_DEADLINE.getTime() ? "syllabus" : "revision";
}

export function initials(name: string | null | undefined): string {
  if (!name) return "ST";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

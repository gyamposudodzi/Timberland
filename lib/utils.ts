import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    ...opts,
  }).format(date);
}

export function formatDate(value: string | Date): string {
  return formatDateTime(value, { timeStyle: undefined, dateStyle: "medium" });
}

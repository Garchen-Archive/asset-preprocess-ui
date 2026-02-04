import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(dateStr: string): Date | null {
  // Handle YYYY-MM-DD or ISO timestamps
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start && !end) return "—";
  if (!start) return formatDate(end);
  if (!end) return formatDate(start);

  const s = parseDate(start);
  const e = parseDate(end);

  if (!s || !e) return `${formatDate(start)} – ${formatDate(end)}`;

  if (s.getTime() === e.getTime()) return formatDate(start);

  if (s.getFullYear() !== e.getFullYear()) {
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  if (s.getMonth() !== e.getMonth()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
  }

  return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
}

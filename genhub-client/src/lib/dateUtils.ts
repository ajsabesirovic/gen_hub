import { parseISO, format as dateFnsFormat } from "date-fns";

export function formatLocalDateTime(
  utcDateString: string,
  formatStr: string = "dd.MM.yyyy HH:mm"
): string {
  const date = parseISO(utcDateString);
  return dateFnsFormat(date, formatStr);
}

export function utcToLocalDate(utcDateString: string): Date {
  return parseISO(utcDateString);
}

export function formatLocalTime(utcDateString: string): string {
  const date = parseISO(utcDateString);
  return dateFnsFormat(date, "HH:mm");
}

export function formatLocalDate(
  utcDateString: string,
  formatStr: string = "EEE, MMM d, yyyy"
): string {
  const date = parseISO(utcDateString);
  return dateFnsFormat(date, formatStr);
}

export function localToUtcISOString(localDateTimeString: string): string {
      const [datePart, timePart] = localDateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes);
  return localDate.toISOString();
}

export function utcToLocalInputValue(utcDateString: string): string {
  const date = parseISO(utcDateString);
  return dateFnsFormat(date, "yyyy-MM-dd'T'HH:mm");
}

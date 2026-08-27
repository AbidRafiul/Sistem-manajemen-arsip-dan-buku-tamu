import { TZKey } from "@/types/layout";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import * as Locales from "date-fns/locale";


const tzMap: Record<TZKey, string> = {
  wib: "Asia/Jakarta",
  wita: "Asia/Makassar",
  wit: "Asia/Jayapura",
  utc: "UTC",
};

const formatDateCalendar = (
  date: string | Date = new Date(),
  formatStr: string = "yyyy-MM-dd HH:mm:ss",
  tz: TZKey | null = null,
  loc: string | null = null,
): string | null => {

  const locale = loc ? (Locales as any)[loc] : Locales['enUS']

  if (tz) {
    const mappedTz = tzMap[tz];

    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = new Date(date);

      if (isNaN(dateObj.getTime())) {
        const parts = date.split("-");
        if (parts.length === 3) {
          const [dd, mm, yyyy] = parts;
          dateObj = new Date(`${yyyy}-${mm}-${dd}`);
        }
      }
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    return formatInTimeZone(dateObj, mappedTz, formatStr, { locale });
  }

  // Tanpa tz
  if (!date) return null;

  const dt = typeof date === "string" ? new Date(date) : date;
  return format(dt, formatStr, { locale });
}

export { formatDateCalendar, tzMap }

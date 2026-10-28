/**
 * Opening hours — one source of truth.
 *
 * Verified 2026-10-28 against the Google Business Profile panel for
 * 5518 Rue Sherbrooke O: closed Mondays, 11:00–23:00 Tuesday through Sunday.
 *
 * Before this, three copies of the hours existed (footer, home page, seed) and
 * all three were wrong — they said open Monday, closing at midnight Fri/Sat,
 * and opening at noon Sunday. Keep this file as the only place they live.
 */
export const TIMEZONE = "America/Montreal";

/** 0 = Sunday … 6 = Saturday, matching Date#getDay. */
export type DayHours = { open: string; close: string } | null;

export const WEEK: readonly DayHours[] = [
  { open: "11:00", close: "23:00" }, // Sunday
  null,                              // Monday — closed
  { open: "11:00", close: "23:00" }, // Tuesday
  { open: "11:00", close: "23:00" }, // Wednesday
  { open: "11:00", close: "23:00" }, // Thursday
  { open: "11:00", close: "23:00" }, // Friday
  { open: "11:00", close: "23:00" }, // Saturday
];

const DAY_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Rows for display, collapsing identical consecutive days into ranges. */
export function hoursRows(lang: "fr" | "en"): { label: string; time: string | null }[] {
  const names = lang === "fr" ? DAY_FR : DAY_EN;
  // Show the week starting Monday, the way a printed card reads.
  const order = [1, 2, 3, 4, 5, 6, 0];
  const rows: { label: string; time: string | null }[] = [];

  for (const day of order) {
    const h = WEEK[day];
    const time = h ? `${h.open} – ${h.close}` : null;
    const last = rows[rows.length - 1];
    const lastDay = rows.length ? order[rows.length - 1 + (rows.length - 1)] : null;

    if (last && last.time === time && last.label.indexOf("—") === -1) {
      // extend an existing run
      last.label = `${last.label.split(" – ")[0]} – ${names[day]}`;
    } else if (last && last.time === time) {
      last.label = `${last.label.split(" – ")[0]} – ${names[day]}`;
    } else {
      rows.push({ label: names[day], time });
    }
    void lastDay;
  }
  return rows;
}

/** The current wall-clock day and minutes in Montréal, whatever the visitor's timezone. */
function montrealNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  return { day: dayIndex, minutes: (hour % 24) * 60 + minute };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export type OpenState =
  | { open: true; closesAt: string }
  | { open: false; opensDay: number; opensAt: string }
  | { open: false; opensDay: null; opensAt: null };

export function openState(now: Date = new Date()): OpenState {
  const { day, minutes } = montrealNow(now);
  const today = WEEK[day];

  if (today) {
    const start = toMinutes(today.open);
    // A close time at or before the open time means it runs past midnight.
    const end = toMinutes(today.close) <= start ? toMinutes(today.close) + 1440 : toMinutes(today.close);
    if (minutes >= start && minutes < end) return { open: true, closesAt: today.close };
  }

  // Find the next day that opens, starting with later today.
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = WEEK[d];
    if (!h) continue;
    if (i === 0 && minutes >= toMinutes(h.open)) continue; // already past today's opening
    return { open: false, opensDay: d, opensAt: h.open };
  }
  return { open: false, opensDay: null, opensAt: null };
}

export function dayName(day: number, lang: "fr" | "en"): string {
  return (lang === "fr" ? DAY_FR : DAY_EN)[day];
}

/** schema.org openingHoursSpecification — what Google reads for the "Open now" badge. */
export function openingHoursSpecification() {
  const SCHEMA_DAY = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];
  return WEEK.map((h, i) =>
    h
      ? {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${SCHEMA_DAY[i]}`,
          opens: h.open,
          closes: h.close,
        }
      : {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${SCHEMA_DAY[i]}`,
          opens: "00:00",
          closes: "00:00",
        }
  );
}

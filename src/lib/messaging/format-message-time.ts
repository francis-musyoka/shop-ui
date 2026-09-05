/**
 * Timestamps for inbox rows and message bubbles.
 *
 * Locale and timezone are pinned rather than left to the runtime: the marketplace
 * is Kenya-focused, so every user should read the same wall-clock time as the
 * seller they're negotiating with, and tests stay deterministic on any machine.
 *
 * `now` is injectable for tests.
 */
const LOCALE = "en-GB";
const TIME_ZONE = "Africa/Nairobi";

const clock = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
});
const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: "short", timeZone: TIME_ZONE });
const dayMonth = new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    timeZone: TIME_ZONE,
});
const dayMonthYear = new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
});

/** Calendar day in the pinned zone, so "today" means today in Nairobi. */
function zonedDayKey(date: Date): string {
    return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

function daysBetween(a: Date, b: Date): number {
    const dayA = Date.parse(`${zonedDayKey(a)}T00:00:00Z`);
    const dayB = Date.parse(`${zonedDayKey(b)}T00:00:00Z`);
    return Math.round((dayB - dayA) / 86_400_000);
}

/** Calendar year in the pinned zone, so a year comparison agrees with "today" above. */
function zonedYear(date: Date): string {
    return zonedDayKey(date).slice(0, 4);
}

/**
 * Everything below today. The inbox timestamp and the transcript's day divider
 * agree from Yesterday down and differ only on today, so the shared cascade
 * lives here and each caller supplies its own today case.
 */
function pastDayLabel(date: Date, now: Date, elapsedDays: number): string {
    if (elapsedDays === 1) return "Yesterday";
    if (elapsedDays < 7) return weekday.format(date);
    if (zonedYear(date) === zonedYear(now)) return dayMonth.format(date);
    return dayMonthYear.format(date);
}

/** Inbox rows and message bubbles: a clock time today, a day label before that. */
export function formatMessageTime(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    const elapsedDays = daysBetween(date, now);

    if (elapsedDays <= 0) return clock.format(date);
    return pastDayLabel(date, now, elapsedDays);
}

/**
 * The transcript's day divider (spec §7.4). A divider needs a day label, which
 * is the one case formatMessageTime cannot serve: its today branch returns a
 * clock time like "10:41", so reusing it would head a day's messages with the
 * time of one of them.
 *
 * A clock skew putting a message slightly in the future reads as "Today" here,
 * matching formatMessageTime's own `<= 0`.
 */
export function formatDayDivider(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    const elapsedDays = daysBetween(date, now);

    if (elapsedDays <= 0) return "Today";
    return pastDayLabel(date, now, elapsedDays);
}

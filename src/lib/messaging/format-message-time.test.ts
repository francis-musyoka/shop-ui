import { describe, it, expect } from "vitest";
import { formatDayDivider, formatMessageTime } from "./format-message-time";

const NOW = new Date("2026-09-04T12:00:00.000Z");

describe("formatMessageTime", () => {
    it("shows 24h clock time for today", () => {
        expect(formatMessageTime("2026-09-04T07:41:00.000Z", NOW)).toBe("10:41");
    });

    it("shows Yesterday for the previous calendar day", () => {
        expect(formatMessageTime("2026-09-03T07:41:00.000Z", NOW)).toBe("Yesterday");
    });

    it("shows a short weekday within the last week", () => {
        expect(formatMessageTime("2026-08-31T07:41:00.000Z", NOW)).toBe("Mon");
    });

    it("shows day and month for older dates in the same year", () => {
        expect(formatMessageTime("2026-08-12T07:41:00.000Z", NOW)).toBe("12 Aug");
    });

    it("includes the year for a different year", () => {
        expect(formatMessageTime("2025-08-12T07:41:00.000Z", NOW)).toBe("12 Aug 2025");
    });

    it("includes the year when the viewer's zoned year has already rolled over", () => {
        // 2026-12-31T22:00Z is 2027-01-01 in Nairobi, so a June 2026 message
        // is last year from the reader's point of view.
        const nowAcrossBoundary = new Date("2026-12-31T22:00:00.000Z");
        expect(formatMessageTime("2026-06-01T09:00:00.000Z", nowAcrossBoundary)).toBe("1 Jun 2026");
    });
});

describe("formatDayDivider", () => {
    it("labels today by name, not by clock time", () => {
        // The one case that differs from formatMessageTime, which returns
        // "10:41" here -- a divider carrying a clock time would be nonsense.
        expect(formatDayDivider("2026-09-04T07:41:00.000Z", NOW)).toBe("Today");
    });

    it("counts the day in Nairobi, not UTC", () => {
        // 21:30Z is 00:30 the next day in Nairobi, so this is already today
        // for the reader even though UTC still calls it yesterday.
        expect(formatDayDivider("2026-09-03T21:30:00.000Z", NOW)).toBe("Today");
    });

    it("shows Yesterday for the previous calendar day", () => {
        expect(formatDayDivider("2026-09-03T07:41:00.000Z", NOW)).toBe("Yesterday");
    });

    it("shows a short weekday within the last week", () => {
        expect(formatDayDivider("2026-08-31T07:41:00.000Z", NOW)).toBe("Mon");
    });

    it("shows day and month for older dates in the same year", () => {
        expect(formatDayDivider("2026-08-12T07:41:00.000Z", NOW)).toBe("12 Aug");
    });

    it("includes the year for a different year", () => {
        expect(formatDayDivider("2025-08-12T07:41:00.000Z", NOW)).toBe("12 Aug 2025");
    });

    it("includes the year when the viewer's zoned year has already rolled over", () => {
        const nowAcrossBoundary = new Date("2026-12-31T22:00:00.000Z");
        expect(formatDayDivider("2026-06-01T09:00:00.000Z", nowAcrossBoundary)).toBe("1 Jun 2026");
    });
});

import { describe, it, expect } from "vitest";
import type { ConversationSummary, Message } from "@/lib/schemas/conversation";
import {
    flattenMessages,
    newestMessageId,
    mergeIncoming,
    dedupeConversations,
    type MessagePage,
} from "./merge-messages";

function msg(id: string, createdAt: string, body = id): Message {
    return {
        id,
        senderId: "usr1aaaaaaaaaaaaaaaaaaaa",
        senderSide: "CUSTOMER",
        body,
        imageUrl: null,
        listing: null,
        createdAt,
    };
}

/** Cursor pages arrive newest-first (DESC), page 0 being the newest slice. */
const pages: MessagePage[] = [
    {
        data: [msg("m4", "2026-09-04T10:04:00.000Z"), msg("m3", "2026-09-04T10:03:00.000Z")],
        direction: "before",
        nextCursor: "m3",
    },
    {
        data: [msg("m2", "2026-09-04T10:02:00.000Z"), msg("m1", "2026-09-04T10:01:00.000Z")],
        direction: "before",
        nextCursor: null,
    },
];

describe("flattenMessages", () => {
    it("returns oldest to newest across every page", () => {
        expect(flattenMessages(pages).map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4"]);
    });

    it("returns an empty list for no pages", () => {
        expect(flattenMessages([])).toEqual([]);
    });
});

describe("cursor anchors", () => {
    it("reads the newest id from the head of page 0", () => {
        expect(newestMessageId(pages)).toBe("m4");
    });

    it("returns null when there is nothing cached", () => {
        expect(newestMessageId([])).toBeNull();
        expect(newestMessageId([{ data: [], direction: "before", nextCursor: null }])).toBeNull();
    });

    it("skips an optimistic row at the head and anchors to the newest server row", () => {
        // Mid-send, the temp row sits at page 0's head. The messages route
        // validates `after` as a CUID, so anchoring to it would 400 and the
        // tick would be lost.
        const withPending: MessagePage[] = [
            {
                data: [
                    msg("temp-e77078c8-4352-4b1a-acde-ddbd10d0edd6", "2026-09-04T10:05:00.000Z"),
                    msg("m4", "2026-09-04T10:04:00.000Z"),
                ],
                direction: "before",
                nextCursor: null,
            },
        ];
        expect(newestMessageId(withPending)).toBe("m4");
    });

    it("returns null when page 0 holds nothing but optimistic rows", () => {
        const onlyPending: MessagePage[] = [
            {
                data: [
                    msg("temp-2", "2026-09-04T10:06:00.000Z"),
                    msg("temp-1", "2026-09-04T10:05:00.000Z"),
                ],
                direction: "before",
                nextCursor: null,
            },
        ];
        expect(newestMessageId(onlyPending)).toBeNull();
    });
});

describe("mergeIncoming", () => {
    it("prepends new rows to page 0 so they render last", () => {
        const merged = mergeIncoming(pages, [msg("m5", "2026-09-04T10:05:00.000Z")]);
        expect(merged[0]!.data.map((m) => m.id)).toEqual(["m5", "m4", "m3"]);
        expect(flattenMessages(merged).map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4", "m5"]);
    });

    it("drops a row whose id is already cached", () => {
        const merged = mergeIncoming(pages, [msg("m4", "2026-09-04T10:04:00.000Z")]);
        expect(merged[0]!.data.map((m) => m.id)).toEqual(["m4", "m3"]);
        expect(merged).toBe(pages);
    });

    it("prepends the server row beside an optimistic one — replacement is the send hook's job", () => {
        const withPending: MessagePage[] = [
            {
                data: [{ ...msg("temp-1", "2026-09-04T10:05:00.000Z") }],
                direction: "before",
                nextCursor: null,
            },
        ];
        const merged = mergeIncoming(withPending, [msg("m5", "2026-09-04T10:05:00.000Z")]);
        expect(merged[0]!.data.map((m) => m.id)).toEqual(["m5", "temp-1"]);
    });

    it("returns the original pages unchanged when nothing arrived", () => {
        expect(mergeIncoming(pages, [])).toBe(pages);
    });

    it("creates a first page when the cache is empty", () => {
        const merged = mergeIncoming([], [msg("m1", "2026-09-04T10:01:00.000Z")]);
        expect(merged[0]!.data.map((m) => m.id)).toEqual(["m1"]);
    });

    it("re-sorts a multi-row incoming batch descending before prepending", () => {
        // The `after` poll returns rows ascending; page 0 is newest-first, so the
        // batch must be reversed on the way in. With one-row batches a missing
        // sort is invisible, which is why this case matters.
        const ascendingBatch = [
            msg("m5", "2026-09-04T10:05:00.000Z"),
            msg("m6", "2026-09-04T10:06:00.000Z"),
        ];
        const merged = mergeIncoming(pages, ascendingBatch);

        expect(merged[0]!.data.map((m) => m.id)).toEqual(["m6", "m5", "m4", "m3"]);
        expect(flattenMessages(merged).map((m) => m.id)).toEqual([
            "m1",
            "m2",
            "m3",
            "m4",
            "m5",
            "m6",
        ]);
    });
});

describe("dedupeConversations", () => {
    function conv(id: string): ConversationSummary {
        return {
            id,
            side: "CUSTOMER",
            shop: { id: "shp1aaaaaaaaaaaaaaaaaaaa", name: "S", slug: "s", logoUrl: null },
            customer: {
                id: "usr1aaaaaaaaaaaaaaaaaaaa",
                firstName: "E",
                lastName: "M",
                avatarUrl: null,
            },
            unreadCount: 0,
            archived: false,
            blocked: false,
            blockedByMe: false,
            lastMessageAt: "2026-09-04T10:00:00.000Z",
            lastMessagePreview: null,
            lastSenderSide: null,
            createdAt: "2026-09-01T10:00:00.000Z",
        };
    }

    it("keeps the first occurrence when offset pages overlap", () => {
        const result = dedupeConversations([
            [conv("a"), conv("b")],
            [conv("b"), conv("c")],
        ]);
        expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
    });
});

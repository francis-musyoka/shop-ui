import type { ConversationSummary, Message } from "@/lib/schemas/conversation";

/**
 * A message plus client-only send state. `pending` rows are optimistic and
 * carry a `temp-` id; `failed` rows keep their text so a retry loses nothing.
 */
export type ThreadMessage = Message & { pending?: boolean; failed?: boolean };

export type MessagePage = {
    data: Message[];
    direction: "before" | "after";
    nextCursor: string | null;
};

/**
 * Cursor pages come back newest-first (the backend orders DESC when paging
 * `before`), and pages accumulate oldest-last. Reversing both levels yields a
 * single oldest-to-newest list, which is the order the transcript renders.
 */
export function flattenMessages(pages: MessagePage[]): ThreadMessage[] {
    const out: ThreadMessage[] = [];
    for (let i = pages.length - 1; i >= 0; i -= 1) {
        const page = pages[i]!.data;
        for (let j = page.length - 1; j >= 0; j -= 1) {
            out.push(page[j]!);
        }
    }
    return out;
}

/**
 * Anchor for the `after` poll: the newest row we already hold that the server
 * also knows about.
 *
 * Optimistic rows carry a client-only `temp-` id and sit at page 0's head while
 * a send is in flight. The messages route validates `after` as a CUID and
 * answers a `temp-` cursor with a 400, so any tick starting mid-send would be
 * silently lost. Skipping them keeps the anchor a real server id.
 *
 * Null when page 0 holds nothing but temp rows — the sync hook reads that as
 * "nothing to poll from yet" and returns without fetching.
 */
export function newestMessageId(pages: MessagePage[]): string | null {
    for (const message of pages[0]?.data ?? []) {
        if (!message.id.startsWith("temp-")) return message.id;
    }
    return null;
}

/**
 * Folds polled rows into page 0. Page 0 is newest-first, so incoming rows go at
 * its head. Ids already cached are dropped: a poll can overlap an optimistic
 * send's server response, and without this the same message would render twice.
 *
 * Returns the same array reference when there is nothing to do, so callers can
 * skip a cache write.
 */
export function mergeIncoming(pages: MessagePage[], incoming: Message[]): MessagePage[] {
    if (incoming.length === 0) return pages;

    const known = new Set<string>();
    for (const page of pages) {
        for (const message of page.data) known.add(message.id);
    }

    const fresh = incoming.filter((m) => !known.has(m.id));
    if (fresh.length === 0) return pages;

    // Newest-first within the incoming batch, matching page 0's ordering. The
    // `after` direction returns ASC, so it is reversed here.
    const ordered = [...fresh].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (pages.length === 0) {
        return [{ data: ordered, direction: "before", nextCursor: null }];
    }

    const first = pages[0]!;
    const rest = pages.slice(1);
    return [{ ...first, data: [...ordered, ...first.data] }, ...rest];
}

/**
 * The inbox is offset-paginated over a list ordered by lastMessageAt, so a row
 * can shift across a page boundary between fetches and appear in two pages.
 * Keeping the first occurrence makes that harmless (spec §6.6).
 */
export function dedupeConversations(pages: ConversationSummary[][]): ConversationSummary[] {
    const seen = new Set<string>();
    const out: ConversationSummary[] = [];
    for (const page of pages) {
        for (const conversation of page) {
            if (seen.has(conversation.id)) continue;
            seen.add(conversation.id);
            out.push(conversation);
        }
    }
    return out;
}

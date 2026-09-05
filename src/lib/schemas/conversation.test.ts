import { describe, it, expect } from "vitest";
import fixtures from "../../../tests/fixtures/backend/conversations.json";
import {
    ConversationListResponseSchema,
    ConversationListQuerySchema,
    MessageCursorQuerySchema,
    MessagesResponseSchema,
    UnreadSummaryResponseSchema,
    SendMessageSchema,
    MESSAGE_MAX_LENGTH,
} from "./conversation";

describe("conversation schemas", () => {
    it("parses the backend list envelope without hasNextPage", () => {
        const parsed = ConversationListResponseSchema.parse(fixtures.list);
        expect(parsed.data[0]!.shop.name).toBe("TechHub Nairobi");
        expect(parsed.pagination.totalPages).toBe(1);
    });

    it("parses a message carrying a listing snapshot", () => {
        const parsed = MessagesResponseSchema.parse(fixtures.messages);
        expect(parsed.data[2]!.listing?.price).toBe(42000);
        expect(parsed.data[1]!.listing).toBeNull();
    });

    it("parses the two-sided unread summary", () => {
        const parsed = UnreadSummaryResponseSchema.parse(fixtures.unreadSummary);
        expect(parsed.customer).toBe(3);
        expect(parsed.shop).toBe(0);
    });

    it("rejects a message with neither text nor image", () => {
        expect(SendMessageSchema.safeParse({}).success).toBe(false);
    });

    it("accepts an image-only message", () => {
        const res = SendMessageSchema.safeParse({ imageUrl: "https://cdn.example.com/a.jpg" });
        expect(res.success).toBe(true);
    });

    it("rejects a body over the backend limit", () => {
        const res = SendMessageSchema.safeParse({ body: "x".repeat(MESSAGE_MAX_LENGTH + 1) });
        expect(res.success).toBe(false);
    });

    it("reads archived=false from a query string as false, not truthy", () => {
        // Regression guard: z.coerce.boolean() would make the string "false" true.
        expect(ConversationListQuerySchema.parse({ archived: "false" }).archived).toBe(false);
        expect(ConversationListQuerySchema.parse({ archived: "true" }).archived).toBe(true);
        expect(ConversationListQuerySchema.parse({}).archived).toBe(false);
    });

    it("rejects both cursors at once", () => {
        const res = MessageCursorQuerySchema.safeParse({
            before: "msg1aaaaaaaaaaaaaaaaaaaa",
            after: "msg2aaaaaaaaaaaaaaaaaaaa",
        });
        expect(res.success).toBe(false);
    });

    it("accepts an image-only message with whitespace-only body", () => {
        const res = SendMessageSchema.safeParse({
            body: "   ",
            imageUrl: "https://cdn.example.com/a.jpg",
        });
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data.body).toBeUndefined();
        }
    });

    it("rejects whitespace-only body without image", () => {
        const res = SendMessageSchema.safeParse({ body: "   " });
        expect(res.success).toBe(false);
    });

    it("keeps decryptionFailed on a row whose body could not be decrypted", () => {
        // body: null on its own is ambiguous -- a legitimate image-only message
        // looks identical -- so the flag has to survive the parse or the bubble
        // renders blank instead of "This message couldn't be displayed."
        const parsed = MessagesResponseSchema.parse(fixtures.messages);
        const undecryptable = parsed.data[3]!;
        expect(undecryptable.decryptionFailed).toBe(true);
        expect(undecryptable.body).toBeNull();
        // Absent, not false, on a healthy row: the backend sends false and the
        // field is optional, so a consumer must test truthiness either way.
        expect(parsed.data[1]!.decryptionFailed).toBeUndefined();
    });

    it("parses a message with delisted listing snapshot", () => {
        const parsed = MessagesResponseSchema.parse(fixtures.messages);
        expect(parsed.data[0]!.listing?.offerId).toBeNull();
        expect(parsed.data[0]!.listing?.title).toBe("Sony WH-1000XM5");
    });
});

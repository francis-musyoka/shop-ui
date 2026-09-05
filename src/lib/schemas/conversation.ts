import { z } from "zod";
import { CUID } from "./common";
import { CONDITIONS } from "./offer";

/** Mirrors backend src/constants/constants.ts -> MESSAGE_MAX_LENGTH. */
export const MESSAGE_MAX_LENGTH = 2000;

export const REPORT_REASONS = ["SPAM", "HARASSMENT", "SCAM", "OFFENSIVE", "OTHER"] as const;

export const SideSchema = z.enum(["CUSTOMER", "SHOP"]);
export type Side = z.infer<typeof SideSchema>;

/* ─────────────────────────── Conversation ─────────────────────────── */

export const ConversationSummarySchema = z.object({
    id: CUID,
    side: SideSchema,
    shop: z.object({
        id: CUID,
        name: z.string(),
        slug: z.string(),
        // Tolerant, not z.url(): matches seller-shop.ts, so a legacy row can't
        // break a whole thread render.
        logoUrl: z.string().nullable(),
    }),
    customer: z.object({
        id: CUID,
        firstName: z.string(),
        lastName: z.string(),
        avatarUrl: z.string().nullable(),
    }),
    unreadCount: z.number().int().nonnegative(),
    archived: z.boolean(),
    blocked: z.boolean(),
    blockedByMe: z.boolean(),
    lastMessageAt: z.string().nullable(),
    lastMessagePreview: z.string().nullable(),
    lastSenderSide: SideSchema.nullable(),
    createdAt: z.string(),
});

export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

/**
 * listConversations returns {page, limit, total, totalPages} with NO hasNextPage,
 * so the shared PaginationSchema in common.ts cannot parse it. See spec §2.3.
 */
export const ConversationPaginationSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
});

export const ConversationListResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(ConversationSummarySchema),
    pagination: ConversationPaginationSchema,
});

export const ConversationResponseSchema = z.object({
    success: z.literal(true),
    conversation: ConversationSummarySchema,
});

/* ───────────────────────────── Message ───────────────────────────── */

export const MessageSchema = z.object({
    id: CUID,
    senderId: CUID,
    senderSide: SideSchema,
    body: z.string().nullable(),
    /**
     * Bodies are encrypted at rest. The backend's openText never throws, so a
     * key rotation, a corrupt value or a missed sealText() degrades one row to
     * `body: null` with this flag set instead of failing the whole thread
     * (serializeMessage in backend src/utils/conversation.utils.ts).
     *
     * Modelled here because without it Zod strips the flag, leaving a broken
     * row indistinguishable from a legitimate image-only message -- so a
     * consumer can render "This message couldn't be displayed." rather than an
     * empty bubble. Optional in both directions: tolerant of a backend that
     * has not yet shipped it, and of one that stops sending it.
     */
    decryptionFailed: z.boolean().optional(),
    imageUrl: z.string().nullable(),
    listing: z
        .object({
            // SET NULL on offer deletion, while the snapshot fields survive.
            offerId: CUID.nullable(),
            title: z.string().nullable(),
            imageUrl: z.string().nullable(),
            price: z.number().nullable(),
            condition: z.enum(CONDITIONS).nullable(),
        })
        .nullable(),
    createdAt: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

export const MessagesResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(MessageSchema),
    direction: z.enum(["before", "after"]),
    nextCursor: CUID.nullable(),
});

export const SendMessageResponseSchema = z.object({
    success: z.literal(true),
    message: MessageSchema,
});

/* ──────────────────────── Other responses ──────────────────────── */

export const UnreadSummaryResponseSchema = z.object({
    success: z.literal(true),
    customer: z.number().int().nonnegative(),
    shop: z.number().int().nonnegative(),
});

export const MarkReadResponseSchema = z.object({
    success: z.literal(true),
    unreadCount: z.number().int().nonnegative(),
});

export const ReportResponseSchema = z.object({
    success: z.literal(true),
    report: z.object({ id: CUID }).loose(),
});

/* ───────────────────────────── Requests ───────────────────────────── */

export const SendMessageSchema = z
    .object({
        // Whitespace-only text is not text: normalising it to undefined is what
        // lets the refine below see "no body" and reject a message carrying
        // neither text nor image. A non-string is passed through untouched so
        // z.string() reports the type error rather than this preprocess. No
        // `.min(1)` on the inner schema -- after the trim an empty string can
        // never reach it, so the rule would be unreachable.
        body: z.preprocess(
            (v) => (typeof v === "string" ? v.trim() || undefined : v),
            z.string().max(MESSAGE_MAX_LENGTH).optional(),
        ),
        imageUrl: z.url().optional(),
        offerId: CUID.optional(),
    })
    .refine((d) => Boolean(d.body) || Boolean(d.imageUrl), {
        message: "A message must contain text or an image",
    });

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

export const ReportSchema = z.object({
    reason: z.enum(REPORT_REASONS),
    note: z.string().trim().max(500).optional(),
});

export type ReportReason = (typeof REPORT_REASONS)[number];

export const UpdateConversationSchema = z
    .object({
        archived: z.boolean().optional(),
        blocked: z.boolean().optional(),
    })
    .refine((d) => d.archived !== undefined || d.blocked !== undefined, {
        message: "Nothing to update",
    });

export const ConversationListQuerySchema = z.object({
    as: z.enum(["customer", "shop"]).default("customer"),
    // NOT z.coerce.boolean(): that treats any non-empty string as true, so the
    // literal "false" from a query string would become true. Mirrors the
    // backend DTO's enum-then-transform instead.
    archived: z
        .enum(["true", "false"])
        .default("false")
        .transform((v) => v === "true"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const MessageCursorQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(50).default(20),
        before: CUID.optional(),
        after: CUID.optional(),
    })
    .refine((d) => !(d.before && d.after), {
        message: "Provide either before or after, not both",
    });

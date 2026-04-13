import { describe, it, expect } from "vitest";
import { z } from "zod";
import { CuidSchema, PageSchema, SuccessFlagSchema } from "./common";

describe("CuidSchema", () => {
  it("accepts a typical Prisma cuid", () => {
    expect(CuidSchema.parse("cl9ebqhxk00003b6093z6n3kc")).toBe("cl9ebqhxk00003b6093z6n3kc");
  });

  it("rejects non-cuid strings", () => {
    expect(() => CuidSchema.parse("not-a-cuid")).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => CuidSchema.parse("")).toThrow();
  });
});

describe("PageSchema(T)", () => {
  const ItemSchema = z.object({ id: CuidSchema, name: z.string() });
  const PageOfItem = PageSchema(ItemSchema);

  it("parses a backend pagination response shape", () => {
    const fixture = {
      data: [{ id: "cl9ebqhxk00003b6093z6n3kc", name: "Phones" }],
      pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNextPage: false },
    };
    const parsed = PageOfItem.parse(fixture);
    expect(parsed.data).toHaveLength(1);
    expect(parsed.pagination.hasNextPage).toBe(false);
  });

  it("rejects responses missing the data array", () => {
    expect(() =>
      PageOfItem.parse({
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false },
      }),
    ).toThrow();
  });

  it("rejects responses with malformed pagination", () => {
    expect(() =>
      PageOfItem.parse({
        data: [],
        pagination: {
          total: "not a number",
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
        },
      }),
    ).toThrow();
  });
});

describe("SuccessFlagSchema", () => {
  it("parses { success: true }", () => {
    expect(SuccessFlagSchema.parse({ success: true })).toEqual({ success: true });
  });

  it("rejects { success: false }", () => {
    expect(() => SuccessFlagSchema.parse({ success: false })).toThrow();
  });

  it("rejects missing success field", () => {
    expect(() => SuccessFlagSchema.parse({})).toThrow();
  });
});

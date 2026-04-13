import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns parsed env when all required vars are present", async () => {
    process.env.BACKEND_API_URL = "http://localhost:5000";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const { env } = await import("./env");

    expect(env.BACKEND_API_URL).toBe("http://localhost:5000");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws a clear error when BACKEND_API_URL is missing", async () => {
    delete process.env.BACKEND_API_URL;
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    await expect(import("./env")).rejects.toThrow(/BACKEND_API_URL/);
  });

  it("throws when BACKEND_API_URL is not a valid URL", async () => {
    process.env.BACKEND_API_URL = "not-a-url";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    await expect(import("./env")).rejects.toThrow(/BACKEND_API_URL/);
  });

  it("throws a clear error when NEXT_PUBLIC_APP_URL is missing", async () => {
    process.env.BACKEND_API_URL = "http://localhost:5000";
    delete process.env.NEXT_PUBLIC_APP_URL;

    await expect(import("./env")).rejects.toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  it("throws when NEXT_PUBLIC_APP_URL is not a valid URL", async () => {
    process.env.BACKEND_API_URL = "http://localhost:5000";
    process.env.NEXT_PUBLIC_APP_URL = "not-a-url";

    await expect(import("./env")).rejects.toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

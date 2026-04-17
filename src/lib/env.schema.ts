import { z } from "zod";

/**
 * Shape of the environment variables this app depends on.
 *
 * Imported by both `env.ts` (server-only, used at runtime) and `next.config.ts`
 * (which runs at config-load and cannot import `server-only`). Keeping the schema
 * in its own file avoids duplication and guarantees `next.config.ts`'s proxy
 * destination is validated with the same URL rules as `env.ts`.
 */
export const EnvSchema = z.object({
    BACKEND_API_URL: z.url({ message: "BACKEND_API_URL must be a valid URL" }),
    NEXT_PUBLIC_APP_URL: z.url({ message: "NEXT_PUBLIC_APP_URL must be a valid URL" }),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

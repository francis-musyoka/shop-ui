import "server-only";
import { EnvSchema, type Env } from "./env.schema";

const parsed = EnvSchema.safeParse({
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
    const issues = parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
    throw new Error(`Invalid or missing environment variables:\n${issues}`);
}

export const env = parsed.data;
export type { Env };

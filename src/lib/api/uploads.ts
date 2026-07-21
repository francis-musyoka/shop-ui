import "server-only";
import { z } from "zod";
import { apiFetch } from "./client";

const UploadResponseSchema = z.object({ success: z.literal(true), url: z.url() });

export async function uploadImage(form: FormData): Promise<string> {
    // apiFetch detects a FormData body and forwards it as multipart (see client.ts),
    // so this gets the same cookie forwarding + silent 401-refresh as every other call.
    const res = await apiFetch({
        path: "/api/uploads/image",
        method: "POST",
        body: form,
        schema: UploadResponseSchema,
    });
    return res.url;
}

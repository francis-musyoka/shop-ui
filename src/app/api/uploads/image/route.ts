import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/api/uploads";
import { ApiError } from "@/lib/api/errors";

export async function POST(req: NextRequest) {
    const form = await req.formData();
    try {
        const url = await uploadImage(form);
        return NextResponse.json({ url });
    } catch (error) {
        if (error instanceof ApiError) {
            const status =
                error.statusCode >= 400 && error.statusCode <= 599 ? error.statusCode : 502;
            return NextResponse.json({ success: false, error: error.messages }, { status });
        }
        throw error;
    }
}

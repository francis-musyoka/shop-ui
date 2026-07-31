"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
    name: "logoUrl" | "bannerUrl";
    label: string;
    hint: string;
    defaultUrl?: string;
}

// Square/wide upload control used for shop logo & banner on the create-shop and
// shop-settings forms. Uploads immediately on file select via /api/uploads/image and
// stores the returned URL in a hidden input, so the value round-trips through a plain
// <form> + server action like everything else in this codebase (no react-hook-form).
export function ImageDropzone({ name, label, hint, defaultUrl }: ImageDropzoneProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(defaultUrl ?? null);
    const [uploadedUrl, setUploadedUrl] = useState(defaultUrl ?? "");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file again later
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setPending(true);
        setError(null);

        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/uploads/image", { method: "POST", body: form });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error?.[0] ?? "Upload failed. Try again.");
            }
            setUploadedUrl(data.url);
            setPreviewUrl(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed. Try again.");
            setUploadedUrl(defaultUrl ?? "");
            setPreviewUrl(defaultUrl ?? null);
        } finally {
            setPending(false);
            URL.revokeObjectURL(objectUrl);
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm">{label}</Label>
            <input type="hidden" name={name} value={uploadedUrl} />
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={pending}
                className="border-border bg-card text-muted-foreground hover:border-foreground/30 relative flex h-32 w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-sm border border-dashed transition-colors duration-150 ease-out disabled:cursor-not-allowed"
            >
                {previewUrl ? (
                    <Image src={previewUrl} alt={label} fill unoptimized className="object-cover" />
                ) : (
                    <>
                        <ImagePlus size={20} />
                        <p className="text-xs">Click to upload</p>
                    </>
                )}
                {pending && (
                    <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin" size={20} />
                    </div>
                )}
            </button>
            <span className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
                {error ?? hint}
            </span>
        </div>
    );
}

import { requireAuth } from "@/lib/auth/require-auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    await requireAuth();

    return <main className="mx-auto max-w-4xl flex-1 px-4 py-8">{children}</main>;
}

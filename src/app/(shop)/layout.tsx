import { getSession } from "@/lib/auth/session";
import { getTopLevelCategories } from "@/lib/api/categories";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const [session, categories] = await Promise.all([
        getSession(),
        getTopLevelCategories().catch(() => []),
    ]);

    return (
        <>
            <SiteHeader user={session?.user ?? null} categories={categories} />
            <div className="flex-1">{children}</div>
            <Footer />
        </>
    );
}

import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <Footer />
        </>
    );
}

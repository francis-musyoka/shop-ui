import Link from "next/link";
import { redirect } from "next/navigation";
import { Store, ArrowLeft, PackageCheck, MessagesSquare, BadgeCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/require-auth";
import { isSeller } from "@/lib/seller/is-seller";

// The gate shown to a signed-in user whose role isn't SELLER yet — they haven't opened a
// shop. Rendered without the dashboard sidebar (nothing to navigate to yet).
const perks = [
    {
        icon: PackageCheck,
        title: "List your products",
        body: "Reach buyers across Kenya from one storefront.",
    },
    {
        icon: MessagesSquare,
        title: "Message buyers directly",
        body: "No middleman — talk to customers about their orders.",
    },
    {
        icon: BadgeCheck,
        title: "Build a verified shop",
        body: "Earn a verified badge and grow your reputation.",
    },
];

export default async function SellPage() {
    const session = await requireAuth();
    if (isSeller(session.user)) {
        redirect("/seller/dashboard");
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-brand-800 dark:bg-brand-900">
                <div className="flex h-14 items-center px-4 md:px-6">
                    <Link
                        href="/"
                        className="font-(family-name:--font-brand) text-xl font-bold text-white"
                    >
                        Riverflow
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-lg px-4 py-16 text-center">
                <div className="bg-brand-50 dark:bg-brand-400/10 mx-auto flex size-16 items-center justify-center rounded-full">
                    <Store className="text-brand-600 dark:text-brand-400" size={28} />
                </div>
                <h1 className="mt-5 font-(family-name:--font-brand) text-xl font-bold">
                    Start selling on Riverflow
                </h1>
                <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                    You don&apos;t have a shop yet. Open one to list products, manage stock and
                    connect with buyers.
                </p>

                <div className="border-border bg-card mt-8 flex flex-col gap-4 rounded-sm border p-5 text-left">
                    {perks.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="flex items-start gap-3">
                            <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-sm">
                                <Icon className="text-brand-600 dark:text-brand-400" size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{title}</p>
                                <p className="text-muted-foreground text-sm">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-col items-center gap-3">
                    <Link
                        href="/seller/sell/open"
                        className={`${buttonVariants({ variant: "accent" })} w-full sm:w-auto`}
                    >
                        <Store size={16} />
                        Open your shop
                    </Link>
                    <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        <ArrowLeft size={14} />
                        Back to marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
}

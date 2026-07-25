import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { isSeller } from "@/lib/seller/is-seller";

// Bare /seller has nothing of its own to show — send the visitor to whichever
// entry point matches their role.
export default async function SellerIndexPage() {
    const session = await requireAuth();
    redirect(isSeller(session.user) ? "/seller/dashboard" : "/seller/sell");
}

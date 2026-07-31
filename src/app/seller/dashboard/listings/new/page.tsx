import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getCategoryTree } from "@/lib/api/categories";
import { listBrands } from "@/lib/api/brands";
import { canManageListings } from "@/lib/seller/can-manage";
import { PageHeader } from "@/components/seller/page-header";
import { AddListingForm } from "./add-listing-form";

export default async function NewListingPage() {
    const [shop, tree, brands] = await Promise.all([getMyShop(), getCategoryTree(), listBrands()]);
    const canManage = canManageListings(shop.status);
    const categories = tree.map(({ id, name }) => ({ id, name }));

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <nav className="text-muted-foreground flex items-center gap-1 text-sm">
                <Link href="/seller/dashboard/listings" className="hover:text-foreground">
                    Listings
                </Link>
                <ChevronRight size={14} />
                <span className="text-foreground">New listing</span>
            </nav>

            <PageHeader
                title="Add a listing"
                description="List one of your shop's products from the catalog. It goes live immediately once you submit."
            />

            <AddListingForm
                shopCategoryId={shop.category.id}
                categories={categories}
                brands={brands}
                canManage={canManage}
            />
        </div>
    );
}

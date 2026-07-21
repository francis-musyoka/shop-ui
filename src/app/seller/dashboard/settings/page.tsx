import { getMyShop } from "@/lib/api/shops";
import { getCategoryTree } from "@/lib/api/categories";
import { PageHeader } from "@/components/seller/page-header";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
    const [shop, tree] = await Promise.all([getMyShop(), getCategoryTree()]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Shop settings"
                description="Update your shop profile, contact details and pickup address."
            />
            <SettingsForm shop={shop} categories={tree} />
        </div>
    );
}

import Image from "next/image";
import { Store, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConditionBadge } from "@/components/shop/condition-badge";
import { OfferStatusBadge } from "@/components/seller/offer-status-badge";
import { AddListingButton } from "@/components/seller/add-listing-button";
import { ListingRowActions } from "@/components/seller/listing-row-actions";
import { composeVariantLabel } from "@/lib/shop-slug";
import { formatPrice } from "@/lib/formatPrice";
import type { SellerListing } from "@/lib/schemas/offer";

export function ListingsTable({
    listings,
    canManage,
}: {
    listings: SellerListing[];
    canManage: boolean;
}) {
    if (listings.length === 0) {
        return (
            <div className="border-border bg-card flex flex-col items-center gap-3 rounded-sm border px-6 py-16 text-center">
                <div className="bg-muted flex size-12 items-center justify-center rounded-sm">
                    <Store className="text-muted-foreground" size={22} />
                </div>
                <div>
                    <p className="font-medium">No listings yet</p>
                    <p className="text-muted-foreground text-sm">
                        Add your first listing to start selling.
                    </p>
                </div>
                <AddListingButton canManage={canManage} />
            </div>
        );
    }

    return (
        <div className="border-border bg-card overflow-x-auto rounded-sm border">
            <Table className="min-w-[760px]">
                <TableHeader>
                    <TableRow className="text-muted-foreground text-xs uppercase">
                        <TableHead className="px-4">Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="px-4 text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listings.map((l) => {
                        const stock = l.quantityAvailable;
                        const lowStock = stock > 0 && stock <= 5;
                        const hasDiscount =
                            l.price.discountPercent != null && l.price.discountPercent > 0;
                        return (
                            <TableRow key={l.id}>
                                {/* Product */}
                                <TableCell className="px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                                            {l.variant.mainImageUrl ? (
                                                <Image
                                                    src={l.variant.mainImageUrl}
                                                    alt=""
                                                    fill
                                                    unoptimized
                                                    sizes="44px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Store
                                                    className="text-muted-foreground"
                                                    size={18}
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {l.product.title}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {composeVariantLabel(l.variant.attributes)}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                {/* Category */}
                                <TableCell className="text-muted-foreground">
                                    {l.category.name}
                                </TableCell>
                                {/* Condition */}
                                <TableCell>
                                    <ConditionBadge condition={l.condition} />
                                </TableCell>
                                {/* Price */}
                                <TableCell className="text-right">
                                    <div className="text-brand-800 dark:text-gold-300 font-mono font-semibold">
                                        {formatPrice(l.price.finalPrice)}
                                    </div>
                                    {hasDiscount && (
                                        <div className="text-muted-foreground font-mono text-xs line-through">
                                            {formatPrice(
                                                l.price.originalPrice ?? l.price.finalPrice,
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                {/* Stock */}
                                <TableCell className="text-right font-mono">
                                    {stock === 0 ? (
                                        <span className="text-destructive font-medium">0</span>
                                    ) : (
                                        <span
                                            className={
                                                lowStock ? "text-gold-500 font-medium" : undefined
                                            }
                                        >
                                            {stock}
                                        </span>
                                    )}
                                </TableCell>
                                {/* Status */}
                                <TableCell>
                                    <OfferStatusBadge status={l.status} />
                                </TableCell>
                                {/* Actions — edit/set price/activate-deactivate dialogs.
                                    Only available when the shop can manage listings;
                                    otherwise a disabled trigger so the row still reads as
                                    "actions unavailable" rather than broken. */}
                                <TableCell className="px-4 text-right">
                                    {canManage ? (
                                        <ListingRowActions listing={l} />
                                    ) : (
                                        <Button variant="ghost" size="icon-sm" disabled>
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

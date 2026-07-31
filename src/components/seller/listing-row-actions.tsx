"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Tag, Ban, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConditionBadge } from "@/components/shop/condition-badge";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { OfferFields } from "@/components/seller/offer-fields";
import {
    editOfferAction,
    setPriceAction,
    setStatusAction,
} from "@/app/seller/dashboard/listings/actions";
import { composeVariantLabel } from "@/lib/shop-slug";
import type { SellerListing } from "@/lib/schemas/offer";

// Row actions for a single listing: a dropdown that opens Edit / Set price / Deactivate
// dialogs, each backed by its own server action + useActionState form.
type OpenDialog = null | "edit" | "price" | "status";

export function ListingRowActions({ listing }: { listing: SellerListing }) {
    const [open, setOpen] = useState<OpenDialog>(null);
    const close = () => setOpen(null);
    const isInactive = listing.status === "INACTIVE";
    // SUSPENDED is a moderation state — the seller can't self-toggle it.
    const isSuspended = listing.status === "SUSPENDED";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                    <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setOpen("edit")}>
                        <Pencil size={14} />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen("price")}>
                        <Tag size={14} />
                        Set price
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isInactive ? (
                        <DropdownMenuItem onClick={() => setOpen("status")}>
                            <CheckCircle2 size={14} />
                            Activate
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            variant="destructive"
                            disabled={isSuspended}
                            onClick={() => setOpen("status")}
                        >
                            <Ban size={14} />
                            Deactivate
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <EditListingDialog listing={listing} open={open === "edit"} onCloseAction={close} />
            <SetPriceDialog listing={listing} open={open === "price"} onCloseAction={close} />
            <StatusDialog listing={listing} open={open === "status"} onCloseAction={close} />
        </>
    );
}

function ProductLine({ listing }: { listing: SellerListing }) {
    return (
        <>
            {listing.product.title} · {composeVariantLabel(listing.variant.attributes)}
        </>
    );
}

function SetPriceDialog({
    listing,
    open,
    onCloseAction,
}: {
    listing: SellerListing;
    open: boolean;
    onCloseAction: () => void;
}) {
    const [state, formAction, pending] = useActionState(setPriceAction, null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Price updated");
            onCloseAction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onCloseAction()}>
            <DialogContent className="gap-6 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Set price</DialogTitle>
                    <DialogDescription>
                        <ProductLine listing={listing} />
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="contents">
                    <input type="hidden" name="offerId" value={listing.id} />
                    <div className="flex flex-col gap-5">
                        <FormError message={state?.formError} />
                        <OfferFields
                            variant="price"
                            defaults={{
                                price: listing.price.finalPrice,
                                discount: listing.price.discountPercent ?? 0,
                            }}
                            fieldErrors={state?.fieldErrors ?? {}}
                            condition={listing.condition}
                        />
                    </div>
                    <DialogFooter className="bg-transparent">
                        <DialogClose render={<Button variant="outline" size="sm" type="button" />}>
                            Cancel
                        </DialogClose>
                        <SubmitButton pending={pending} size="sm">
                            Save price
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditListingDialog({
    listing,
    open,
    onCloseAction,
}: {
    listing: SellerListing;
    open: boolean;
    onCloseAction: () => void;
}) {
    const [state, formAction, pending] = useActionState(editOfferAction, null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Listing updated");
            onCloseAction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onCloseAction()}>
            <DialogContent className="gap-6 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit listing</DialogTitle>
                    <DialogDescription>
                        <ProductLine listing={listing} />
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="contents">
                    <input type="hidden" name="offerId" value={listing.id} />
                    <input type="hidden" name="condition" value={listing.condition} />
                    <div className="flex flex-col gap-5">
                        <FormError message={state?.formError} />
                        {/* Condition is part of the offer's identity — changing it means a new listing. */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Condition</span>
                            <ConditionBadge condition={listing.condition} />
                            <span className="text-muted-foreground text-xs">
                                (change requires a new listing)
                            </span>
                        </div>
                        <OfferFields
                            variant="edit"
                            defaults={{
                                quantity: listing.quantityTotal,
                                deliveryDays: listing.deliveryDays,
                                warrantyMonths: listing.warrantyMonths,
                                conditionNotes: listing.conditionNotes,
                            }}
                            fieldErrors={state?.fieldErrors ?? {}}
                            condition={listing.condition}
                        />
                    </div>
                    <DialogFooter className="bg-transparent">
                        <DialogClose render={<Button variant="outline" size="sm" type="button" />}>
                            Cancel
                        </DialogClose>
                        <SubmitButton pending={pending} size="sm">
                            Save changes
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function StatusDialog({
    listing,
    open,
    onCloseAction,
}: {
    listing: SellerListing;
    open: boolean;
    onCloseAction: () => void;
}) {
    const isInactive = listing.status === "INACTIVE";
    const [state, formAction, pending] = useActionState(setStatusAction, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(isInactive ? "Listing activated" : "Listing deactivated");
            onCloseAction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onCloseAction()}>
            <DialogContent showCloseButton={false} className="gap-6 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isInactive ? "Activate listing" : "Deactivate listing"}
                    </DialogTitle>
                    <DialogDescription>
                        {isInactive ? (
                            <>
                                “{listing.product.title}” will be visible to buyers again and can be
                                purchased.
                            </>
                        ) : (
                            <>
                                “{listing.product.title}” will be hidden from buyers. You can
                                reactivate it anytime.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="contents">
                    <input type="hidden" name="offerId" value={listing.id} />
                    <input type="hidden" name="status" value={isInactive ? "ACTIVE" : "INACTIVE"} />
                    <FormError message={state?.formError} />
                    <DialogFooter className="bg-transparent">
                        <DialogClose render={<Button variant="outline" size="sm" type="button" />}>
                            Cancel
                        </DialogClose>
                        <SubmitButton
                            pending={pending}
                            size="sm"
                            variant={isInactive ? "accent" : "destructive"}
                        >
                            {isInactive ? "Activate" : "Deactivate"}
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

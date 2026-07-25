"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/auth/form-field";
import { ImageDropzone } from "@/components/seller/image-dropzone";
import { SlugField } from "@/components/seller/slug-field";
import { BusinessTypeToggle, type BusinessType } from "@/components/seller/business-type-toggle";
import { slugify } from "@/lib/shop-slug";
import type { ShopFormValues } from "@/lib/schemas/seller-shop";
import type { CategoryTreeNode } from "@/lib/schemas/category";

export interface ShopFormDefaults extends Partial<ShopFormValues> {
    // The id alone isn't enough to render the read-only category field — edit mode
    // doesn't get the full category tree, just the shop's current category name.
    categoryName?: string;
}

interface ShopFormFieldsProps {
    mode: "create" | "edit";
    defaults?: ShopFormDefaults;
    fieldErrors: Record<string, string[]>;
    disableCategory?: boolean;
    categories: CategoryTreeNode[];
}

// Required-field marker.
function Req() {
    return (
        <span className="text-destructive ml-0.5" aria-hidden>
            *
        </span>
    );
}

function SectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="border-border bg-card rounded-sm border">
            <div className="border-border border-b px-4 py-3">
                <h2 className="text-md font-semibold">{title}</h2>
                {description && (
                    <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
                )}
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}

// Shared shop-details form. Used by both the open-shop (create) flow and shop settings
// (edit) — the two differ only in whether the category can be changed (`disableCategory`,
// always true in settings since category changes go through support) and whether the
// slug auto-fills from the name as the seller types (create only; edit is free-standing).
export function ShopFormFields({
    mode,
    defaults,
    fieldErrors,
    disableCategory,
    categories,
}: ShopFormFieldsProps) {
    const [name, setName] = useState(defaults?.name ?? "");
    const [slug, setSlug] = useState(defaults?.slug ?? "");
    const [slugEdited, setSlugEdited] = useState(false);
    const [businessType, setBusinessType] = useState<BusinessType>(
        defaults?.businessType ?? "INDIVIDUAL",
    );
    const [category, setCategory] = useState<{ id: string; name: string } | null>(
        defaults?.categoryId
            ? { id: defaults.categoryId, name: defaults.categoryName ?? "" }
            : null,
    );
    const [showLinks, setShowLinks] = useState(
        Boolean(
            defaults?.websiteLink || defaults?.facebook || defaults?.instagram || defaults?.tiktok,
        ),
    );

    return (
        <div className="flex flex-col gap-6">
            <SectionCard title="Shop details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name" className="text-sm">
                            Shop name
                            <Req />
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => {
                                const v = e.target.value;
                                setName(v);
                                if (mode === "create" && !slugEdited) setSlug(slugify(v));
                            }}
                            placeholder="e.g. River Tech"
                            aria-invalid={!!fieldErrors.name?.[0]}
                            className="h-10"
                        />
                        {fieldErrors.name?.[0] && (
                            <span className="text-destructive text-xs">{fieldErrors.name[0]}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <SlugField
                            value={slug}
                            onValueChangeAction={(v) => {
                                setSlug(v);
                                setSlugEdited(true);
                            }}
                            excludeSlug={mode === "edit" ? defaults?.slug : undefined}
                            required
                        />
                        {fieldErrors.slug?.[0] && (
                            <span className="text-destructive text-xs">{fieldErrors.slug[0]}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="description" className="text-sm">
                            Description
                            <Req />
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            rows={4}
                            defaultValue={defaults?.description}
                            placeholder="What do you sell? Tell buyers what makes your shop trustworthy."
                            aria-invalid={!!fieldErrors.description?.[0]}
                            className="text-sm"
                        />
                        {fieldErrors.description?.[0] ? (
                            <span className="text-destructive text-xs">
                                {fieldErrors.description[0]}
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-xs">
                                At least 10 characters.
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm">
                            Category
                            <Req />
                        </Label>
                        <input type="hidden" name="categoryId" value={category?.id ?? ""} />
                        {disableCategory ? (
                            <>
                                <div
                                    role="textbox"
                                    aria-readonly="true"
                                    aria-label="Category"
                                    className="border-input bg-muted text-muted-foreground flex h-10 items-center rounded-sm border px-2.5 text-sm"
                                >
                                    {category?.name || "—"}
                                </div>
                                <span className="text-muted-foreground text-xs">
                                    Contact support to change your shop category.
                                </span>
                            </>
                        ) : (
                            <CategoryPicker
                                categories={categories}
                                value={category}
                                onSelect={setCategory}
                            />
                        )}
                        {fieldErrors.categoryId?.[0] && (
                            <span className="text-destructive text-xs">
                                {fieldErrors.categoryId[0]}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm">
                            Business type
                            <Req />
                        </Label>
                        <input type="hidden" name="businessType" value={businessType} />
                        <BusinessTypeToggle
                            value={businessType}
                            onValueChangeAction={setBusinessType}
                        />
                        {fieldErrors.businessType?.[0] && (
                            <span className="text-destructive text-xs">
                                {fieldErrors.businessType[0]}
                            </span>
                        )}
                    </div>
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SectionCard title="Contact">
                    <div className="flex flex-col gap-4">
                        <FormField
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="sales@yourshop.co.ke"
                            defaultValue={defaults?.email}
                            error={fieldErrors.email?.[0]}
                        />
                        <FormField
                            name="phone"
                            label="Phone"
                            placeholder="+254 7XX XXX XXX"
                            defaultValue={defaults?.phone}
                            error={fieldErrors.phone?.[0]}
                        />
                    </div>
                </SectionCard>

                <SectionCard
                    title="Shop address"
                    description="Where buyers collect or where you dispatch from."
                >
                    <div className="flex flex-col gap-4">
                        <FormField
                            name="street"
                            label="Street"
                            placeholder="Building, street"
                            defaultValue={defaults?.street}
                            error={fieldErrors.street?.[0]}
                        />
                        <FormField
                            name="city"
                            label="City"
                            placeholder="Nairobi"
                            defaultValue={defaults?.city}
                            error={fieldErrors.city?.[0]}
                        />
                        <FormField
                            name="state"
                            label="County / State"
                            placeholder="Nairobi County"
                            defaultValue={defaults?.state}
                            error={fieldErrors.state?.[0]}
                            required={false}
                        />
                        <FormField
                            name="postalCode"
                            label="Postal code"
                            placeholder="00100"
                            defaultValue={defaults?.postalCode}
                            error={fieldErrors.postalCode?.[0]}
                            required={false}
                        />
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="country" className="text-sm">
                                Country
                            </Label>
                            <Input id="country" value="Kenya" disabled className="h-10" />
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="border-border rounded-sm border">
                <button
                    type="button"
                    onClick={() => setShowLinks((v) => !v)}
                    aria-expanded={showLinks}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
                >
                    Links — website & social (optional)
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${showLinks ? "rotate-180" : ""}`}
                    />
                </button>
                {showLinks && (
                    <div className="border-border grid grid-cols-1 gap-4 border-t p-4 sm:grid-cols-2">
                        <FormField
                            name="websiteLink"
                            label="Website"
                            placeholder="https://…"
                            defaultValue={defaults?.websiteLink}
                            error={fieldErrors.websiteLink?.[0]}
                            required={false}
                        />
                        <FormField
                            name="facebook"
                            label="Facebook"
                            placeholder="https://facebook.com/…"
                            defaultValue={defaults?.facebook}
                            error={fieldErrors.facebook?.[0]}
                            required={false}
                        />
                        <FormField
                            name="instagram"
                            label="Instagram"
                            placeholder="https://instagram.com/…"
                            defaultValue={defaults?.instagram}
                            error={fieldErrors.instagram?.[0]}
                            required={false}
                        />
                        <FormField
                            name="tiktok"
                            label="TikTok"
                            placeholder="https://tiktok.com/@…"
                            defaultValue={defaults?.tiktok}
                            error={fieldErrors.tiktok?.[0]}
                            required={false}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">
                    Branding <span className="text-muted-foreground font-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ImageDropzone
                        name="logoUrl"
                        label="Logo"
                        hint="Square, at least 200×200px."
                        defaultUrl={defaults?.logoUrl}
                    />
                    <ImageDropzone
                        name="bannerUrl"
                        label="Banner"
                        hint="Wide, e.g. 1200×300px."
                        defaultUrl={defaults?.bannerUrl}
                    />
                </div>
            </div>
        </div>
    );
}

// Modal category picker — drills through the tree the same way the public browse
// drawer does (CategoryDrilldown), but selects a leaf category instead of navigating.
function CategoryPicker({
    categories,
    value,
    onSelect,
}: {
    categories: CategoryTreeNode[];
    value: { id: string; name: string } | null;
    onSelect: (node: { id: string; name: string }) => void;
}) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState<CategoryTreeNode[]>([]);
    const current = path[path.length - 1];
    const nodes = current ? (current.children ?? []) : categories;

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (!next) setPath([]);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="border-input bg-background text-foreground flex h-10 items-center justify-between rounded-sm border px-2.5 text-sm"
            >
                <span className={value ? "text-foreground" : "text-muted-foreground"}>
                    {value?.name || "Select a category"}
                </span>
                <ChevronRight className="text-muted-foreground rotate-90" size={14} />
            </button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{current ? current.name : "Select a category"}</DialogTitle>
                </DialogHeader>
                <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
                    {current && (
                        <button
                            type="button"
                            onClick={() => setPath((p) => p.slice(0, -1))}
                            className="text-muted-foreground hover:bg-muted flex items-center gap-1 rounded-sm px-3 py-2 text-left text-sm"
                        >
                            <ChevronLeft size={14} /> Back
                        </button>
                    )}
                    {nodes.map((node) =>
                        node.children?.length ? (
                            <div
                                key={node.id}
                                className="hover:bg-muted flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm"
                            >
                                <button
                                    type="button"
                                    onClick={() => setPath((p) => [...p, node])}
                                    className="flex flex-1 items-center justify-between gap-1 text-left"
                                >
                                    {node.name}
                                    <ChevronRight className="text-muted-foreground" size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelect({ id: node.id, name: node.name });
                                        handleOpenChange(false);
                                    }}
                                    className="text-brand-600 dark:text-brand-400 shrink-0 text-xs font-medium hover:underline"
                                >
                                    Select this category
                                </button>
                            </div>
                        ) : (
                            <button
                                key={node.id}
                                type="button"
                                onClick={() => {
                                    onSelect({ id: node.id, name: node.name });
                                    handleOpenChange(false);
                                }}
                                className="hover:bg-muted rounded-sm px-3 py-2 text-left text-sm"
                            >
                                {node.name}
                            </button>
                        ),
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

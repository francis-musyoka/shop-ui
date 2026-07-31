import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

interface SubmitButtonProps {
    pending: boolean;
    children: React.ReactNode;
    className?: string;
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
    // Extra client-side gate on top of `pending` (e.g. "nothing selected yet") — forms
    // that need it pass it explicitly; everyone else is unaffected.
    disabled?: boolean;
}

export function SubmitButton({
    pending,
    children,
    className,
    variant = "accent",
    size,
    disabled,
}: SubmitButtonProps) {
    return (
        <Button
            type="submit"
            variant={variant}
            size={size}
            disabled={pending || disabled}
            className={className}
        >
            {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {children}
        </Button>
    );
}

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
    pending: boolean;
    children: React.ReactNode;
    className?: string;
}

export function SubmitButton({ pending, children, className }: SubmitButtonProps) {
    return (
        <Button type="submit" variant="accent" disabled={pending} className={className}>
            {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {children}
        </Button>
    );
}

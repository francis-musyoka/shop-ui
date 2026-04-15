import { CircleAlert } from "lucide-react";

interface FormErrorProps {
    message?: string;
}

export function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <div
            role="alert"
            className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm"
        >
            <CircleAlert className="size-4 shrink-0" />
            <p>{message}</p>
        </div>
    );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    defaultValue?: string;
    error?: string;
    required?: boolean;
    autoComplete?: string;
}

export function FormField({
    name,
    label,
    type = "text",
    placeholder,
    defaultValue,
    error,
    required = true,
    autoComplete,
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                required={required}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
            />
            {error && (
                <p id={`${name}-error`} className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input, type InputProps } from "@/components/ui/input";

export const FormField = React.forwardRef<HTMLInputElement, InputProps & { label: string; error?: string }>(
  ({ label, error, ...inputProps }, ref) => {
    const id = inputProps.id ?? inputProps.name;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} ref={ref} aria-invalid={Boolean(error)} {...inputProps} />
        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
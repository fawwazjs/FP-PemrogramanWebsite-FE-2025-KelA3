import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  optionalLabel?: boolean; // show (optional)
}

export function FormField({
  label,
  required,
  optionalLabel,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {!required && optionalLabel && (
          <span className="text-gray-500 text-xs">(optional)</span>
        )}
      </Label>

      <Input
        className={className ?? "bg-[#F3F3F5]"}
        required={required}
        {...props}
      />
    </div>
  );
}

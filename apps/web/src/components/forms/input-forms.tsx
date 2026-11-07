import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormInputProps } from "@/types/global";

const InputFields = ({
  name,
  label,
  placeholder,
  type = "text",
  value,
  disabled,
  validation,
  error,
  register,
}: FormInputProps) => {
  return (
    <div className="space-y-5">
      <Label htmlFor={name} className="form-label m-1 mt-5">
        {label}
      </Label>

      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        className={cn("form-input", {
          "opacity-50 cursor-not-allowed": disabled,
        })}
        {...register(name, validation)}
      />

      {error && (<p className="text-sm text-red-500">{error.message}</p>)}
    </div>
  );
};

export default InputFields;

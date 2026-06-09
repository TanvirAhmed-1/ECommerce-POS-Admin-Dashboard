

"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

type RHFSelectProps = {
  name: string;
  label?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  rules?: Record<string, any>;
  onChange?: (value: string) => void; // NEW
};

export default function RHFSelect({
  name,
  label,
  placeholder,
  options,
  defaultValue,
  rules,
  onChange,
}: RHFSelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <div className="flex flex-col gap-2 flex-1 w-full">
      <Label htmlFor={name}>{label}</Label>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ""}
        rules={rules}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);    // update react-hook-form
              onChange?.(value);        // custom handler
            }}
          >
            <SelectTrigger
              className={`w-full bg-white border ${error ? "border-red-500" : "border-gray-400"
                }`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type RHFSelectProps = {
  name: string;
  label?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  rules?: Record<string, any>;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export default function RHFSelect({
  name,
  label,
  placeholder,
  options,
  defaultValue,
  rules,
  onChange,
  disabled,
}: RHFSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  
  const error = errors[name]?.message as string;

  return (
    <div className="flex flex-col gap-1.5 flex-1 w-full">
      {label && (
        <Label 
          htmlFor={name}
          className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
        >
          {label}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ""}
        rules={rules}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              onChange?.(value);
            }}
          >
            <SelectTrigger
              disabled={disabled}
              className={`w-full h-10 px-3 rounded-lg border bg-card text-xs font-medium text-foreground outline-none transition-all focus:border-zinc-400 dark:focus:border-zinc-700 ${
                error ? "border-destructive" : "border-border"
              }`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className="bg-popover border border-border text-popover-foreground">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  );
}

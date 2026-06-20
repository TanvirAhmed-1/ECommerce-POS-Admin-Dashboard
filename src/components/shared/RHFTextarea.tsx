"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "../ui/label";

type RHFTextareaProps = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, any>;
  rows?: number;
};

export default function RHFTextarea({
  name,
  label,
  placeholder,
  rules,
  defaultValue,
  rows = 4,
}: RHFTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string;

  return (
    <div className="flex flex-1 flex-col gap-1.5 w-full">
      <Label 
        htmlFor={name}
        className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <textarea
        id={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={rows}
        className={`w-full p-3 rounded-lg border ${
          error
            ? "border-destructive focus:border-destructive"
            : "border-border focus:border-zinc-400 dark:focus:border-zinc-700"
        } bg-card text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50`}
        {...register(name, rules)}
      />
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  );
}

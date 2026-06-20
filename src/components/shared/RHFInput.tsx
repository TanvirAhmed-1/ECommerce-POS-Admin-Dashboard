"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "../ui/label";

type RHFInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, any>;
};

export default function RHFInput({
  name,
  label,
  placeholder,
  type = "text",
  defaultValue,
  rules,
}: RHFInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string;
  const [showPassword, setShowPassword] = useState(false);

  // Decide the input type
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="flex flex-1 flex-col gap-1.5 w-full relative">
      <Label 
        htmlFor={name}
        className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <div className="relative w-full">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`w-full h-10 px-3 rounded-lg border ${
            error
              ? "border-destructive focus:border-destructive"
              : "border-border focus:border-zinc-400 dark:focus:border-zinc-700"
          } bg-card text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50 pr-10`}
          {...register(name, rules)}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  );
}

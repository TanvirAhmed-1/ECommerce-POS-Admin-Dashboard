"use client";

// import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

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
    <div className="flex flex-1 flex-col gap-2 w-full">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        defaultValue={defaultValue} // set default value
        rows={rows}
        className={`border ${
          error ? "border-red-500" : "border-gray-400"
        } bg-white w-full`}
        {...register(name, rules)}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

type RHFDatePickerProps = {
  name: string;
  label: string;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, any>;
};

export default function RHFDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  rules,
}: RHFDatePickerProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 flex-1 w-full">
      <Label 
        htmlFor={name}
        className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full h-10 px-3 justify-start text-left font-medium text-xs rounded-lg border bg-card hover:bg-muted/50 text-foreground outline-none transition-all flex items-center gap-2 cursor-pointer ${
                    error ? "border-destructive focus:border-destructive" : "border-border focus:border-zinc-400 dark:focus:border-zinc-700"
                  }`}
                  onClick={() => setOpen(!open)}
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  {field.value ? (
                    <span className="text-foreground">{format(field.value, "dd/MM/yyyy")}</span>
                  ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border border-border rounded-xl shadow-xl">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                  className="bg-card text-foreground rounded-xl"
                />
              </PopoverContent>
            </Popover>
            {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
          </>
        )}
      />
    </div>
  );
}

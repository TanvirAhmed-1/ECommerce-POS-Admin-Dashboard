"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { format } from "date-fns";

//import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
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
    <div className="flex flex-col gap-2 flex-1 w-full">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-white border ${
                    error ? "border-red-500" : "border-gray-400"
                  }`}
                  onClick={() => setOpen(!open)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, "dd/MM/yyyy")
                  ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border border-gray-400">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </>
        )}
      />
    </div>
  );
}

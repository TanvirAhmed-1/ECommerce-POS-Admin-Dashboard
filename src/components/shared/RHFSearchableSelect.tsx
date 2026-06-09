
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RHFSelectProps = {
  name: string;
  label?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, any>;
  onChange?: (value: string) => void;
};

export default function RHFSearchableSelect({
  name,
  label,
  placeholder = "Select option...",
  options,
  defaultValue,
  rules,
  onChange,
}: RHFSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const error = errors[name]?.message as string;

  return (
    <div className="flex flex-col gap-2 flex-1 w-full">
      {label && <Label htmlFor={name}>{label}</Label>}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ""}
        rules={rules}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={`w-full justify-between bg-background font-normal hover:bg-accent hover:text-accent-foreground transition-all border ${
                  error ? "border-red-500" : "border-input"
                } ${!field.value ? "text-muted-foreground" : "text-foreground"}`}
              >
                {field.value
                  ? options.find((opt) => opt.value === field.value)?.label
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              style={{ width: width ? `${width}px` : "auto" }}
              className="p-0 bg-popover border border-border text-popover-foreground shadow-2xl"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder={`Search ${label?.toLowerCase()}...`}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.label} // Command searches by this value
                        onSelect={() => {
                          const newValue =
                            opt.value === field.value ? "" : opt.value;
                          field.onChange(newValue);
                          onChange?.(newValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === opt.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {opt.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                ref={triggerRef}
                type="button"
                aria-expanded={open}
                className={`w-full h-10 px-3 justify-between font-medium text-xs rounded-lg border bg-card hover:bg-muted/50 text-foreground outline-none transition-all flex items-center gap-2 cursor-pointer ${
                  error 
                    ? "border-destructive focus:border-destructive" 
                    : "border-border focus:border-zinc-400 dark:focus:border-zinc-700"
                } ${!field.value ? "text-muted-foreground" : "text-foreground"}`}
              >
                <span className="truncate">
                  {field.value
                    ? options.find((opt) => opt.value === field.value)?.label
                    : placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              style={{ width: width ? `${width}px` : "auto" }}
              className="p-0 bg-popover border border-border text-popover-foreground shadow-2xl rounded-xl"
              align="start"
            >
              <Command className="bg-popover text-popover-foreground">
                <CommandInput
                  placeholder={`Search ${label?.toLowerCase() || "options"}...`}
                  className="h-9 text-xs"
                />
                <CommandList>
                  <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
                    No results found.
                  </CommandEmpty>
                  <CommandGroup>
                    {options.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.label}
                        onSelect={() => {
                          const newValue =
                            opt.value === field.value ? "" : opt.value;
                          field.onChange(newValue);
                          onChange?.(newValue);
                          setOpen(false);
                        }}
                        className="text-xs cursor-pointer hover:bg-muted/50"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3.5 w-3.5",
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

      {error && <span className="text-[10px] font-bold text-destructive">{error}</span>}
    </div>
  );
}
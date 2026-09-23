"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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

export interface SearchableSelectOption {
  value: string;
  label: string;
  bnLabel?: string;
  subLabel?: string;
}

export interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SearchableSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  emptyText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  className,
  triggerClassName,
  emptyText = "No results found.",
}) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [width, setWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const selectedOption = React.useMemo(() => {
    return options.find(
      (opt) =>
        opt.value?.toLowerCase() === value?.toLowerCase() ||
        opt.label?.toLowerCase() === value?.toLowerCase()
    );
  }, [options, value]);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-10 px-3 justify-between font-medium text-xs rounded-xl border bg-card hover:bg-muted/50 text-foreground outline-none transition-all flex items-center gap-2 cursor-pointer",
              error
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary",
              open && "border-primary ring-1 ring-primary/20",
              disabled && "opacity-50 cursor-not-allowed bg-muted/40",
              triggerClassName
            )}
          >
            <span className="truncate">
              {selectedOption ? (
                <span className="font-bold text-foreground">
                  {selectedOption.label}
                  {selectedOption.bnLabel && ` (${selectedOption.bnLabel})`}
                  {selectedOption.subLabel && (
                    <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
                      {selectedOption.subLabel}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          style={{ width: width ? `${Math.max(width, 240)}px` : "240px" }}
          className="p-0 bg-popover border border-border text-popover-foreground shadow-2xl rounded-xl z-50 overflow-hidden"
          align="start"
        >
          <Command className="bg-popover text-popover-foreground">
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9 text-xs"
            />
            <CommandList className="max-h-60 overflow-y-auto p-1">
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                {emptyText}
              </CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected =
                    opt.value?.toLowerCase() === value?.toLowerCase() ||
                    opt.label?.toLowerCase() === value?.toLowerCase();

                  // Search keyword includes English name, Bengali name, subLabel
                  const searchKeyword = `${opt.label} ${opt.bnLabel || ""} ${opt.value} ${opt.subLabel || ""}`;

                  return (
                    <CommandItem
                      key={opt.value}
                      value={searchKeyword}
                      onSelect={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "text-xs cursor-pointer rounded-lg px-2.5 py-2 flex items-center justify-between transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className="flex flex-col min-w-0 truncate">
                        <span className="truncate font-semibold">
                          {opt.label}
                          {opt.bnLabel && ` (${opt.bnLabel})`}
                        </span>
                        {opt.subLabel && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {opt.subLabel}
                          </span>
                        )}
                      </div>

                      <Check
                        className={cn(
                          "ml-2 h-3.5 w-3.5 shrink-0 text-primary",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <span className="text-[10px] font-bold text-destructive">{error}</span>
      )}
    </div>
  );
};

export default SearchableSelect;

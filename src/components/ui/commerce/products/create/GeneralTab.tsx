import React from "react";
import { Sparkles, Info } from "lucide-react";

interface GeneralTabProps {
  name: string;
  setName: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  isSlugManuallyEdited: boolean;
  setIsSlugManuallyEdited: (val: boolean) => void;
  baseSku: string;
  setBaseSku: (val: string) => void;
  setActiveTab: (val: any) => void;
}

export default function GeneralTab({
  name,
  setName,
  slug,
  setSlug,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  isSlugManuallyEdited,
  setIsSlugManuallyEdited,
  baseSku,
  setBaseSku,
  setActiveTab,
}: GeneralTabProps) {
  const slugifyString = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      const slugValue = slugifyString(val);
      setSlug(slugValue);
      if (baseSku === "" || baseSku.startsWith(slugifyString(name))) {
        setBaseSku(slugValue.toUpperCase() + "-BASE");
      }
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-5 animate-fade-in">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={16} className="text-primary animate-pulse" />
        Product Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Product Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Leather Sneakers, Hooded Sweatshirt"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Slug URL Handle
            </label>
            <span className="text-[9px] text-muted-foreground font-bold">
              {isSlugManuallyEdited ? "Customized" : "Auto-Generated"}
            </span>
          </div>
          <input
            type="text"
            required
            placeholder="e.g. leather-sneakers"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Short Description (Required, min 10 chars)
          </label>
          <input
            type="text"
            required
            placeholder="A quick summary sentence about the product features..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Detailed Description (Optional)
          </label>
          <textarea
            rows={6}
            placeholder="Enter exhaustive details regarding materials, sizing, dimensions, fit details, etc..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground resize-none"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
        >
          Continue to Media
        </button>
      </div>
    </div>
  );
}

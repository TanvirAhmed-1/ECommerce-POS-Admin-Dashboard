import React from "react";
import { Globe } from "lucide-react";

interface SeoTabProps {
  seoMetaTitle: string;
  setSeoMetaTitle: (val: string) => void;
  seoMetaKeywords: string;
  setSeoMetaKeywords: (val: string) => void;
  seoMetaDescription: string;
  setSeoMetaDescription: (val: string) => void;
  setActiveTab: (val: any) => void;
}

export default function SeoTab({
  seoMetaTitle,
  setSeoMetaTitle,
  seoMetaKeywords,
  setSeoMetaKeywords,
  seoMetaDescription,
  setSeoMetaDescription,
  setActiveTab,
}: SeoTabProps) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-5 animate-fade-in">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Globe size={16} className="text-primary animate-pulse" />
        Search Engine Optimization & Social Sharing
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Meta Title (Max 70 chars)
          </label>
          <input
            type="text"
            maxLength={70}
            placeholder="Search engine title display..."
            value={seoMetaTitle}
            onChange={(e) => setSeoMetaTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Meta Keywords (Comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. sneakers, shoes, leather shoes, fashion"
            value={seoMetaKeywords}
            onChange={(e) => setSeoMetaKeywords(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Meta Description (Max 160 chars)
        </label>
        <textarea
          rows={3}
          maxLength={160}
          placeholder="Short summary display on search results..."
          value={seoMetaDescription}
          onChange={(e) => setSeoMetaDescription(e.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 resize-none"
        />
      </div>

      {/* Navigation Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className="h-9 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("variants")}
          className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
        >
          Continue to Specifications
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { Layers, Eye, EyeOff, ShoppingBag, Flame } from "lucide-react";

interface SectionStatsCardsProps {
  totalSections: number;
  activeSections: number;
  inactiveSections: number;
  totalProductsAssigned: number;
  activeFilter: string;
  onFilterSelect: (filter: "all" | "active" | "inactive") => void;
}

export default function SectionStatsCards({
  totalSections,
  activeSections,
  inactiveSections,
  totalProductsAssigned,
  activeFilter,
  onFilterSelect,
}: SectionStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Sections */}
      <div
        onClick={() => onFilterSelect("all")}
        className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
          activeFilter === "all"
            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
            : "border-border hover:border-primary/40"
        }`}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Sections
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-foreground">
              {totalSections}
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground">
              collections
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Homepage layout modules
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
          <Layers size={22} />
        </div>
      </div>

      {/* 2. Active on Storefront */}
      <div
        onClick={() => onFilterSelect("active")}
        className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
          activeFilter === "active"
            ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
            : "border-border hover:border-emerald-500/40"
        }`}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Published Active
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-emerald-500">
              {activeSections}
            </h3>
            <span className="text-[10px] font-bold text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Live Now
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Visible to customers
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
          <Eye size={22} />
        </div>
      </div>

      {/* 3. Inactive / Staged */}
      <div
        onClick={() => onFilterSelect("inactive")}
        className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
          activeFilter === "inactive"
            ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
            : "border-border hover:border-amber-500/40"
        }`}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Drafts & Hidden
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-amber-500">
              {inactiveSections}
            </h3>
            <span className="text-[10px] font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Staged
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Hidden from homepage
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0 group-hover:scale-110 transition-transform">
          <EyeOff size={22} />
        </div>
      </div>

      {/* 4. Products Featured */}
      <div className="glass-card p-4 rounded-2xl border border-border flex items-center justify-between group hover:border-primary/40 transition-all">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Featured Products
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-foreground">
              {totalProductsAssigned}
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground">
              items showcased
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
            <Flame size={12} />
            <span>Across all active rows</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
          <ShoppingBag size={22} />
        </div>
      </div>
    </div>
  );
}

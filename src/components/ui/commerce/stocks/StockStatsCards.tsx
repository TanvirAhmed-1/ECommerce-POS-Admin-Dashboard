import React from "react";
import {
  Boxes,
  PackageCheck,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface StockStatsCardsProps {
  totalVariants: number;
  totalUnits: number;
  totalValuation: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeFilter: string;
  onFilterSelect: (filter: "All" | "In" | "Low" | "Out") => void;
}

export default function StockStatsCards({
  totalVariants,
  totalUnits,
  totalValuation,
  inStockCount,
  lowStockCount,
  outOfStockCount,
  activeFilter,
  onFilterSelect,
}: StockStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Inventory Units */}
      <div className="glass-card p-4 rounded-2xl border border-border flex items-center justify-between relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Inventory Units
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-foreground">
              {totalUnits.toLocaleString()}
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground">
              across {totalVariants} variations
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
            <TrendingUp size={12} />
            <span>Valuation: ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
          <Boxes size={22} />
        </div>
      </div>

      {/* 2. In Stock */}
      <div
        onClick={() => onFilterSelect("In")}
        className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
          activeFilter === "In"
            ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
            : "border-border hover:border-emerald-500/40"
        }`}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            In Stock
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-emerald-500">
              {inStockCount.toLocaleString()}
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground">
              ({totalVariants > 0 ? Math.round((inStockCount / totalVariants) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Sufficient inventory level
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
          <PackageCheck size={22} />
        </div>
      </div>

      {/* 3. Low Stock Alert */}
      <div
        onClick={() => onFilterSelect("Low")}
        className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
          activeFilter === "Low"
            ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
            : "border-border hover:border-amber-500/40"
        }`}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Low Stock Alerts
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-amber-500">
              {lowStockCount.toLocaleString()}
            </h3>
            <span className="text-[10px] font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
              &lt; 10 units
            </span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Requires restock soon
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0 group-hover:scale-110 transition-transform">
          <AlertTriangle size={22} />
        </div>
      </div>

      {/* 4. Out of Stock */}
      <div
        onClick={() => onFilterSelect("Out")}
        className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
          activeFilter === "Out"
            ? "border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/20"
            : "border-border hover:border-rose-500/40"
        }`}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Out of Stock
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading text-rose-500">
              {outOfStockCount.toLocaleString()}
            </h3>
            <span className="text-[10px] font-bold text-rose-500/80 bg-rose-500/10 px-1.5 py-0.5 rounded animate-pulse">
              Critical (0)
            </span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Lost sales potential
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0 group-hover:scale-110 transition-transform">
          <XCircle size={22} />
        </div>
      </div>
    </div>
  );
}

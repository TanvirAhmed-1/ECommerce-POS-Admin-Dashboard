import React from "react";
import { DollarSign, Percent, Package as PackageIcon } from "lucide-react";

interface PricingTabProps {
  basePrice: number | "";
  setBasePrice: (val: number | "") => void;
  salePrice: number | "";
  setSalePrice: (val: number | "") => void;
  resellerPrice: number | "";
  setResellerPrice: (val: number | "") => void;
  discountType: "flat" | "percentage";
  setDiscountType: (val: "flat" | "percentage") => void;
  productDiscount: number | "";
  setProductDiscount: (val: number | "") => void;
  vat: number;
  setVat: (val: number) => void;
  baseStock: number | "";
  setBaseStock: (val: number | "") => void;
  baseSku: string;
  setBaseSku: (val: string) => void;
  setActiveTab: (val: any) => void;
}

export default function PricingTab({
  basePrice,
  setBasePrice,
  salePrice,
  setSalePrice,
  resellerPrice,
  setResellerPrice,
  discountType,
  setDiscountType,
  productDiscount,
  setProductDiscount,
  vat,
  setVat,
  baseStock,
  setBaseStock,
  baseSku,
  setBaseSku,
  setActiveTab,
}: PricingTabProps) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-5 animate-fade-in">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <DollarSign size={16} className="text-primary" />
        Pricing Matrix & Stock Management
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Base Price (৳ BDT) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
            <input
              type="number"
              required
              placeholder="e.g. 150"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Sale Price (৳ BDT) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
            <input
              type="number"
              required
              placeholder="e.g. 120"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Reseller Price (৳ BDT) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
            <input
              type="number"
              required
              placeholder="e.g. 95"
              value={resellerPrice}
              onChange={(e) => setResellerPrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Discount Selector and Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Discount Type
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "flat" | "percentage")}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 cursor-pointer"
          >
            <option value="flat">Flat Discount ($ USD)</option>
            <option value="percentage">Percentage Discount (%)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Product Discount Value
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 10"
            value={productDiscount}
            onChange={(e) => setProductDiscount(e.target.value !== "" ? Number(e.target.value) : "")}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Percent size={12} /> VAT / Tax Percentage (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 15"
            value={vat}
            onChange={(e) => setVat(Number(e.target.value) || 0)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <PackageIcon size={12} /> Total Stock Quantity
          </label>
          <input
            type="number"
            placeholder="e.g. 250"
            value={baseStock}
            onChange={(e) => setBaseStock(e.target.value !== "" ? Number(e.target.value) : "")}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Base SKU Code
          </label>
          <input
            type="text"
            placeholder="Auto-generated e.g. TSHIRT-BASE"
            value={baseSku}
            onChange={(e) => setBaseSku(e.target.value.toUpperCase())}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Navigation Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className="h-9 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
        >
          Continue to SEO
        </button>
      </div>
    </div>
  );
}

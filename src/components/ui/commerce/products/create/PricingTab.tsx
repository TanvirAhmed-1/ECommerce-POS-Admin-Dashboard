import {
  Percent,
  Package as PackageIcon,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Store,
  Calculator,
} from "lucide-react";
import { TbCurrencyTaka } from "react-icons/tb";

interface PricingTabProps {
  purchasePrice: number | "";
  setPurchasePrice: (val: number | "") => void;
  wholesalePrice: number | "";
  setWholesalePrice: (val: number | "") => void;
  salePrice: number | "";
  setSalePrice: (val: number | "") => void;
  basePrice: number | "";
  setBasePrice: (val: number | "") => void;
  vatType: "percentage" | "flat";
  setVatType: (val: "percentage" | "flat") => void;
  vat: number;
  setVat: (val: number) => void;
  baseStock: number | "";
  setBaseStock: (val: number | "") => void;
  baseSku: string;
  setBaseSku: (val: string) => void;
  setActiveTab: (val: any) => void;
}

export default function PricingTab({
  purchasePrice,
  setPurchasePrice,
  wholesalePrice,
  setWholesalePrice,
  salePrice,
  setSalePrice,
  basePrice,
  setBasePrice,
  vatType,
  setVatType,
  vat,
  setVat,
  baseStock,
  setBaseStock,
  baseSku,
  setBaseSku,
  setActiveTab,
}: PricingTabProps) {
  // Live Profit Calculations
  const numPurchase = typeof purchasePrice === "number" ? purchasePrice : 0;
  const numSale = typeof salePrice === "number" ? salePrice : 0;
  const numWholesale = typeof wholesalePrice === "number" ? wholesalePrice : 0;

  const retailProfit = numSale > 0 && numPurchase > 0 ? numSale - numPurchase : 0;
  const retailMargin = numPurchase > 0 && numSale > 0 ? ((retailProfit / numPurchase) * 100).toFixed(1) : 0;

  const wholesaleProfit = numWholesale > 0 && numPurchase > 0 ? numWholesale - numPurchase : 0;
  const wholesaleMargin = numPurchase > 0 && numWholesale > 0 ? ((wholesaleProfit / numPurchase) * 100).toFixed(1) : 0;

  // Real-time VAT amount calculation
  const vatAmount = vatType === "percentage" ? ((numSale * (vat || 0)) / 100).toFixed(2) : (vat || 0).toFixed(2);
  const totalWithVat = (numSale + parseFloat(vatAmount)).toFixed(2);

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <TbCurrencyTaka size={16} className="text-primary" />
          Pricing Matrix & Profit Management
        </h3>
        <span className="text-[10px] text-muted-foreground font-semibold px-2.5 py-1 rounded-full bg-muted/60">
          POS & E-Commerce Rates
        </span>
      </div>

      {/* Main 3-Tier Prices: Purchase Price, Wholesale Price, Sell Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Purchase Price (Cost) */}
        <div className="space-y-1.5 p-4 rounded-xl border border-border/80 bg-muted/10">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Wallet size={13} className="text-blue-500" />
            Purchase Price (Cost)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 500"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Manufacturer / supplier cost</p>
        </div>

        {/* 2. Wholesale Price (B2B / Reseller) */}
        <div className="space-y-1.5 p-4 rounded-xl border border-border/80 bg-muted/10">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Store size={13} className="text-amber-500" />
            Wholesale Price (Reseller)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 650"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>B2B / Dealer rate</span>
            {numWholesale > 0 && numPurchase > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                +{wholesaleMargin}% (৳{wholesaleProfit.toFixed(0)})
              </span>
            )}
          </div>
        </div>

        {/* 3. Sell Price (Retail Price) */}
        <div className="space-y-1.5 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <label className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag size={13} className="text-primary" />
            Sell Price (Retail) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">৳</span>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              placeholder="e.g. 850"
              value={salePrice}
              onChange={(e) => {
                const val = e.target.value !== "" ? Number(e.target.value) : "";
                setSalePrice(val);
                if (basePrice === "" || basePrice === 0) {
                  setBasePrice(val);
                }
              }}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-primary/40 bg-card text-xs font-bold text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Customer sell rate</span>
            {numSale > 0 && numPurchase > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp size={10} /> +{retailMargin}% (৳{retailProfit.toFixed(0)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: MRP / Base Price & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4">
        {/* MRP / Original Base Price */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Regular / MRP Price (৳ BDT)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 990 (List / Strike price)"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-[9px] text-muted-foreground">Shown with strikethrough if higher than Sell Price</p>
        </div>

        {/* Total Stock Quantity */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <PackageIcon size={12} /> Total Stock Quantity
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 150"
            value={baseStock}
            onChange={(e) => setBaseStock(e.target.value !== "" ? Number(e.target.value) : "")}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Base SKU Code */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Base SKU Code
          </label>
          <input
            type="text"
            placeholder="e.g. TSHIRT-BASE-01"
            value={baseSku}
            onChange={(e) => setBaseSku(e.target.value.toUpperCase())}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* VAT / Tax Configuration (percentage ba flat) */}
      <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Percent size={13} className="text-primary" />
            VAT / Tax Settings
          </label>
          {numSale > 0 && (
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Calculator size={11} className="text-primary" />
              Final with VAT: <strong className="text-foreground font-mono">৳{totalWithVat}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* VAT Type: Percentage or Flat */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              VAT Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVatType("percentage")}
                className={`h-10 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  vatType === "percentage"
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Percent size={12} />
                <span>Percentage (%)</span>
              </button>

              <button
                type="button"
                onClick={() => setVatType("flat")}
                className={`h-10 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  vatType === "flat"
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>৳</span>
                <span>Flat Amount (৳)</span>
              </button>
            </div>
          </div>

          {/* VAT Value Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              {vatType === "percentage" ? "VAT Rate (%)" : "Flat VAT Amount (৳ BDT)"}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder={vatType === "percentage" ? "e.g. 5 or 7.5 (%)" : "e.g. 50 (৳)"}
                value={vat}
                onChange={(e) => setVat(e.target.value !== "" ? Number(e.target.value) : 0)}
                className="w-full h-10 px-3 pr-12 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                {vatType === "percentage" ? "%" : "৳"}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Navigation Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className="h-9 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer"
        >
          ← Back to Media
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className="h-9 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer shadow-sm shadow-primary/20 transition-all flex items-center gap-1.5"
        >
          <span>Continue to SEO</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

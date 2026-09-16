"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Minus,
  Check,
  Package,
  Sparkles,
  Tag,
  Copy,
  CheckCheck,
  Grid,
  List,
  SlidersHorizontal,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AttributeItem {
  attribute?: {
    _id?: string;
    name?: string;
  } | string;
  value: string;
}

interface ProductVariant {
  _id: string;
  sku?: string;
  price?: number;
  stock?: number;
  costPrice?: number;
  salePrice?: number;
  images?: string[];
  attributes?: AttributeItem[];
  isActive?: boolean;
}

interface VariantConfigModalProps {
  isOpen: boolean;
  product: any | null;
  onClose: () => void;
  onAddToCart: (variant: ProductVariant, quantity: number) => void;
  initialVariant?: ProductVariant | null;
}

const COLOR_MAP: Record<string, string> = {
  black: "#18181b",
  white: "#ffffff",
  navy: "#0f172a",
  "navy blue": "#1e293b",
  blue: "#2563eb",
  "royal blue": "#1d4ed8",
  "sky blue": "#38bdf8",
  "light blue": "#7dd3fc",
  red: "#ef4444",
  crimson: "#dc2626",
  green: "#10b981",
  emerald: "#059669",
  yellow: "#eab308",
  amber: "#f59e0b",
  orange: "#f97316",
  purple: "#a855f7",
  violet: "#8b5cf6",
  pink: "#ec4899",
  rose: "#f43f5e",
  gray: "#6b7280",
  grey: "#6b7280",
  silver: "#cbd5e1",
  gold: "#eab308",
  brown: "#78350f",
  beige: "#d6c7a1",
  maroon: "#800000",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  olive: "#65a30d",
  charcoal: "#334155",
};

export default function VariantConfigModal({
  isOpen,
  product,
  onClose,
  onAddToCart,
  initialVariant,
}: VariantConfigModalProps) {
  // Modal state
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [viewMode, setViewMode] = useState<"selector" | "grid" | "list">("selector");
  const [copiedSku, setCopiedSku] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract all variants
  const variants: ProductVariant[] = useMemo(() => {
    if (!product?.productVariants || !Array.isArray(product.productVariants)) return [];
    return product.productVariants.filter((v: ProductVariant) => v.isActive !== false);
  }, [product]);

  // Extract unique attribute dimensions
  const attributeGroups = useMemo(() => {
    if (!variants.length) return [];
    const groups: Record<string, { name: string; values: string[] }> = {};

    variants.forEach((v) => {
      v.attributes?.forEach((a) => {
        const name =
          typeof a.attribute === "object" && a.attribute?.name
            ? a.attribute.name
            : typeof a.attribute === "string"
            ? a.attribute
            : "Option";
        
        if (!groups[name]) {
          groups[name] = { name, values: [] };
        }
        if (a.value && !groups[name].values.includes(a.value)) {
          groups[name].values.push(a.value);
        }
      });
    });

    return Object.values(groups);
  }, [variants]);

  // Initialize or reset selections when modal opens or product changes
  useEffect(() => {
    if (!isOpen || !product) {
      setActiveVariant(null);
      setSelectedOptions({});
      setQuantity(1);
      setSearchQuery("");
      setStockFilter("all");
      return;
    }

    // Determine initial variant: provided initial or first in-stock variant or first variant
    let chosen: ProductVariant | null = null;
    if (initialVariant) {
      chosen = variants.find((v) => v._id === initialVariant._id) || null;
    }
    if (!chosen && variants.length > 0) {
      chosen = variants.find((v) => (v.stock ?? 0) > 0) || variants[0];
    }

    setActiveVariant(chosen);
    setQuantity(1);
    setSearchQuery("");
    setStockFilter("all");

    // Populate selectedOptions from chosen variant
    if (chosen?.attributes && chosen.attributes.length > 0) {
      const opts: Record<string, string> = {};
      chosen.attributes.forEach((a) => {
        const name =
          typeof a.attribute === "object" && a.attribute?.name
            ? a.attribute.name
            : typeof a.attribute === "string"
            ? a.attribute
            : "Option";
        if (a.value) {
          opts[name] = a.value;
        }
      });
      setSelectedOptions(opts);
    } else if (attributeGroups.length > 0) {
      const opts: Record<string, string> = {};
      attributeGroups.forEach((g) => {
        if (g.values.length > 0) opts[g.name] = g.values[0];
      });
      setSelectedOptions(opts);
    }
  }, [isOpen, product, initialVariant, variants, attributeGroups]);

  // When selectedOptions change in selector mode, find matching variant
  const handleSelectOption = (attrName: string, value: string) => {
    const updatedOptions = { ...selectedOptions, [attrName]: value };
    setSelectedOptions(updatedOptions);

    // Find matching variant
    const matched = variants.find((v) => {
      if (!v.attributes || v.attributes.length === 0) return false;
      return v.attributes.every((a) => {
        const name =
          typeof a.attribute === "object" && a.attribute?.name
            ? a.attribute.name
            : typeof a.attribute === "string"
            ? a.attribute
            : "Option";
        return updatedOptions[name] === a.value;
      });
    });

    if (matched) {
      setActiveVariant(matched);
    } else {
      // Find variant that matches the maximum number of selected options
      const partialMatch = variants.find((v) => {
        return v.attributes?.some((a) => {
          const name =
            typeof a.attribute === "object" && a.attribute?.name
              ? a.attribute.name
              : typeof a.attribute === "string"
              ? a.attribute
              : "Option";
          return name === attrName && a.value === value;
        });
      });
      if (partialMatch) {
        setActiveVariant(partialMatch);
        const newOpts: Record<string, string> = {};
        partialMatch.attributes?.forEach((a) => {
          const name =
            typeof a.attribute === "object" && a.attribute?.name
              ? a.attribute.name
              : typeof a.attribute === "string"
              ? a.attribute
              : "Option";
          if (a.value) newOpts[name] = a.value;
        });
        setSelectedOptions(newOpts);
      }
    }
  };

  // Select variant directly from list/grid
  const handleDirectSelectVariant = (variant: ProductVariant) => {
    setActiveVariant(variant);
    if (variant.attributes) {
      const opts: Record<string, string> = {};
      variant.attributes.forEach((a) => {
        const name =
          typeof a.attribute === "object" && a.attribute?.name
            ? a.attribute.name
            : typeof a.attribute === "string"
            ? a.attribute
            : "Option";
        if (a.value) opts[name] = a.value;
      });
      setSelectedOptions(opts);
    }
  };

  // Filtered variants for Grid / List / Search views
  const filteredVariants = useMemo(() => {
    let list = variants;

    // Stock Filter
    if (stockFilter === "in_stock") {
      list = list.filter((v) => (v.stock ?? 0) > 0);
    } else if (stockFilter === "low_stock") {
      list = list.filter((v) => (v.stock ?? 0) > 0 && (v.stock ?? 0) < 5);
    } else if (stockFilter === "out_of_stock") {
      list = list.filter((v) => (v.stock ?? 0) <= 0);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => {
        const matchSku = v.sku?.toLowerCase().includes(q);
        const matchAttr = v.attributes?.some((a) =>
          a.value.toLowerCase().includes(q) ||
          (typeof a.attribute === "object" && a.attribute?.name?.toLowerCase().includes(q))
        );
        const matchPrice = v.price?.toString().includes(q);
        return matchSku || matchAttr || matchPrice;
      });
    }

    return list;
  }, [variants, stockFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = variants.length;
    const inStock = variants.filter((v) => (v.stock ?? 0) > 0).length;
    const lowStock = variants.filter((v) => (v.stock ?? 0) > 0 && (v.stock ?? 0) < 5).length;
    const outOfStock = variants.filter((v) => (v.stock ?? 0) <= 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [variants]);

  // Active Variant Price & Stock details
  const activePrice = activeVariant?.price ?? product?.salePrice ?? product?.basePrice ?? 0;
  const activeStock = activeVariant?.stock ?? 0;
  const isOutOfStock = activeStock <= 0;
  const isLowStock = activeStock > 0 && activeStock < 5;
  const totalPrice = activePrice * quantity;

  // Copy SKU helper
  const handleCopySku = (sku?: string) => {
    if (!sku) return;
    navigator.clipboard.writeText(sku);
    setCopiedSku(true);
    toast.success("SKU copied to clipboard", { duration: 1500 });
    setTimeout(() => setCopiedSku(false), 2000);
  };

  // Submit Add to Slip
  const handleAddToCart = () => {
    if (!activeVariant) {
      toast.error("Please select a variant combination!");
      return;
    }
    if (activeStock <= 0) {
      toast.error("This variant is currently out of stock!");
      return;
    }
    if (quantity > activeStock) {
      toast.error(`Only ${activeStock} units available in stock!`);
      return;
    }

    onAddToCart(activeVariant, quantity);
  };

  // Keyboard ergonomics: ESC to close, ENTER to submit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        handleAddToCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeVariant, quantity, activeStock]);

  if (!isOpen || !product) return null;

  // Variant helper for attribute pills
  const getVariantPills = (v: ProductVariant) => {
    if (!v.attributes || v.attributes.length === 0) {
      return [{ name: "SKU", value: v.sku || "Variation" }];
    }
    return v.attributes.map((a) => ({
      name:
        typeof a.attribute === "object" && a.attribute?.name
          ? a.attribute.name
          : typeof a.attribute === "string"
          ? a.attribute
          : "Spec",
      value: a.value,
    }));
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-card border border-border/80 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-foreground z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-3 bg-card/95 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail Preview */}
            <div className="relative w-12 h-12 rounded-xl bg-muted/60 border border-border overflow-hidden shrink-0 flex items-center justify-center shadow-inner group">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <Package size={22} className="text-muted-foreground" />
              )}
            </div>

            {/* Product Meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                  <Sparkles size={10} />
                  Configure Variant
                </span>
                {product.category?.name && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                    {product.category.name}
                  </span>
                )}
                <span className="text-[10px] font-bold text-muted-foreground">
                  {stats.total} Variations Available
                </span>
              </div>

              <h2 className="text-sm md:text-base font-extrabold text-foreground tracking-tight truncate mt-0.5">
                {product.name}
              </h2>
            </div>
          </div>

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-colors cursor-pointer shrink-0 border border-transparent hover:border-border"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* CONTROLS BAR: SEARCH, TABS & VIEW SWITCHER                */}
        {/* ========================================================= */}
        <div className="px-5 py-3 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by SKU, Size, Color, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-background/80 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1 bg-background/60 p-0.5 rounded-xl border border-border/60 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setStockFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                stockFilter === "all"
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("in_stock")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                stockFilter === "in_stock"
                  ? "bg-emerald-500 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Stock ({stats.inStock})
            </button>
            {stats.outOfStock > 0 && (
              <button
                type="button"
                onClick={() => setStockFilter("out_of_stock")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  stockFilter === "out_of_stock"
                    ? "bg-rose-500 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Out ({stats.outOfStock})
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-background/60 p-0.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode("selector")}
              title="Interactive Attribute Selector"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "selector"
                  ? "bg-primary/20 text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid Cards View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary/20 text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Compact List Table"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary/20 text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT (SCROLLABLE)                            */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          
          {/* MODE 1: INTERACTIVE ATTRIBUTE SELECTOR (GUIDED CHIPS) */}
          {viewMode === "selector" && !searchQuery && (
            <div className="space-y-4">
              {attributeGroups.length > 0 ? (
                attributeGroups.map((group) => {
                  const selectedVal = selectedOptions[group.name];
                  const isColorGroup =
                    group.name.toLowerCase().includes("color") ||
                    group.name.toLowerCase() === "shade";

                  return (
                    <div
                      key={group.name}
                      className="p-3.5 rounded-2xl bg-muted/20 border border-border/70 space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-primary" />
                          <span className="text-xs font-black uppercase tracking-wider text-foreground">
                            {group.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono font-bold px-1.5 py-0.2 rounded bg-muted">
                            {group.values.length} options
                          </span>
                        </div>

                        {selectedVal && (
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            Selected: <strong className="text-foreground">{selectedVal}</strong>
                          </span>
                        )}
                      </div>

                      {/* Attribute Values Pills / Chips */}
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((val) => {
                          const isSelected = selectedVal === val;
                          const colorHex = isColorGroup
                            ? COLOR_MAP[val.toLowerCase().trim()] || null
                            : null;

                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSelectOption(group.name, val)}
                              className={`group/btn relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                                  : "bg-background/90 text-foreground border-border/80 hover:border-primary/50 hover:bg-muted/50"
                              }`}
                            >
                              {/* Color swatch dot if detected */}
                              {isColorGroup && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-xs"
                                  style={{
                                    backgroundColor: colorHex || "#888888",
                                  }}
                                />
                              )}

                              <span>{val}</span>

                              {isSelected && <Check size={13} className="stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl border border-border text-center text-xs text-muted-foreground">
                  No structured attribute groups found. Please browse variations directly below.
                </div>
              )}
            </div>
          )}

          {/* MODE 2 & SEARCH RESULTS: GRID OF VARIATION CARDS */}
          {(viewMode === "grid" || searchQuery || (viewMode === "selector" && attributeGroups.length === 0)) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span>Matching Variations ({filteredVariants.length}):</span>
                <span className="text-[10px]">Click a card to select</span>
              </div>

              {filteredVariants.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-2 bg-muted/10">
                  <AlertCircle size={28} className="mx-auto text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground">No variations match your filter</p>
                  <p className="text-[11px] text-muted-foreground">
                    Try clearing your search keyword or switching stock filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredVariants.map((variant) => {
                    const isSelected = activeVariant?._id === variant._id;
                    const stock = variant.stock ?? 0;
                    const isVOut = stock <= 0;
                    const pills = getVariantPills(variant);

                    return (
                      <div
                        key={variant._id}
                        onClick={() => handleDirectSelectVariant(variant)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                          isSelected
                            ? "border-primary bg-primary/15 shadow-md shadow-primary/10 ring-1 ring-primary"
                            : isVOut
                            ? "border-border/50 bg-muted/15 opacity-60 hover:opacity-80"
                            : "border-border/80 bg-background/80 hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {/* Attribute Pills */}
                          <div className="flex flex-wrap gap-1 pr-6">
                            {pills.map((pill, idx) => (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black border ${
                                  isSelected
                                    ? "bg-primary/20 border-primary/30 text-foreground"
                                    : "bg-muted/80 border-border/60 text-foreground"
                                }`}
                              >
                                {pill.name}: {pill.value}
                              </span>
                            ))}
                          </div>

                          {/* SKU */}
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {variant.sku || "VAR-SKU"}
                          </div>
                        </div>

                        {/* Price & Stock Footer */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
                          <span className="font-mono font-black text-xs text-foreground">
                            ৳{(variant.price || product.salePrice || product.basePrice || 0).toLocaleString()}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold flex items-center gap-1 ${
                              isVOut
                                ? "text-rose-500"
                                : stock < 5
                                ? "text-amber-500"
                                : "text-emerald-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isVOut ? "bg-rose-500" : stock < 5 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            />
                            {isVOut ? "Out of Stock" : `Stock: ${stock}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MODE 3: COMPACT LIST TABLE */}
          {viewMode === "list" && !searchQuery && (
            <div className="space-y-2">
              <div className="border border-border/80 rounded-2xl overflow-hidden bg-background/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[10px] font-black uppercase text-muted-foreground border-b border-border/70">
                    <tr>
                      <th className="py-2.5 px-3">Variation / Specs</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Stock</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredVariants.map((variant) => {
                      const isSelected = activeVariant?._id === variant._id;
                      const stock = variant.stock ?? 0;
                      const isVOut = stock <= 0;
                      const pills = getVariantPills(variant);

                      return (
                        <tr
                          key={variant._id}
                          onClick={() => handleDirectSelectVariant(variant)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/15 font-bold"
                              : isVOut
                              ? "opacity-50 hover:bg-muted/30"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {pills.map((pill, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.2 rounded text-[10px] bg-muted font-bold text-foreground"
                                >
                                  {pill.value}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                            {variant.sku || "VAR-SKU"}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-right text-foreground">
                            ৳{(variant.price || product.salePrice || product.basePrice || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`text-[10px] font-bold ${
                                isVOut ? "text-rose-500" : stock < 5 ? "text-amber-500" : "text-emerald-500"
                              }`}
                            >
                              {isVOut ? "0 (Out)" : stock}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectSelectVariant(variant);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-muted hover:bg-primary/20 text-foreground"
                              }`}
                            >
                              {isSelected ? "Active" : "Select"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ACTIVE SELECTED VARIANT HERO SUMMARY                      */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-card to-muted/40 border-2 border-primary/40 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                  Selected Variation Configuration
                </span>
                
                {/* Active Attributes Badges */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {activeVariant ? (
                    getVariantPills(activeVariant).map((pill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-xs font-black bg-primary/15 text-primary border border-primary/30"
                      >
                        {pill.name}: {pill.value}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No variation resolved</span>
                  )}
                </div>

                {/* SKU with Copy action */}
                {activeVariant?.sku && (
                  <button
                    type="button"
                    onClick={() => handleCopySku(activeVariant.sku)}
                    className="flex items-center gap-1 mt-2 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                    title="Click to copy SKU"
                  >
                    <span>SKU: {activeVariant.sku}</span>
                    {copiedSku ? (
                      <CheckCheck size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} className="opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                )}
              </div>

              {/* Price & Stock status */}
              <div className="text-right">
                <div className="text-xl md:text-2xl font-black font-mono text-foreground">
                  ৳{activePrice.toLocaleString()}
                </div>

                <div className="mt-1">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Low Stock ({activeStock} left)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {activeStock} Units Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER: QUANTITY STEPPER & ACTION BUTTONS          */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-t border-border/80 bg-card/95 flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* Quantity Controls & Quick Presets */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-muted-foreground">Qty:</span>
              <div className="flex items-center border border-border rounded-xl bg-background shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={activeStock || 999}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(activeStock || 999, val)));
                  }}
                  className="w-12 text-center text-xs font-black font-mono bg-transparent border-none focus:outline-none text-foreground py-1"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(activeStock || 999, q + 1))}
                  disabled={!activeStock || quantity >= activeStock}
                  className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Fast Quantity Increment Chips */}
            <div className="hidden sm:flex items-center gap-1">
              {[1, 2, 5, 10].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setQuantity(inc)}
                  disabled={!activeStock || inc > activeStock}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                    quantity === inc
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-muted/60 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  } disabled:opacity-40`}
                >
                  +{inc}
                </button>
              ))}
              {activeStock > 0 && (
                <button
                  type="button"
                  onClick={() => setQuantity(activeStock)}
                  className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-muted/60 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Select all available stock"
                >
                  Max ({activeStock})
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!activeVariant || isOutOfStock}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] border border-white/10"
            >
              <ShoppingBag size={15} />
              <span>Add to Slip</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-white text-[11px] font-mono">
                ৳{totalPrice.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Keyboard hint badge bar */}
        <div className="px-5 py-1.5 bg-muted/40 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[9px]">ESC</kbd> Close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[9px]">ENTER ↵</kbd> Add to Slip
            </span>
          </div>
          <span className="text-[9px] opacity-75">POS High Speed Checkout</span>
        </div>
      </div>
    </div>
  );
}

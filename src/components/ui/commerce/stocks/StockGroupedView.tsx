import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Sliders,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface StockGroupedViewProps {
  groupedProducts: {
    productId: string;
    productName: string;
    productSlug?: string;
    productImage: string;
    productCategory: string;
    productBrand?: string;
    totalStock: number;
    parentProduct: any;
    variants: any[];
  }[];
  onOpenAdjustModal: (variantItem: any) => void;
  onQuickDelta: (variantItem: any, delta: number) => void;
  editingId: string | null;
  editSku: string;
  setEditSku: (v: string) => void;
  editPrice: number | "";
  setEditPrice: (v: number | "") => void;
  editStock: number | "";
  setEditStock: (v: number | "") => void;
  handleEditClick: (variantItem: any) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (variantItem: any) => void;
  isUpdating: boolean;
}

export default function StockGroupedView({
  groupedProducts,
  onOpenAdjustModal,
  onQuickDelta,
  editingId,
  editSku,
  setEditSku,
  editPrice,
  setEditPrice,
  editStock,
  setEditStock,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
  isUpdating,
}: StockGroupedViewProps) {
  // Expanded state map for products (default closed / collapsed)
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (prodId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [prodId]: !prev[prodId],
    }));
  };

  const collapseAll = () => {
    setExpandedMap({});
  };

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    groupedProducts.forEach((p) => {
      map[p.productId] = true;
    });
    setExpandedMap(map);
  };

  if (groupedProducts.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-border">
        <Package className="mx-auto text-muted-foreground mb-3 opacity-40" size={42} />
        <h3 className="text-base font-bold text-foreground">No Products Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Try adjusting your search query or stock filter tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-muted-foreground">
          Showing {groupedProducts.length} Products with Variation Stock Trees
        </span>
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg cursor-pointer transition-all flex items-center gap-1"
          >
            <ChevronDown size={13} />
            <span>Expand All</span>
          </button>
          <span className="text-muted-foreground/40 text-xs">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-all flex items-center gap-1"
          >
            <ChevronRight size={13} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {groupedProducts.map((group) => {
          const isExpanded = Boolean(expandedMap[group.productId]);
          const outOfStockVariants = group.variants.filter((v) => v.stock === 0).length;
          const lowStockVariants = group.variants.filter((v) => v.stock > 0 && v.stock < 10).length;

          return (
            <div
              key={group.productId}
              className="glass-card rounded-2xl border border-border overflow-hidden transition-all hover:border-border/80"
            >
              {/* Product Header / Summary Bar */}
              <div
                onClick={() => toggleExpand(group.productId)}
                className="p-4 bg-card/60 hover:bg-muted/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center shrink-0 border border-border overflow-hidden">
                    {group.productImage ? (
                      <img
                        src={group.productImage}
                        alt={group.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                        }}
                      />
                    ) : (
                      <Package size={22} />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm font-heading text-foreground truncate">
                        {group.productName}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0 bg-muted/60 text-foreground font-semibold border-border"
                      >
                        {group.productCategory}
                      </Badge>
                      {group.productBrand && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Brand: {group.productBrand}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {group.variants.length} variation{group.variants.length !== 1 ? "s" : ""}
                      {outOfStockVariants > 0 && (
                        <span className="text-rose-500 font-bold ml-2">
                          • {outOfStockVariants} Out of Stock
                        </span>
                      )}
                      {lowStockVariants > 0 && (
                        <span className="text-amber-500 font-bold ml-2">
                          • {lowStockVariants} Low Stock
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right Product Stock Metrics & Actions */}
                <div
                  className="flex items-center gap-4 self-end md:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      Total Product Stock
                    </p>
                    <p
                      className={`text-base font-black font-heading ${
                        group.totalStock === 0
                          ? "text-rose-500"
                          : group.totalStock < 10
                          ? "text-amber-500"
                          : "text-foreground"
                      }`}
                    >
                      {group.totalStock.toLocaleString()} units
                    </p>
                  </div>

                  <Link
                    href={`/products/create?edit=${group.productId}`}
                    className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit Product & Attributes Wizard"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>

              {/* Nested Variants Table */}
              {isExpanded && (
                <div className="border-t border-border overflow-x-auto custom-scrollbar bg-background/50">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                        <th className="p-3 pl-12">Variation Option</th>
                        <th className="p-3">SKU Code</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock Level</th>
                        <th className="p-3">Quick Step</th>
                        <th className="p-3 text-right pr-6">Stock Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {group.variants.map((variant) => {
                        const isEditing = editingId === variant.variantId;
                        const attrEntries = Object.entries(variant.attributes || {});

                        // Stock badges
                        let stockBadge = (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border-none w-max"
                          >
                            <CheckCircle2 size={12} /> {variant.stock} in stock
                          </Badge>
                        );
                        if (variant.stock === 0) {
                          stockBadge = (
                            <Badge
                              variant="destructive"
                              className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border-none w-max animate-pulse"
                            >
                              <XCircle size={12} /> Out of stock (0)
                            </Badge>
                          );
                        } else if (variant.stock < 10) {
                          stockBadge = (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border-none w-max"
                            >
                              <AlertTriangle size={12} /> Low stock ({variant.stock})
                            </Badge>
                          );
                        }

                        return (
                          <tr
                            key={variant.variantId}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            {/* Variant Name & Attributes */}
                            <td className="p-3 pl-12">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 border border-border overflow-hidden">
                                  {variant.productImage ? (
                                    <img
                                      src={variant.productImage}
                                      alt={variant.variantName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as any).src =
                                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                                      }}
                                    />
                                  ) : (
                                    <Package size={14} className="text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-foreground text-xs block">
                                    {variant.variantName}
                                  </span>
                                  {attrEntries.length > 0 && (
                                    <div className="flex gap-1 mt-0.5">
                                      {attrEntries.map(([k, v]) => (
                                        <span
                                          key={k}
                                          className="text-[8px] bg-muted/80 text-muted-foreground px-1 py-0.2 rounded border border-border"
                                        >
                                          {k}: {String(v)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editSku}
                                  onChange={(e) => setEditSku(e.target.value.toUpperCase())}
                                  className="h-7 px-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-primary w-32"
                                />
                              ) : (
                                <span className="font-mono text-foreground text-[11px] font-semibold bg-muted/40 px-2 py-0.5 rounded border border-border">
                                  {variant.sku || "N/A"}
                                </span>
                              )}
                            </td>

                            {/* Price */}
                            <td className="p-3 font-bold text-foreground">
                              {isEditing ? (
                                <div className="relative w-24">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    ৳
                                  </span>
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) =>
                                      setEditPrice(
                                        e.target.value !== "" ? Number(e.target.value) : ""
                                      )
                                    }
                                    className="h-7 pl-5 pr-1 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-primary w-full"
                                  />
                                </div>
                              ) : (
                                <span>৳{Number(variant.price).toFixed(2)}</span>
                              )}
                            </td>

                            {/* Stock Status */}
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editStock}
                                  onChange={(e) =>
                                    setEditStock(
                                      e.target.value !== "" ? Number(e.target.value) : ""
                                    )
                                  }
                                  className="h-7 px-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-primary w-20"
                                />
                              ) : (
                                stockBadge
                              )}
                            </td>

                            {/* Quick Step +/- */}
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isUpdating || variant.stock <= 0}
                                  onClick={() => onQuickDelta(variant, -1)}
                                  className="w-6 h-6 rounded bg-muted/60 hover:bg-rose-500/20 hover:text-rose-500 text-muted-foreground flex items-center justify-center border border-border cursor-pointer transition-colors disabled:opacity-40"
                                  title="Deduct 1 unit"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-black w-8 text-center text-foreground">
                                  {variant.stock}
                                </span>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => onQuickDelta(variant, 1)}
                                  className="w-6 h-6 rounded bg-muted/60 hover:bg-emerald-500/20 hover:text-emerald-500 text-muted-foreground flex items-center justify-center border border-border cursor-pointer transition-colors disabled:opacity-40"
                                  title="Add 1 unit"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right pr-6">
                              {isEditing ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSaveEdit(variant)}
                                    disabled={isUpdating}
                                    className="px-2.5 py-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    {isUpdating ? (
                                      <Spinner className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Save size={12} />
                                    )}
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="px-2 py-1 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => onOpenAdjustModal(variant)}
                                    className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg border border-primary/20 cursor-pointer transition-colors"
                                  >
                                    Adjust Stock
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(variant)}
                                    className="px-2 py-1 bg-muted/60 hover:bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer transition-colors"
                                  >
                                    Edit Values
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

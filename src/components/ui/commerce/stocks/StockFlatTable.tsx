import React from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Plus,
  Minus,
  ExternalLink,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StockFlatTableProps {
  filteredVariants: any[];
  editingId: string | null;
  editSku: string;
  setEditSku: (val: string) => void;
  editStock: number | "";
  setEditStock: (val: number | "") => void;
  editPrice: number | "";
  setEditPrice: (val: number | "") => void;
  handleSaveEdit: (item: any) => void;
  handleCancelEdit: () => void;
  handleEditClick: (item: any) => void;
  onOpenAdjustModal: (item: any) => void;
  onQuickDelta: (item: any, delta: number) => void;
  isUpdating: boolean;
}

export default function StockFlatTable({
  filteredVariants,
  editingId,
  editSku,
  setEditSku,
  editStock,
  setEditStock,
  editPrice,
  setEditPrice,
  handleSaveEdit,
  handleCancelEdit,
  handleEditClick,
  onOpenAdjustModal,
  onQuickDelta,
  isUpdating,
}: StockFlatTableProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="w-full text-left text-xs whitespace-nowrap">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30 text-muted-foreground font-bold hover:bg-transparent">
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">
                Product Option & Details
              </TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">
                SKU Code
              </TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">
                Category & Brand
              </TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">
                Unit Price
              </TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">
                Current Stock
              </TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">
                Quick Adjust (+/-)
              </TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {filteredVariants.length > 0 ? (
              filteredVariants.map((item) => {
                const isEditing = editingId === item.variantId;
                const attributeKeys = Object.keys(item.attributes || {});

                // Stock indicators
                let stockBadge = (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border-none w-max"
                  >
                    <CheckCircle2 size={12} /> {item.stock} in stock
                  </Badge>
                );
                if (item.stock === 0) {
                  stockBadge = (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border-none w-max animate-pulse"
                    >
                      <XCircle size={12} /> Out of stock
                    </Badge>
                  );
                } else if (item.stock < 10) {
                  stockBadge = (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border-none w-max"
                    >
                      <AlertTriangle size={12} /> Low stock ({item.stock})
                    </Badge>
                  );
                }

                return (
                  <TableRow
                    key={item.variantId}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Product & Variation Info */}
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center shrink-0 border border-border overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src =
                                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                              }}
                            />
                          ) : (
                            <Package size={18} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 max-w-xs md:max-w-sm">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider truncate">
                            {item.productName}
                          </span>
                          <span className="font-bold text-foreground text-xs mt-0.5 truncate">
                            {item.variantName}
                          </span>

                          {/* Attributes listing */}
                          {attributeKeys.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {attributeKeys.map((k) => (
                                <span
                                  key={k}
                                  className="text-[8px] bg-muted dark:bg-zinc-800 text-muted-foreground px-1.5 py-0.5 rounded border border-border"
                                >
                                  {k}: {String(item.attributes[k])}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSku}
                          onChange={(e) => setEditSku(e.target.value.toUpperCase())}
                          className="h-8 px-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-primary w-32"
                        />
                      ) : (
                        <span className="font-mono text-foreground font-semibold bg-muted/40 dark:bg-zinc-900 px-2 py-0.5 rounded border border-border text-[11px]">
                          {item.sku || "N/A"}
                        </span>
                      )}
                    </TableCell>

                    {/* Category & Brand */}
                    <TableCell className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 rounded border border-border bg-muted/50 text-[10px] font-bold text-foreground w-max"
                        >
                          {item.productCategory}
                        </Badge>
                        {item.productBrand && (
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {item.productBrand}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Unit Price */}
                    <TableCell className="p-4 font-bold text-foreground">
                      {isEditing ? (
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) =>
                              setEditPrice(
                                e.target.value !== "" ? Number(e.target.value) : ""
                              )
                            }
                            className="h-8 pl-5 pr-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-primary w-full"
                          />
                        </div>
                      ) : (
                        <span>${Number(item.price).toFixed(2)}</span>
                      )}
                    </TableCell>

                    {/* Current Stock */}
                    <TableCell className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) =>
                            setEditStock(
                              e.target.value !== "" ? Number(e.target.value) : ""
                            )
                          }
                          className="h-8 px-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-primary w-20"
                        />
                      ) : (
                        stockBadge
                      )}
                    </TableCell>

                    {/* Quick Step +/- */}
                    <TableCell className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isUpdating || item.stock <= 0}
                          onClick={() => onQuickDelta(item, -1)}
                          className="w-6 h-6 rounded bg-muted/60 hover:bg-rose-500/20 hover:text-rose-500 text-muted-foreground flex items-center justify-center border border-border cursor-pointer transition-colors disabled:opacity-40"
                          title="Deduct 1 unit"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black w-8 text-center text-foreground">
                          {item.stock}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => onQuickDelta(item, 1)}
                          className="w-6 h-6 rounded bg-muted/60 hover:bg-emerald-500/20 hover:text-emerald-500 text-muted-foreground flex items-center justify-center border border-border cursor-pointer transition-colors disabled:opacity-40"
                          title="Add 1 unit"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-4 text-right pr-6">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(item)}
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
                            onClick={() => onOpenAdjustModal(item)}
                            className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg border border-primary/20 cursor-pointer transition-colors"
                          >
                            Adjust Stock
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="px-2 py-1 bg-muted/60 hover:bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/products/create?edit=${item.productId}`}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded border border-border transition-colors"
                            title="Open Product Wizard"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  No variations found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

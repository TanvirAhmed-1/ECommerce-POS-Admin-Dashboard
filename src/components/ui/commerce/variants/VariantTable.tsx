import React from "react";
import { Package, CheckCircle2, XCircle, AlertTriangle, Save } from "lucide-react";
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

interface VariantTableProps {
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
  isUpdating: boolean;
}

export default function VariantTable({
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
  isUpdating,
}: VariantTableProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="w-full text-left text-xs whitespace-nowrap">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30 text-muted-foreground font-bold hover:bg-transparent">
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Product Option & Details</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">SKU Code</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Parent Category</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Stock Level</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Custom Price</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {filteredVariants.length > 0 ? (
              filteredVariants.map((item) => {
                const isEditing = editingId === item.variantId;
                const attributeKeys = Object.keys(item.attributes);

                // Stock indicators
                let stockBadge = (
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border-none w-max hover:bg-emerald-500/15">
                    <CheckCircle2 size={12} /> {item.stock} in stock
                  </Badge>
                );
                if (item.stock === 0) {
                  stockBadge = (
                    <Badge variant="destructive" className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border-none w-max animate-pulse hover:bg-rose-500/15">
                      <XCircle size={12} /> Out of stock
                    </Badge>
                  );
                } else if (item.stock < 10) {
                  stockBadge = (
                    <Badge variant="outline" className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border-none w-max hover:bg-amber-500/15">
                      <AlertTriangle size={12} /> Low stock ({item.stock})
                    </Badge>
                  );
                }

                return (
                  <TableRow key={item.variantId} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center shrink-0 border border-border overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                              }}
                            />
                          ) : (
                            <Package size={18} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 max-w-xs md:max-w-sm">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                            {item.productName}
                          </span>
                          <span className="font-bold text-foreground text-xs mt-0.5">
                            {item.variantName}
                          </span>
                          
                          {/* Attributes listing */}
                          {attributeKeys.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {attributeKeys.map((k) => (
                                <span
                                  key={k}
                                  className="text-[8px] bg-muted dark:bg-zinc-800 text-muted-foreground px-1.5 py-0.5 rounded border border-border"
                                >
                                  {k}: {item.attributes[k]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSku}
                          onChange={(e) => setEditSku(e.target.value.toUpperCase())}
                          className="h-8 px-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-700 w-36"
                        />
                      ) : (
                        <span className="font-mono text-foreground font-semibold bg-muted/40 dark:bg-zinc-900 px-2 py-0.5 rounded border border-border">
                          {item.sku || "N/A"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge variant="outline" className="px-2 py-0.5 rounded border border-border bg-muted/50 text-[10px] font-extrabold text-foreground">
                        {item.productCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value !== "" ? Number(e.target.value) : "")}
                          className="h-8 px-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-700 w-24"
                        />
                      ) : (
                        stockBadge
                      )}
                    </TableCell>
                    <TableCell className="p-4 font-bold text-foreground">
                      {isEditing ? (
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                            className="h-8 pl-5 pr-2 rounded-md border border-border bg-card text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-700 w-full"
                          />
                        </div>
                      ) : (
                        <span>${Number(item.price).toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(item)}
                            disabled={isUpdating}
                            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer transition-colors"
                            title="Save changes"
                          >
                            {isUpdating ? (
                              <Spinner className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="p-1 hover:bg-rose-500/10 rounded cursor-pointer transition-colors text-rose-500 hover:text-rose-700"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(item)}
                          className="px-2.5 py-1 bg-muted/60 hover:bg-muted text-[10px] font-bold text-foreground rounded-lg border border-border cursor-pointer transition-colors"
                        >
                          Adjust Stock
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                  No variants found matching criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

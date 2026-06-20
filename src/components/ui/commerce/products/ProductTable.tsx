import React from "react";
import Link from "next/link";
import { Package, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  displayProducts: any[];
  handleToggleBadge: (prod: any, field: string) => void;
  handleDeleteClick: (id: string, name: string, e: React.MouseEvent) => void;
  activeSections?: any[];
  handleToggleProductSection?: (prod: any, section: any) => void;
}

export default function ProductTable({
  displayProducts,
  handleToggleBadge,
  handleDeleteClick,
  activeSections = [],
  handleToggleProductSection,
}: ProductTableProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="w-full text-left text-xs whitespace-nowrap">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30 text-muted-foreground font-bold hover:bg-transparent">
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Product Info</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Category</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Brand</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Badges</TableHead>
              {activeSections.map((section: any) => (
                <TableHead key={section._id} className="p-4 font-bold uppercase text-[10px] tracking-wider text-center">
                  {section.title}
                </TableHead>
              ))}
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider">Stock</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider text-right">Price</TableHead>
              <TableHead className="p-4 font-bold uppercase text-[10px] tracking-wider text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {displayProducts.length > 0 ? (
              displayProducts.map((prod: any) => {
                const priceValue = typeof prod.salePrice === "number"
                  ? `৳${prod.salePrice.toFixed(2)}`
                  : (typeof prod.basePrice === "number"
                      ? `৳${prod.basePrice.toFixed(2)}`
                      : (typeof prod.price === "number" ? `৳${prod.price.toFixed(2)}` : "—"));
                const catName = typeof prod.category === "string" ? prod.category : prod.category?.name || "Uncategorized";
                const brandName = typeof prod.brand === "string" ? prod.brand : prod.brand?.name || "Generic";
                const pImageUrl = prod.thumbnail || (prod.images && prod.images[0]) || "";
                const displayStock = prod.totalStock !== undefined ? prod.totalStock : (prod.stock !== undefined ? prod.stock : 0);
                const displayStatus = prod.visibility
                  ? (prod.visibility === "published" ? "Active" : prod.visibility === "hidden" ? "Draft" : "Out of Stock")
                  : (prod.isActive !== false ? "Active" : "Inactive");

                return (
                  <TableRow key={prod._id || prod.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="p-4">
                      <Link href={`/products/${prod.slug}`} className="flex items-center gap-3 group/link">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center shrink-0 border border-border overflow-hidden group-hover/link:border-primary transition-all">
                          {pImageUrl ? (
                            <img
                              src={pImageUrl}
                              alt={prod.name}
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
                          <span className="font-semibold text-foreground truncate group-hover/link:text-primary transition-all">{prod.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                            {prod.description || "No description provided."}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge variant="outline" className="px-2 py-0.5 rounded border border-border bg-muted/50 text-[10px] font-extrabold text-foreground">
                        {catName}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground font-semibold">
                      {brandName}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge
                        variant={displayStatus === "Active" ? "default" : "destructive"}
                        className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                          displayStatus === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border-none hover:bg-emerald-500/15"
                            : displayStatus === "Draft"
                            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-none hover:bg-amber-500/15"
                            : "bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400 border-none hover:bg-rose-500/15"
                        }`}
                      >
                        {displayStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {/* Featured */}
                        <button
                          onClick={() => handleToggleBadge(prod, "isFeatured")}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all border ${
                            prod.isFeatured
                              ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                          title="Toggle Featured status"
                        >
                          Featured
                        </button>

                        {/* Trending */}
                        <button
                          onClick={() => handleToggleBadge(prod, "isTrending")}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all border ${
                            prod.isTrending
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                          title="Toggle Trending status"
                        >
                          Trending
                        </button>

                        {/* Best Seller */}
                        <button
                          onClick={() => handleToggleBadge(prod, "isBestSeller")}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all border ${
                            prod.isBestSeller
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                          title="Toggle Best Seller status"
                        >
                          Best Seller
                        </button>

                        {/* New Arrival */}
                        <button
                          onClick={() => handleToggleBadge(prod, "isNewArrival")}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all border ${
                            prod.isNewArrival
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                          title="Toggle New Arrival status"
                        >
                          New Arrival
                        </button>
                      </div>
                    </TableCell>
                    {activeSections.map((section: any) => {
                      const isAssigned = (section.products || []).some(
                        (p: any) => p._id === prod._id || p._id === prod.id || p.id === prod._id
                      );
                      return (
                        <TableCell key={section._id} className="p-4 text-center">
                          <button
                            onClick={() => handleToggleProductSection?.(prod, section)}
                            className={`px-2.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all border ${
                              isAssigned
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-transparent border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            }`}
                            title={`Toggle ${prod.name} in ${section.title}`}
                          >
                            {isAssigned ? "Assigned" : "Assign"}
                          </button>
                        </TableCell>
                      );
                    })}
                    <TableCell className="p-4 text-muted-foreground font-semibold">
                      {displayStock}
                    </TableCell>
                    <TableCell className="p-4 text-right font-bold text-foreground">
                      {priceValue}
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/products/create?edit=${prod._id || prod.id}`}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={(e) => handleDeleteClick(prod._id || prod.id, prod.name, e)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8 + activeSections.length} className="p-8 text-center text-muted-foreground">
                  No products found matching the filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

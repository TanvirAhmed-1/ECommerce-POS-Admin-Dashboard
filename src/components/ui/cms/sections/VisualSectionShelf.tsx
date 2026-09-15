import React from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VisualSectionShelfProps {
  section: any;
  index: number;
  totalSections: number;
  onOpenAddProducts: (section: any) => void;
  onEditSection: (section: any) => void;
  onDeleteSection: (id: string, title: string) => void;
  onToggleStatus: (section: any) => void;
  onMoveSectionOrder: (section: any, direction: "up" | "down") => void;
  onRemoveProductFromSection: (section: any, productId: string) => void;
  onReorderProductInShelf: (section: any, prodIndex: number, direction: "left" | "right") => void;
  onOpenPreview: (section: any) => void;
  isUpdating: boolean;
}

export default function VisualSectionShelf({
  section,
  index,
  totalSections,
  onOpenAddProducts,
  onEditSection,
  onDeleteSection,
  onToggleStatus,
  onMoveSectionOrder,
  onRemoveProductFromSection,
  onReorderProductInShelf,
  onOpenPreview,
  isUpdating,
}: VisualSectionShelfProps) {
  const products = section.products || [];
  const productCount = products.length;

  return (
    <div className="glass-card rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 1. ULTRA COMPACT TOP HEADER */}
      <div className="px-3 py-1.5 border-b border-border bg-muted/20 flex items-center justify-between gap-2">
        {/* Left: Position handle, Title, and Description */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Position Badge */}
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black font-heading text-[11px] shrink-0">
            #{section.displayOrder ?? index + 1}
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="font-bold font-heading text-xs sm:text-sm text-foreground truncate">
              {section.title}
            </h3>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 bg-background/80 font-mono text-muted-foreground border-border hidden sm:inline-flex"
            >
              /sections/{section.slug}
            </Badge>
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-full">
              {productCount} item{productCount !== 1 ? "s" : ""}
            </span>
            {section.description && (
              <span className="text-[10px] text-muted-foreground truncate hidden lg:inline max-w-xs opacity-70">
                • {section.description}
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Actions (Ultra Compact 26px height) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Section Position Up/Down Reorder */}
          <div className="flex items-center bg-background px-1 py-0.5 rounded-md border border-border h-6.5">
            <button
              type="button"
              disabled={isUpdating || index === 0}
              onClick={() => onMoveSectionOrder(section, "up")}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-20"
              title="Move Section Up"
            >
              <ChevronUp size={12} />
            </button>
            <span className="text-[8px] font-mono font-bold px-0.5 text-muted-foreground">
              Pos
            </span>
            <button
              type="button"
              disabled={isUpdating || index === totalSections - 1}
              onClick={() => onMoveSectionOrder(section, "down")}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-20"
              title="Move Section Down"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Active / Draft Status Toggle */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onToggleStatus(section)}
            className={`h-6.5 px-2 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              section.isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                section.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <span>{section.isActive ? "Live" : "Draft"}</span>
          </button>

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onOpenPreview(section)}
            className="h-6.5 px-2 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Preview Section"
          >
            <Eye size={11} />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Edit Section Title/Slug */}
          <button
            type="button"
            onClick={() => onEditSection(section)}
            className="h-6.5 px-2 rounded-md bg-muted/60 hover:bg-muted text-foreground text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-border"
            title="Edit Section Settings"
          >
            <Edit2 size={11} />
            <span>Settings</span>
          </button>

          {/* Delete Section */}
          <button
            type="button"
            onClick={() => onDeleteSection(section._id, section.title)}
            className="h-6.5 w-6.5 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
            title="Delete Section"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* 2. ULTRA SLIM PRODUCT SHELF (COMPACT 64px IMAGE) */}
      <div className="px-3 py-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-stretch gap-2.5 min-w-max pb-0.5">
          {/* Render All Assigned Products */}
          {products.map((prod: any, pIdx: number) => {
            const hasDiscount =
              prod.basePrice &&
              prod.salePrice &&
              prod.salePrice < prod.basePrice;
            const discountPercent = hasDiscount
              ? Math.round(
                  ((prod.basePrice - prod.salePrice) / prod.basePrice) * 100
                )
              : 0;

            return (
              <div
                key={prod._id || pIdx}
                className="w-28 sm:w-32 rounded-lg border border-border bg-background/80 hover:bg-background hover:border-primary/50 transition-all p-1.5 flex flex-col justify-between group/card shadow-sm hover:shadow relative"
              >
                {/* Remove Product from this section button */}
                <button
                  type="button"
                  onClick={() => onRemoveProductFromSection(section, prod._id)}
                  className="absolute top-1 right-1 z-10 w-4.5 h-4.5 rounded-full bg-background/90 hover:bg-rose-500 hover:text-white text-muted-foreground border border-border flex items-center justify-center shadow-xs transition-all cursor-pointer"
                  title="Remove from section"
                >
                  <X size={9} />
                </button>

                {/* Product Thumbnail (Ultra-Compact 60px height) */}
                <div className="w-full h-15 rounded-md bg-muted/60 overflow-hidden relative border border-border/40 mb-1">
                  <img
                    src={
                      prod.thumbnail ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120"
                    }
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as any).src =
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                    }}
                  />
                  {hasDiscount && discountPercent > 0 && (
                    <span className="absolute top-0.5 left-0.5 bg-rose-500 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="font-bold text-[10px] text-foreground truncate leading-tight">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-[10px] text-primary font-heading">
                      ${Number(prod.salePrice ?? prod.basePrice ?? 0).toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[8px] text-muted-foreground line-through">
                        ${Number(prod.basePrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Reorder Left/Right buttons (Ultra Compact) */}
                <div className="pt-1 mt-1 border-t border-border/40 flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={pIdx === 0}
                      onClick={() => onReorderProductInShelf(section, pIdx, "left")}
                      className="p-0.5 rounded hover:bg-muted hover:text-foreground disabled:opacity-20 cursor-pointer"
                      title="Move Left"
                    >
                      <ChevronLeft size={11} />
                    </button>
                    <span className="text-[8px] font-mono font-bold">
                      {pIdx + 1}/{productCount}
                    </span>
                    <button
                      type="button"
                      disabled={pIdx === productCount - 1}
                      onClick={() => onReorderProductInShelf(section, pIdx, "right")}
                      className="p-0.5 rounded hover:bg-muted hover:text-foreground disabled:opacity-20 cursor-pointer"
                      title="Move Right"
                    >
                      <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* "+ ADD PRODUCTS" ULTRA COMPACT CARD */}
          <div
            onClick={() => onOpenAddProducts(section)}
            className="w-28 sm:w-32 min-h-[105px] rounded-lg border-2 border-dashed border-border hover:border-primary bg-muted/20 hover:bg-primary/5 p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group/add select-none"
          >
            <div className="w-6 h-6 rounded-md bg-background border border-border group-hover/add:border-primary/40 text-muted-foreground group-hover/add:text-primary flex items-center justify-center transition-colors shadow-xs mb-1">
              <Plus size={13} className="group-hover/add:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-[10px] text-foreground group-hover/add:text-primary transition-colors">
              + Add Products
            </h4>
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">
              Catalog
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import {
  Layers,
  Edit3,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Plus,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SectionCardProps {
  section: any;
  index: number;
  totalCount: number;
  onEdit: (section: any) => void;
  onDelete: (id: string, title: string) => void;
  onPreview: (section: any) => void;
  onToggleStatus: (section: any) => void;
  onMoveOrder: (section: any, direction: "up" | "down") => void;
  isUpdating: boolean;
}

export default function SectionCard({
  section,
  index,
  totalCount,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  onMoveOrder,
  isUpdating,
}: SectionCardProps) {
  const products = section.products || [];
  const productCount = products.length;

  return (
    <div className="glass-card rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden group">
      {/* Card Header */}
      <div className="p-5 border-b border-border/50 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Order Badge */}
            <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg text-xs font-black shrink-0">
              <span>#{section.displayOrder ?? index + 1}</span>
            </div>

            <div className="min-w-0">
              <h3 className="font-bold font-heading text-base text-foreground group-hover:text-primary transition-colors truncate">
                {section.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border">
                  slug: {section.slug}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  • {productCount} item{productCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Active/Inactive Toggle & Reorder Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Re-order arrows */}
            <div className="flex flex-col gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                disabled={isUpdating || index === 0}
                onClick={() => onMoveOrder(section, "up")}
                className="w-5 h-4 rounded text-muted-foreground hover:text-foreground hover:bg-background flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30"
                title="Move section up"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                disabled={isUpdating || index === totalCount - 1}
                onClick={() => onMoveOrder(section, "down")}
                className="w-5 h-4 rounded text-muted-foreground hover:text-foreground hover:bg-background flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30"
                title="Move section down"
              >
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Status Button */}
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onToggleStatus(section)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all border ${
                section.isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-zinc-500/10 text-muted-foreground border-border hover:bg-zinc-500/20"
              }`}
              title={section.isActive ? "Click to set Draft" : "Click to Publish"}
            >
              {section.isActive ? (
                <>
                  <CheckCircle2 size={12} />
                  <span>LIVE</span>
                </>
              ) : (
                <>
                  <XCircle size={12} />
                  <span>DRAFT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {section.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {section.description}
          </p>
        )}
      </div>

      {/* Card Body: Product Showcase Grid */}
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
            <ShoppingBag size={12} />
            Showcase Products ({productCount})
          </span>
          {productCount > 4 && (
            <span className="text-[10px] font-bold text-primary">
              +{productCount - 4} more items
            </span>
          )}
        </div>

        {productCount > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {products.slice(0, 4).map((prod: any) => {
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
                  key={prod._id}
                  className="group/item relative rounded-xl border border-border/80 bg-background/60 hover:bg-background p-2 transition-all space-y-1.5 flex flex-col justify-between"
                >
                  {/* Thumbnail Image */}
                  <div className="w-full h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative border border-border/40">
                    <img
                      src={
                        prod.thumbnail ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120"
                      }
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as any).src =
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                      }}
                    />
                    {hasDiscount && discountPercent > 0 && (
                      <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black px-1 py-0.2 rounded shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h5 className="font-bold text-[11px] text-foreground truncate mt-0.5">
                      {prod.name}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-extrabold text-[10px] text-primary">
                        ${Number(prod.salePrice ?? prod.basePrice ?? 0).toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[9px] text-muted-foreground line-through">
                          ${Number(prod.basePrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={() => onEdit(section)}
            className="p-6 rounded-xl border border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-primary/5 cursor-pointer text-center space-y-1.5 transition-all group/empty"
          >
            <Plus
              size={20}
              className="mx-auto text-muted-foreground group-hover/empty:text-primary transition-colors"
            />
            <p className="text-xs font-bold text-foreground">
              No products assigned yet
            </p>
            <p className="text-[10px] text-muted-foreground">
              Click to select products from your catalog for this section
            </p>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onPreview(section)}
          className="h-8 px-3 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Eye size={13} />
          <span>Storefront Preview</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(section)}
            className="h-8 px-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-primary/20"
          >
            <Edit3 size={13} />
            <span>Configure</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(section._id, section.title)}
            className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
            title="Delete Section"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

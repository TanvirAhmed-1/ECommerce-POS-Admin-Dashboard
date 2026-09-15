import React, { useState } from "react";
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Star,
  ShoppingCart,
  Heart,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StorefrontPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: any | null;
}

export default function StorefrontPreviewModal({
  isOpen,
  onClose,
  section,
}: StorefrontPreviewModalProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  if (!isOpen || !section) return null;

  const products = section.products || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-5xl rounded-3xl border border-border bg-card/95 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs font-bold text-foreground ml-2 font-heading">
              Storefront Customer Simulation
            </span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 font-bold"
            >
              {section.slug}
            </Badge>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                viewport === "desktop"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor size={14} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                viewport === "tablet"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tablet size={14} />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                viewport === "mobile"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Storefront Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100 dark:bg-zinc-950 flex justify-center custom-scrollbar">
          <div
            className={`transition-all duration-300 w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-lg ${
              viewport === "desktop"
                ? "max-w-5xl"
                : viewport === "tablet"
                ? "max-w-2xl"
                : "max-w-sm"
            }`}
          >
            {/* Section Header on Customer Storefront */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/60 pb-5 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                  <Flame size={14} />
                  <span>Featured Collection</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                    {section.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View All Products</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  viewport === "desktop"
                    ? "grid-cols-4"
                    : viewport === "tablet"
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {products.map((prod: any) => {
                  const hasDiscount =
                    prod.basePrice &&
                    prod.salePrice &&
                    prod.salePrice < prod.basePrice;
                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((prod.basePrice - prod.salePrice) / prod.basePrice) *
                          100
                      )
                    : 0;

                  return (
                    <div
                      key={prod._id}
                      className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Image Box */}
                        <div className="w-full h-40 rounded-xl bg-zinc-200 dark:bg-zinc-700/50 flex items-center justify-center overflow-hidden relative">
                          <img
                            src={
                              prod.thumbnail ||
                              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200"
                            }
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as any).src =
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200";
                            }}
                          />
                          {hasDiscount && (
                            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                              -{discountPercent}% OFF
                            </span>
                          )}
                          <button
                            type="button"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-black/60 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 flex items-center justify-center backdrop-blur-sm transition-colors"
                          >
                            <Heart size={14} />
                          </button>
                        </div>

                        {/* Title & Stars */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={11} fill="currentColor" />
                            ))}
                            <span className="text-[10px] text-zinc-400 font-bold ml-1">
                              5.0
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {prod.name}
                          </h4>
                        </div>
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-primary font-heading">
                            ${Number(prod.salePrice ?? prod.basePrice ?? 0).toFixed(2)}
                          </div>
                          {hasDiscount && (
                            <div className="text-[10px] text-zinc-400 line-through">
                              ${Number(prod.basePrice).toFixed(2)}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="h-8 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                        >
                          <ShoppingCart size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                <p className="text-sm font-bold">No products in this section</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

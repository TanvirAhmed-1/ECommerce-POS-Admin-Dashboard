"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  CreditCard,
  Printer,
  Ban,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Store,
  Globe,
  UserCheck,
  User,
  Edit3,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import toast from "react-hot-toast";

interface OrderDetailsModalProps {
  order: any | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
  isUpdatingStatus: boolean;
  onOpenEdit?: (order: any) => void;
}

// Helper to extract variant attributes
const parseVariantInfo = (item: any) => {
  const variant = item?.variant;
  const product = item?.product;

  if (!variant && !product?.hasVariants) {
    return {
      isVariant: false,
      attributesText: "Standard / Non-Variant Product",
      attributesList: [],
      sku: item.sku || product?.sku || "N/A",
    };
  }

  // If variant has an array of attributes
  if (variant?.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
    const list = variant.attributes.map((a: any) => ({
      name: a.attribute?.name || a.attribute || "Spec",
      value: a.value || String(a),
    }));
    return {
      isVariant: true,
      attributesText: list.map((l: any) => `${l.name}: ${l.value}`).join(" | "),
      attributesList: list,
      sku: variant.sku || item.sku || product?.sku || "VAR-SKU",
    };
  }

  // If variant is a key-value object (e.g. { color: "Red", size: "XL" })
  if (variant && typeof variant === "object") {
    const excludedKeys = [
      "_id",
      "id",
      "stock",
      "price",
      "sku",
      "product",
      "isActive",
      "images",
      "createdAt",
      "updatedAt",
      "__v",
    ];
    const entries = Object.entries(variant).filter(
      ([k, v]) => !excludedKeys.includes(k) && typeof v === "string"
    );

    if (entries.length > 0) {
      const list = entries.map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: String(value),
      }));
      return {
        isVariant: true,
        attributesText: list.map((l) => `${l.name}: ${l.value}`).join(" | "),
        attributesList: list,
        sku: variant.sku || item.sku || product?.sku || "VAR-SKU",
      };
    }
  }

  if (product?.hasVariants) {
    return {
      isVariant: true,
      attributesText: "Variant Assigned",
      attributesList: [],
      sku: variant?.sku || item.sku || product?.sku || "VAR-SKU",
    };
  }

  return {
    isVariant: false,
    attributesText: "Standard / Non-Variant Product",
    attributesList: [],
    sku: item.sku || product?.sku || "N/A",
  };
};

// Helper to get available stock
const getItemStockInfo = (item: any) => {
  let availableStock = 0;
  const variant = item?.variant;
  const product = item?.product;

  if (variant && typeof variant.stock === "number") {
    availableStock = variant.stock;
  } else if (product && typeof product.totalStock === "number") {
    availableStock = product.totalStock;
  } else if (typeof item.stock === "number") {
    availableStock = item.stock;
  } else {
    availableStock = 25;
  }

  const orderedQty = item.quantity || 1;
  const isSufficient = availableStock >= orderedQty;
  const isLow = availableStock > 0 && availableStock < orderedQty;
  const isOut = availableStock <= 0;

  return {
    availableStock,
    orderedQty,
    isSufficient,
    isLow,
    isOut,
  };
};

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  isUpdatingStatus,
  onOpenEdit,
}: OrderDetailsModalProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Overall Stock Verification Health
  const itemsAnalysis = useMemo(() => {
    if (!order) return [];
    const items = order.items || [];
    return items.map((item: any) => {
      const variantInfo = parseVariantInfo(item);
      const stockInfo = getItemStockInfo(item);
      return {
        ...item,
        variantInfo,
        stockInfo,
      };
    });
  }, [order]);

  const allItemsInStock = useMemo(() => {
    if (itemsAnalysis.length === 0) return false;
    return itemsAnalysis.every((i: any) => i.stockInfo.isSufficient);
  }, [itemsAnalysis]);

  // Format order date
  const orderDateFormatted = useMemo(() => {
    if (!order?.createdAt) return null;
    try {
      const d = new Date(order.createdAt);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [order?.createdAt]);

  if (!order) return null;

  const fullName = order.shippingAddress?.fullName || order.user?.name || "Customer";
  const phone = order.shippingAddress?.phone || order.user?.phone || "";
  const email = order.user?.email || order.shippingAddress?.email || "";
  const address = order.shippingAddress?.address || "No address provided";
  const district = order.shippingAddress?.district || order.shippingAddress?.city || "";
  const upazila = order.shippingAddress?.upazila || "";
  const division = order.shippingAddress?.division || "";
  const orderId = order.id || order.orderNumber || order._id || "";

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success("Phone number copied!");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyOrderId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP ACCENT GLOW BAR */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />

        {/* MODAL HEADER */}
        <div className="px-6 py-4.5 border-b border-border/70 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/25 flex items-center justify-center shrink-0 shadow-inner">
              <ShoppingBag size={22} className="drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-heading text-base sm:text-lg font-black text-foreground tracking-tight">
                  Order Details & Stock Verification
                </h3>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 flex items-center gap-1.5 transition-all cursor-pointer group"
                  title="Click to copy Order ID"
                >
                  <span>{orderId}</span>
                  {copiedOrderId ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={11} className="opacity-60 group-hover:opacity-100" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Inspect ordered items, variant stock health, and customer dispatch details.</span>
                {orderDateFormatted && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/80">
                    • <Calendar size={10} /> {orderDateFormatted}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit(order)}
                className="px-3.5 py-2 bg-gradient-to-r from-primary/15 via-primary/10 to-indigo-500/15 hover:from-primary hover:to-primary text-primary hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border border-primary/30 shadow-xs group"
                title="Edit address, change variants, adjust delivery fee or add products"
              >
                <Edit3 size={13} className="transition-transform group-hover:rotate-12" />
                <span>Modify & Confirm (পরিবর্তন)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-all"
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* 1. STOCK HEALTH ALERT BANNER */}
          {allItemsInStock ? (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-700 dark:text-emerald-400 flex items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>All Items In Stock</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                    All ordered variations and quantities are verified in stock. Ready for quick confirmation!
                  </p>
                </div>
              </div>

              {order.orderStatus === "pending" && (
                <button
                  onClick={() => onUpdateStatus(order._id, "processing")}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUpdatingStatus ? (
                    <Spinner className="w-3.5 h-3.5 text-white animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Quick Confirm</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent text-rose-700 dark:text-rose-400 flex items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Stock Insufficiency Detected
                  </h4>
                  <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90 mt-0.5">
                    One or more ordered variants have low or zero stock. Review the item inventory below before confirming.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDERED PRODUCTS BREAKDOWN */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Ordered Items & Variant Inventory ({itemsAnalysis.length})</span>
              </h4>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Live Stock Status
              </span>
            </div>

            <div className="border border-border/80 rounded-2xl divide-y divide-border/60 overflow-hidden bg-card/60 shadow-xs">
              {itemsAnalysis.map((item: any, idx: number) => {
                const prodName = item.product?.name || "Ordered Product";
                const pThumb =
                  item.product?.thumbnail ||
                  (item.product?.images && item.product.images[0]) ||
                  "";
                const itemPrice = Number(item.price || item.product?.salePrice || item.product?.basePrice || 0);
                const lineTotal = itemPrice * (item.quantity || 1);

                return (
                  <div
                    key={item._id || idx}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-muted/30 transition-colors"
                  >
                    {/* Left: Product & Variant Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-muted border border-border/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {pThumb ? (
                          <img
                            src={pThumb}
                            alt={prodName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src =
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                            }}
                          />
                        ) : (
                          <Package size={22} className="text-muted-foreground/50" />
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs hover:text-primary transition-colors truncate">
                            {prodName}
                          </span>

                          {/* Variation vs Non-Variation Badge */}
                          {item.variantInfo.isVariant ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                              <Layers size={10} /> Variation Product
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-muted text-muted-foreground border border-border">
                              Standard Product
                            </span>
                          )}
                        </div>

                        {/* Variant Attributes details */}
                        {item.variantInfo.isVariant && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.variantInfo.attributesList.length > 0 ? (
                              item.variantInfo.attributesList.map((attr: any, aIdx: number) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/80 text-foreground border border-border/80"
                                >
                                  <span className="text-muted-foreground">{attr.name}:</span>{" "}
                                  <strong className="text-foreground">{attr.value}</strong>
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic font-medium">
                                {item.variantInfo.attributesText}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                          <span>SKU: <strong className="text-foreground">{item.variantInfo.sku}</strong></span>
                          <span>•</span>
                          <span>Rate: ৳{itemPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity, Stock Indicator & Subtotal */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 gap-1.5">
                      {/* Stock Check Pill */}
                      <div>
                        {item.stockInfo.isSufficient ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> In Stock ({item.stockInfo.availableStock} Available)
                          </span>
                        ) : item.stockInfo.isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <AlertTriangle size={11} /> Low Stock (Only {item.stockInfo.availableStock} Available)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <AlertCircle size={11} /> Out of Stock (0 Available)
                          </span>
                        )}
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-foreground">
                          ৳{lineTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold">
                          Qty: {item.quantity || 1} pcs
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PREMIUM 4-CARD METRIC & LOGS SECTION (HIGHLIGHTED IN SCREENSHOT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* CARD 1: ORDER ORIGIN & LOG (CYAN/BLUE THEME) */}
            <div className="relative rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.07] via-card to-card p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-blue-500/40 transition-all group">
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-blue-500/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {order.source === "pos" || order.channel === "pos" ? (
                        <Store size={13} />
                      ) : (
                        <Globe size={13} />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      Order Origin & Log
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Sales Channel
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[11px] font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>{order.source === "pos" || order.channel === "pos" ? "POS Counter / Outlet" : "Web Online Store"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Handled / Created By
                    </span>
                    <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/60">
                      <div className="w-6 h-6 rounded-lg bg-background text-primary flex items-center justify-center shrink-0 border border-border">
                        <UserCheck size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs truncate">
                          {order.createdBy?.name || order.cashierName || (order.source === "pos" ? "Store Cashier" : "Online Checkout Customer")}
                        </p>
                        {order.createdBy?.email && (
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{order.createdBy.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: CUSTOMER & CONTACT (EMERALD/TEAL THEME) */}
            <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.07] via-card to-card p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-emerald-500/40 transition-all group">
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Phone size={13} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Customer & Contact
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Customer Name
                    </span>
                    <p className="font-extrabold text-foreground text-sm mt-0.5 flex items-center gap-1.5">
                      <User size={13} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{fullName}</span>
                    </p>
                  </div>

                  {phone && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Phone Number
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${phone}`}
                          className="flex-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 font-mono font-bold text-xs transition-colors"
                          title="Click to Call"
                        >
                          <PhoneCall size={12} className="text-emerald-500 animate-bounce" />
                          <span>{phone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          className="p-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          title="Copy Phone"
                        >
                          {copiedPhone ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {email && email !== "N/A" && (
                    <div className="pt-0.5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate">
                        <Mail size={11} className="shrink-0" />
                        <span className="truncate">{email}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 3: SHIPPING & COURIER (PURPLE/VIOLET THEME) */}
            <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.07] via-card to-card p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-purple-500/40 transition-all group">
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-purple-500/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Truck size={13} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                      Shipping & Courier
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Delivery Destination
                    </span>
                    <p className="text-foreground text-xs font-semibold leading-relaxed mt-0.5 flex items-start gap-1.5">
                      <MapPin size={13} className="text-purple-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {address}
                        {(district || upazila) && (
                          <strong className="block text-primary font-bold">
                            {[upazila, district, division].filter(Boolean).join(", ")}
                          </strong>
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Courier & Payment Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25 flex items-center gap-1">
                      🚚 {order.courier || "Steadfast"}
                    </span>
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-muted text-foreground border border-border uppercase">
                      {order.payment?.method || "COD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: PHONE CONFIRMATION CRM (AMBER/ORANGE THEME) */}
            <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.07] via-card to-card p-4 flex flex-col justify-between gap-3 shadow-xs hover:border-amber-500/40 transition-all group">
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <PhoneCall size={13} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Phone Confirmation
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Call Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase ${
                        order.callStatus === "confirmed"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : order.callStatus === "no_answer"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : order.callStatus === "call_later"
                          ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                          : order.callStatus === "cancelled"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : "bg-muted/70 text-muted-foreground border border-border"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          order.callStatus === "confirmed"
                            ? "bg-emerald-500"
                            : order.callStatus === "no_answer"
                            ? "bg-amber-500"
                            : order.callStatus === "call_later"
                            ? "bg-orange-500"
                            : order.callStatus === "cancelled"
                            ? "bg-rose-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span>
                        {order.callStatus === "confirmed"
                          ? "Confirmed"
                          : order.callStatus === "no_answer"
                          ? "No Answer"
                          : order.callStatus === "call_later"
                          ? "Call Later"
                          : order.callStatus === "cancelled"
                          ? "Cancelled"
                          : "Unconfirmed"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-muted/40 px-2.5 py-1.5 rounded-xl border border-border/60">
                    <span className="text-muted-foreground font-semibold">Call Attempts:</span>
                    <strong className="font-mono font-black text-foreground">{order.callAttempts || 0}</strong>
                  </div>

                  {order.callLogs && order.callLogs.length > 0 && (
                    <p className="text-[10px] text-muted-foreground italic line-clamp-2 bg-muted/20 p-1.5 rounded-lg">
                      "{order.callLogs[order.callLogs.length - 1].note || "No note recorded"}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. FINANCIALS SUMMARY BAR */}
          <div className="p-4 rounded-2xl border border-border/80 bg-gradient-to-r from-muted/40 via-card to-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Current Order Status:
              </span>
              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  order.orderStatus === "delivered"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : order.orderStatus === "shipped"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : order.orderStatus === "processing"
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                    : order.orderStatus === "cancelled"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : "bg-primary/10 text-primary border-primary/25"
                }`}
              >
                {order.orderStatus || "Pending"}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Grand Total:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-primary drop-shadow-xs">
                  ৳{Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. ACTION FOOTER */}
        <div className="px-6 py-4 border-t border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {order.orderStatus !== "cancelled" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "cancelled")}
                disabled={isUpdatingStatus}
                className="px-3.5 py-2 border border-rose-500/30 hover:border-rose-500 text-rose-600 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Ban size={13} />
                <span>Cancel Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-border hover:border-border/80 bg-card hover:bg-muted text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>

          {/* Primary State Transition Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Close
            </button>

            {order.orderStatus === "pending" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "processing")}
                disabled={isUpdatingStatus}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/25 cursor-pointer flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isUpdatingStatus ? (
                  <Spinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>Confirm Order (Processing)</span>
              </button>
            )}

            {order.orderStatus === "processing" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "shipped")}
                disabled={isUpdatingStatus}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-600/25 cursor-pointer flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isUpdatingStatus ? (
                  <Spinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Truck size={16} />
                )}
                <span>Dispatch / Mark Shipped</span>
              </button>
            )}

            {order.orderStatus === "shipped" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "delivered")}
                disabled={isUpdatingStatus}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/25 cursor-pointer flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isUpdatingStatus ? (
                  <Spinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>Mark Delivered</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

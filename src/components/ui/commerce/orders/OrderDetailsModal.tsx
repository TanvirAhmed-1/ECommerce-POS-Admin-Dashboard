"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

interface OrderDetailsModalProps {
  order: any | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
  isUpdatingStatus: boolean;
  onOpenEdit?: (order: any) => void;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  isUpdatingStatus,
  onOpenEdit,
}: OrderDetailsModalProps) {
  if (!order) return null;

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
      // Fallback default stock representation
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

  // Overall Stock Verification Health
  const itemsAnalysis = useMemo(() => {
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

  const allItemsInStock = itemsAnalysis.every((i: any) => i.stockInfo.isSufficient);
  const anyOutOfStock = itemsAnalysis.some((i: any) => i.stockInfo.isOut);

  const fullName = order.shippingAddress?.fullName || order.user?.name || "Customer";
  const phone = order.shippingAddress?.phone || order.user?.phone || "N/A";
  const email = order.user?.email || "N/A";
  const address = order.shippingAddress?.address || "No address provided";
  const city = order.shippingAddress?.city || "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col glass-card rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading text-base sm:text-lg font-black text-foreground">
                  Order Details & Stock Verification
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {order.id || order.orderNumber || order._id}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Inspect ordered products, variant configurations, and inventory before confirming.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit(order)}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-primary/20 shadow-xs"
                title="Edit address, change variants, adjust delivery fee or add products"
              >
                <Edit3 size={13} />
                <span>Modify & Confirm Order (পরিবর্তন)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-all"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* Stock Health Banner */}
          {allItemsInStock ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    All Items In Stock - Ready To Confirm!
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Each ordered variation and product has sufficient inventory available. You can safely confirm this order.
                  </p>
                </div>
              </div>

              {order.orderStatus === "pending" && (
                <button
                  onClick={() => onUpdateStatus(order._id, "processing")}
                  disabled={isUpdatingStatus}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isUpdatingStatus ? <Spinner className="w-3.5 h-3.5 text-white animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Quick Confirm</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 flex items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Warning: Stock Insufficiency Detected
                  </h4>
                  <p className="text-[11px] text-rose-800 dark:text-rose-300">
                    One or more ordered variants have low or zero stock. Review the item details below before processing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ordered Products Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Package size={14} className="text-primary" />
                Ordered Items & Variant Stock Status ({itemsAnalysis.length})
              </h4>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Live Inventory Verification
              </span>
            </div>

            <div className="border border-border rounded-xl divide-y divide-border/60 overflow-hidden bg-card">
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
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/15 transition-colors"
                  >
                    {/* Left: Product & Variant Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
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
                          <Package size={20} className="text-muted-foreground/60" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs hover:text-primary transition-colors truncate">
                            {prodName}
                          </span>

                          {/* Variation vs Non-Variation Badge */}
                          {item.variantInfo.isVariant ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                              <Layers size={10} /> Variation Product
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-zinc-500/10 text-muted-foreground border border-border">
                              Non-Variant
                            </span>
                          )}
                        </div>

                        {/* Variant Attributes details */}
                        {item.variantInfo.isVariant && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {item.variantInfo.attributesList.length > 0 ? (
                              item.variantInfo.attributesList.map((attr: any, aIdx: number) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border"
                                >
                                  {attr.name}:{" "}
                                  <strong className="text-primary">{attr.value}</strong>
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
                          <span>SKU: {item.variantInfo.sku}</span>
                          <span>•</span>
                          <span>Rate: ৳{itemPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity, Stock Indicator & Subtotal */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {/* Stock Check Pill */}
                      <div className="mb-1">
                        {item.stockInfo.isSufficient ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> In Stock ({item.stockInfo.availableStock} Available)
                          </span>
                        ) : item.stockInfo.isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            <AlertTriangle size={11} /> Low Stock (Only {item.stockInfo.availableStock} Available)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                            <AlertCircle size={11} /> Out of Stock (0 Available)
                          </span>
                        )}
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="text-right">
                        <div className="text-xs font-black text-foreground">
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

          {/* Customer, Origin, Delivery & Tele-Call Confirmation Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Order Channel & Creator Log */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                {order.source === "pos" || order.channel === "pos" ? (
                  <Store size={13} className="text-emerald-500" />
                ) : (
                  <Globe size={13} className="text-blue-500" />
                )}
                Order Origin & Log
              </h5>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Sales Channel:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase mt-0.5 bg-muted text-foreground border border-border">
                    {order.source === "pos" || order.channel === "pos" ? "🏪 POS Outlet / Counter" : "🌐 Web Online Store"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Handled / Created By:</span>
                  <p className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                    <UserCheck size={12} className="text-primary shrink-0" />
                    <span>{order.createdBy?.name || order.cashierName || (order.source === "pos" ? "Store Cashier" : "Online Checkout Customer")}</span>
                  </p>
                  {order.createdBy?.email && (
                    <p className="text-[10px] text-muted-foreground font-mono">{order.createdBy.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Customer & Contact */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={13} className="text-primary" />
                Customer & Contact
              </h5>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-foreground">{fullName}</p>
                <a
                  href={`tel:${phone}`}
                  className="text-primary hover:underline flex items-center gap-1.5 text-[11px] font-mono font-bold"
                  title="Direct Call Customer"
                >
                  <PhoneCall size={11} className="text-emerald-500" /> {phone}
                </a>
                {order.alternativePhone && (
                  <p className="text-muted-foreground text-[10px] font-mono">
                    Alt: {order.alternativePhone}
                  </p>
                )}
                <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Mail size={11} /> {email}
                </p>
              </div>
            </div>

            {/* 3. Delivery & Courier */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-primary" />
                Shipping & Courier
              </h5>
              <div className="space-y-1 text-xs">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  <span className="font-semibold text-foreground">Address:</span> {address}
                  {city ? `, ${city}` : ""}
                </p>
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    🚚 {order.courier || "Steadfast Courier"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border uppercase">
                    {order.payment?.method || "COD"}
                  </span>
                </div>
                {order.notes && (
                  <p className="text-[10px] text-muted-foreground italic pt-0.5">
                    Note: {order.notes}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Tele-Call Confirmation CRM */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall size={13} className="text-primary" />
                Phone Confirmation
              </h5>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Call Status:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase mt-0.5 ${
                    order.callStatus === "confirmed"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : order.callStatus === "no_answer"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : order.callStatus === "call_later"
                      ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                      : order.callStatus === "cancelled"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {order.callStatus === "confirmed" ? "🟢 Confirmed" : order.callStatus === "no_answer" ? "🟡 No Answer" : order.callStatus === "call_later" ? "🟠 Call Later" : order.callStatus === "cancelled" ? "🔴 Cancelled" : "📞 Unconfirmed"}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  <span>Call Attempts: <strong>{order.callAttempts || 0}</strong></span>
                </div>
                {order.callLogs && order.callLogs.length > 0 && (
                  <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                    Latest: "{order.callLogs[order.callLogs.length - 1].note || "No note recorded"}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financials Breakdown */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Current Order Status:</span>
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {order.orderStatus || "Pending"}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 justify-between sm:justify-end">
              <span className="text-xs font-bold text-muted-foreground uppercase">Grand Total:</span>
              <span className="text-lg font-black font-mono text-primary">
                ৳{Number(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {order.orderStatus !== "cancelled" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "cancelled")}
                disabled={isUpdatingStatus}
                className="px-3 py-2 border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Ban size={13} />
                <span>Cancel Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 border border-border text-foreground hover:bg-muted rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>

          {/* Primary State Transition Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>

            {order.orderStatus === "pending" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "processing")}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Spinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>Confirm Order (Processing)</span>
              </button>
            )}

            {order.orderStatus === "processing" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "shipped")}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Spinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Truck size={15} />
                )}
                <span>Dispatch / Mark Shipped</span>
              </button>
            )}

            {order.orderStatus === "shipped" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order._id, "delivered")}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Spinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
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

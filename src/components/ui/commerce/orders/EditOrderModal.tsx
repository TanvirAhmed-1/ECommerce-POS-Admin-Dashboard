"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Phone,
  PhoneCall,
  MapPin,
  User,
  Package,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Truck,
  ShieldCheck,
  Search,
  Sparkles,
  UserCheck,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { TbCurrencyTaka } from "react-icons/tb";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useUpdateAdminOrderMutation } from "@/redux/features/order/orderApi";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface EditOrderModalProps {
  isOpen: boolean;
  order: any | null;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: any) => void;
}

interface EditableItem {
  _id?: string;
  product: any;
  variant?: any;
  quantity: number;
  price: number;
  sku?: string;
  variantLabel?: string;
}

const CITY_PRESETS = [
  { name: "Dhaka (Inside City)", charge: 60, city: "Dhaka" },
  { name: "Dhaka Suburbs (Savar/Gazipur/Narayanganj)", charge: 100, city: "Dhaka Suburbs" },
  { name: "Chittagong (Outside Dhaka)", charge: 120, city: "Chittagong" },
  { name: "Sylhet (Outside Dhaka)", charge: 120, city: "Sylhet" },
  { name: "Rajshahi (Outside Dhaka)", charge: 120, city: "Rajshahi" },
  { name: "Khulna (Outside Dhaka)", charge: 120, city: "Khulna" },
  { name: "Barisal (Outside Dhaka)", charge: 120, city: "Barisal" },
  { name: "Rangpur (Outside Dhaka)", charge: 120, city: "Rangpur" },
  { name: "Mymensingh (Outside Dhaka)", charge: 120, city: "Mymensingh" },
];

const COURIER_PARTNERS = [
  "Steadfast Courier",
  "Pathao Courier",
  "RedX Logistics",
  "Paperfly",
  "Sundarban Courier",
  "SA Paribahan",
  "In-House Delivery Rider",
  "Showroom / POS Pickup",
];

export default function EditOrderModal({
  isOpen,
  order,
  onClose,
  onOrderUpdated,
}: EditOrderModalProps) {
  const currentUser = useAppSelector((state) => state.auth);
  const [updateAdminOrder, { isLoading: isUpdating }] = useUpdateAdminOrderMutation();

  // 1. Customer & Delivery States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [courier, setCourier] = useState("Steadfast Courier");
  const [orderNotes, setOrderNotes] = useState("");

  // 2. Items & Financials
  const [items, setItems] = useState<EditableItem[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState(60);
  const [discount, setDiscount] = useState(0);
  const [orderStatus, setOrderStatus] = useState("processing");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 3. Tele-Call Confirmation & CRM Log
  const [callStatus, setCallStatus] = useState<
    "pending" | "confirmed" | "no_answer" | "call_later" | "cancelled" | "wrong_number"
  >("pending");
  const [callNote, setCallNote] = useState("");

  // 4. Product Search for Upsell / Adding extra items
  const [productSearch, setProductSearch] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Fetch product catalog for upsell
  const { data: productsRes, isLoading: isProductsLoading } = useGetAllProductsQuery(
    {
      page: 1,
      limit: 30,
      ...(productSearch.trim() && { searchTerm: productSearch.trim() }),
    },
    { skip: !isAddingProduct }
  );

  const productCatalog = productsRes?.data || [];

  // Initialize form when order changes
  useEffect(() => {
    if (order) {
      setFullName(order.shippingAddress?.fullName || order.user?.name || "");
      setPhone(order.shippingAddress?.phone || order.user?.phone || "");
      setAlternativePhone(order.alternativePhone || "");
      setAddress(order.shippingAddress?.address || "");
      setCity(order.shippingAddress?.city || "Dhaka");
      setCourier(order.courier || "Steadfast Courier");
      setOrderNotes(order.notes || "");
      setDeliveryCharge(order.deliveryCharge !== undefined ? Number(order.deliveryCharge) : 60);
      setDiscount(order.discount !== undefined ? Number(order.discount) : 0);
      setOrderStatus(order.orderStatus || "processing");
      setPaymentStatus(order.payment?.status || order.paymentStatus || "pending");
      setPaymentMethod(order.payment?.method || "cod");
      setCallStatus(order.callStatus || "pending");
      setCallNote("");

      // Map Items
      if (order.items && Array.isArray(order.items)) {
        const mapped = order.items.map((it: any) => {
          let variantLabel = "Standard Spec";
          if (it.variant) {
            if (it.variant.attributes && Array.isArray(it.variant.attributes)) {
              variantLabel = it.variant.attributes
                .map((a: any) => `${a.attribute?.name || a.attribute || "Spec"}: ${a.value || a}`)
                .join(", ");
            } else if (it.variant.color || it.variant.size) {
              variantLabel = [it.variant.color, it.variant.size].filter(Boolean).join(" / ");
            }
          }

          return {
            _id: it._id,
            product: it.product,
            variant: it.variant,
            quantity: Number(it.quantity || 1),
            price: Number(it.price || it.product?.salePrice || it.product?.basePrice || 0),
            sku: it.variant?.sku || it.sku || it.product?.sku || "SKU-N/A",
            variantLabel,
          };
        });
        setItems(mapped);
      } else {
        setItems([]);
      }
    }
  }, [order, isOpen]);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    const total = subtotal + Number(deliveryCharge || 0) - Number(discount || 0);
    return Math.max(0, total);
  }, [subtotal, deliveryCharge, discount]);

  if (!isOpen || !order) return null;

  // Change City & auto-update delivery fee preset
  const handleCitySelect = (selectedCityName: string) => {
    setCity(selectedCityName);
    const matchedPreset = CITY_PRESETS.find((p) => p.name === selectedCityName || p.city === selectedCityName);
    if (matchedPreset) {
      setDeliveryCharge(matchedPreset.charge);
    }
  };

  // Item quantity modifiers
  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("An order must contain at least one product item.");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    toast.success("Item removed from order");
  };

  // Add a product from catalog into this order
  const handleAddProductFromCatalog = (product: any, variant?: any) => {
    const itemPrice = Number(variant?.price || product.salePrice || product.basePrice || product.price || 0);
    let variantLabel = "Standard Spec";
    if (variant) {
      if (variant.attributes && Array.isArray(variant.attributes)) {
        variantLabel = variant.attributes
          .map((a: any) => `${a.attribute?.name || a.attribute || "Spec"}: ${a.value || a}`)
          .join(", ");
      } else if (variant.color || variant.size) {
        variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ");
      }
    }

    const newItem: EditableItem = {
      product,
      variant,
      quantity: 1,
      price: itemPrice,
      sku: variant?.sku || product.sku || "NEW-SKU",
      variantLabel,
    };

    setItems((prev) => [...prev, newItem]);
    setIsAddingProduct(false);
    setProductSearch("");
    toast.success(`Added "${product.name}" to order!`);
  };

  // Save Order Updates
  const handleSaveOrder = async () => {
    if (!fullName.trim()) {
      toast.error("Customer Full Name is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Customer Phone Number is required.");
      return;
    }
    if (!address.trim()) {
      toast.error("Full Delivery Address is required.");
      return;
    }
    if (items.length === 0) {
      toast.error("Order must have at least one product item.");
      return;
    }

    const payload = {
      id: order._id || order.id,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      },
      alternativePhone: alternativePhone.trim(),
      courier,
      notes: orderNotes.trim(),
      items: items.map((it) => ({
        product: it.product?._id || it.product?.id || it.product,
        variant: it.variant?._id || it.variant?.id || it.variant || undefined,
        quantity: it.quantity,
        price: it.price,
      })),
      subtotal,
      deliveryCharge: Number(deliveryCharge || 0),
      discount: Number(discount || 0),
      totalAmount: grandTotal,
      orderStatus,
      paymentStatus,
      paymentMethod,
      callStatus,
      callNote: callNote.trim(),
      agentName: currentUser?.user?.name || "Admin Staff",
    };

    const toastId = toast.loading("Updating and confirming order modifications...");
    try {
      const res = await updateAdminOrder(payload).unwrap();
      toast.success("Order & Customer Details updated successfully!", { id: toastId });
      if (onOrderUpdated) {
        onOrderUpdated(res.data || res);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update order.", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="glass-card w-full max-w-5xl rounded-3xl border border-border bg-card shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PhoneCall size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary">
                  {order.id || order.orderNumber || "ORD-EDIT"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase bg-primary/10 text-primary border-primary/20"
                >
                  Order Confirmation & Modification
                </Badge>
              </div>
              <h3 className="text-base sm:text-lg font-black font-heading text-foreground">
                Customer Call & Order Editor (কনফার্মেশন ও পরিবর্তন)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar text-xs">
          {/* Top: 1-Click Dial & Call Status Strip */}
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span>Call Confirmation Widget</span>
                    <a
                      href={`tel:${phone}`}
                      className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1 hover:bg-emerald-600 transition-colors shadow-xs"
                      title="Direct Click-to-Call from softphone or mobile"
                    >
                      <Phone size={10} />
                      <span>Dial: {phone || "No Number"}</span>
                    </a>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Direct customer communication: confirm delivery address, variant preference, and item quantities.
                  </p>
                </div>
              </div>

              {/* Call Attempts Counter */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground self-start sm:self-auto bg-card px-3 py-1.5 rounded-xl border border-border">
                <Clock size={13} className="text-primary" />
                <span>Attempts: <strong>{(order.callAttempts || 0) + (callNote ? 1 : 0)}</strong> calls</span>
              </div>
            </div>

            {/* Quick Call Status Selector Chips */}
            <div className="space-y-1.5 pt-2 border-t border-primary/15">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Phone Confirmation Result (কলের ফলাফল):
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "confirmed", label: "🟢 Confirmed (কনফার্মড)", color: "bg-emerald-500 text-white" },
                  { id: "no_answer", label: "🟡 No Answer / Ringing (রিসিভ করেনি)", color: "bg-amber-500 text-white" },
                  { id: "call_later", label: "🟠 Call Later / Busy (পরে কল দিতে বলেছে)", color: "bg-orange-500 text-white" },
                  { id: "cancelled", label: "🔴 Cancelled on Call (বাতিল করেছে)", color: "bg-rose-500 text-white" },
                  { id: "wrong_number", label: "⚪ Wrong Number (ভুল নাম্বার)", color: "bg-zinc-600 text-white" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setCallStatus(st.id as any);
                      if (st.id === "confirmed") {
                        setOrderStatus("processing");
                      } else if (st.id === "cancelled") {
                        setOrderStatus("cancelled");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      callStatus === st.id
                        ? `${st.color} shadow-md shadow-primary/20 scale-102`
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Log / Agent Note */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <FileText size={11} className="text-primary" />
                Agent Call Note / Conversation Summary:
              </label>
              <input
                type="text"
                placeholder="e.g. Customer requested Saturday afternoon delivery, confirmed navy blue XL size..."
                value={callNote}
                onChange={(e) => setCallNote(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Two-Column Grid: Left: Customer & Shipping | Right: Financials & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Customer & Delivery Information (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    Customer & Shipping Destination
                  </h4>
                  <span className="text-[10px] font-bold text-muted-foreground">Editable</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Customer Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Customer Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Primary Phone *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="017xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Alternative / Backup Phone</label>
                    <input
                      type="text"
                      value={alternativePhone}
                      onChange={(e) => setAlternativePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Optional Backup Number"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">City / Delivery Zone *</label>
                    <select
                      value={city}
                      onChange={(e) => handleCitySelect(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {CITY_PRESETS.map((c) => (
                        <option key={c.name} value={c.city}>
                          {c.name} — (৳{c.charge})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Full Delivery Address *</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="House, Road, Area, Landmark..."
                  />
                </div>

                {/* Courier Partner & Delivery Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Truck size={12} className="text-primary" />
                      Assigned Courier Partner
                    </label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {COURIER_PARTNERS.map((cp) => (
                        <option key={cp} value={cp}>
                          {cp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Special Delivery Instructions</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Call before delivery, handle with care"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Status & Financial Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                <h4 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  Order Status & Financial Breakdown
                </h4>

                {/* Status Controls */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Order Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing (Confirmed)</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="pending">Pending (Unpaid)</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Charge & Discount Inputs */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Delivery Charge (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryCharge}
                        onChange={(e) => setDeliveryCharge(Number(e.target.value) || 0)}
                        className="w-full pl-6 pr-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Special Discount (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        className="w-full pl-6 pr-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5 font-medium text-xs pt-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-foreground">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charge:</span>
                    <span className="font-bold text-foreground">+৳{Number(deliveryCharge).toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Discount:</span>
                      <span className="font-bold">-৳{Number(discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-black text-foreground">
                    <span>Grand Total:</span>
                    <span className="text-base text-primary font-mono font-black">
                      ৳{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products & Live Variant Modifier Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <h4 className="font-bold text-foreground uppercase tracking-wider text-xs">
                  Ordered Products & Variant Customization ({items.length})
                </h4>
              </div>

              {/* Add Product / Upsell Button */}
              <button
                type="button"
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-primary/20"
              >
                <Plus size={13} />
                <span>{isAddingProduct ? "Close Catalog" : "+ Add Item / Upsell"}</span>
              </button>
            </div>

            {/* Catalog Search & Add Dropdown */}
            {isAddingProduct && (
              <div className="p-4 rounded-2xl border border-primary/20 bg-card space-y-3 animate-fade-in shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Search size={13} className="text-primary" />
                    Search & Select Product to Add to this Order:
                  </span>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search product catalog by name, SKU, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                </div>

                {/* Product Search Results List */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                  {isProductsLoading ? (
                    <div className="py-6 flex justify-center">
                      <Spinner className="w-5 h-5 text-primary" />
                    </div>
                  ) : productCatalog.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      No products found matching "{productSearch}".
                    </p>
                  ) : (
                    productCatalog.map((prod: any) => {
                      const hasVars = prod.hasVariants && Array.isArray(prod.variants) && prod.variants.length > 0;

                      return (
                        <div
                          key={prod._id || prod.id}
                          className="pt-1.5 flex items-center justify-between gap-3 hover:bg-muted/30 p-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.thumbnail ? (
                                <img src={prod.thumbnail} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={14} className="text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{prod.name}</p>
                              <span className="text-[10px] text-primary font-bold">
                                ৳{Number(prod.salePrice || prod.basePrice || prod.price || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Button: Direct Add or Select Variant */}
                          {hasVars ? (
                            <div className="flex items-center gap-1 shrink-0">
                              {prod.variants.slice(0, 3).map((v: any) => (
                                <button
                                  key={v._id || v.id}
                                  type="button"
                                  onClick={() => handleAddProductFromCatalog(prod, v)}
                                  className="px-2 py-1 bg-muted hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold border border-border cursor-pointer transition-all"
                                >
                                  {v.color || v.size || v.sku || "Var"} (৳{v.price || prod.salePrice})
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddProductFromCatalog(prod)}
                              className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 cursor-pointer shrink-0"
                            >
                              + Add to Order
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Current Order Items Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
              {items.map((item, idx) => {
                const prodName = item.product?.name || "Product";
                const pThumb = item.product?.thumbnail || (item.product?.images && item.product.images[0]) || "";
                const lineTotal = item.price * item.quantity;
                const prodVariants = item.product?.variants || [];

                return (
                  <div
                    key={item._id || idx}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                  >
                    {/* Item Thumbnail & Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {pThumb ? (
                          <img src={pThumb} alt={prodName} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={18} className="text-muted-foreground" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h5 className="font-bold text-foreground text-xs truncate">{prodName}</h5>

                        {/* Variant Switcher Dropdown */}
                        {prodVariants.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground font-bold">Variant:</span>
                            <select
                              value={item.variant?._id || item.variant?.id || item.variant || ""}
                              onChange={(e) => {
                                const chosenVarId = e.target.value;
                                const matchedVar = prodVariants.find(
                                  (v: any) => (v._id || v.id) === chosenVarId
                                );
                                if (matchedVar) {
                                  setItems((prev) => {
                                    const updated = [...prev];
                                    let vLabel = "Standard";
                                    if (matchedVar.color || matchedVar.size) {
                                      vLabel = [matchedVar.color, matchedVar.size].filter(Boolean).join(" / ");
                                    }
                                    updated[idx] = {
                                      ...updated[idx],
                                      variant: matchedVar,
                                      price: matchedVar.price || updated[idx].price,
                                      sku: matchedVar.sku || updated[idx].sku,
                                      variantLabel: vLabel,
                                    };
                                    return updated;
                                  });
                                  toast.success(`Switched variant to ${matchedVar.sku || "selected spec"}`);
                                }
                              }}
                              className="px-2 py-0.5 bg-background border border-border rounded-lg text-[10px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[220px]"
                            >
                              {prodVariants.map((v: any) => (
                                <option key={v._id || v.id} value={v._id || v.id}>
                                  {[v.color, v.size, v.sku].filter(Boolean).join(" - ")} (Stock: {v.stock})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            {item.variantLabel || item.sku}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unit Price, Quantity Modifiers, Line Total & Delete */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end">
                      {/* Unit Price */}
                      <span className="font-bold text-xs text-muted-foreground font-mono">
                        ৳{item.price.toFixed(2)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-card hover:bg-muted flex items-center justify-center text-foreground font-bold cursor-pointer disabled:opacity-40"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center font-black text-xs font-mono text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-card hover:bg-muted flex items-center justify-center text-foreground font-bold cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <span className="font-black text-xs font-mono text-foreground min-w-[70px] text-right">
                        ৳{lineTotal.toFixed(2)}
                      </span>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previous Call Logs History (Audit Trail) */}
          {order.callLogs && Array.isArray(order.callLogs) && order.callLogs.length > 0 && (
            <div className="p-4 rounded-2xl border border-border bg-card space-y-2.5">
              <h5 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-primary" />
                Previous Call Confirmation History (কল হিস্টোরি)
              </h5>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 divide-y divide-border/40">
                {order.callLogs.map((log: any, i: number) => (
                  <div key={i} className="pt-1.5 flex items-start justify-between gap-2 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground capitalize">
                          {log.callStatus?.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          by <strong>{log.agentName || "Agent"}</strong>
                        </span>
                      </div>
                      {log.note && <p className="text-muted-foreground italic">"{log.note}"</p>}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {log.date ? new Date(log.date).toLocaleString("en-GB") : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserCheck size={14} className="text-emerald-500" />
            <span>Agent: <strong>{currentUser?.user?.name || "Admin Staff"}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={handleSaveOrder}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary text-white font-bold text-xs shadow-lg shadow-primary/25 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <Spinner className="w-4 h-4 text-white" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>{isUpdating ? "Saving..." : "Save & Confirm Order (পরিবর্তন সেভ করুন)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

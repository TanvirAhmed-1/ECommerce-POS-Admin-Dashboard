"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  Receipt,
  Tag,
  Truck,
  Store,
  Clock,
  ChevronDown,
  ChevronUp,
  Percent,
  Banknote,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useCreateAdminOrderMutation } from "@/redux/features/order/orderApi";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import VariantConfigModal from "@/components/ui/commerce/pos/VariantConfigModal";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (createdOrder: any, invoice: any) => void;
}

interface CartItem {
  product: any;
  variant?: any;
  quantity: number;
  price: number;
  sku: string;
  variantLabel: string;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: CreateOrderModalProps) {
  // Product Search & Filter State
  const [productSearch, setProductSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in_stock" | "low_stock" | "variants">("all");
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);
  const [activeVariant, setActiveVariant] = useState<any | null>(null);
  const [variantModalQty, setVariantModalQty] = useState(1);

  // Cart / Order Items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Customer Details
  const [customerMode, setCustomerMode] = useState<"walkin" | "custom">("walkin");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [deliveryType, setDeliveryType] = useState<"pos_takeaway" | "home_delivery">("pos_takeaway");

  // Financials
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bkash" | "nagad" | "card" | "pos" | "cod" | "bank_transfer"
  >("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">("paid");
  const [orderNotes, setOrderNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  // RTK Queries & Mutations
  const { data: productsRes, isLoading: isProductsLoading } = useGetAllProductsQuery({
    admin: true,
    limit: 200,
  });
  const [createAdminOrder, { isLoading: isSubmitting }] = useCreateAdminOrderMutation();

  const products: any[] = useMemo(() => {
    if (Array.isArray(productsRes?.data?.data)) return productsRes.data.data;
    if (Array.isArray(productsRes?.data)) return productsRes.data;
    if (Array.isArray(productsRes)) return productsRes;
    return [];
  }, [productsRes]);

  // Filter products by search & tab
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    let list = products;

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter((p: any) => {
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchCode = p.productCode?.toLowerCase().includes(q);
        const matchBarcode = p.barcode?.toLowerCase().includes(q);
        return matchName || matchSku || matchCode || matchBarcode;
      });
    }

    if (filterType === "in_stock") {
      list = list.filter((p: any) => (p.totalStock ?? 0) > 0);
    } else if (filterType === "low_stock") {
      list = list.filter((p: any) => {
        const s = p.totalStock ?? 0;
        return s > 0 && s < 5;
      });
    } else if (filterType === "variants") {
      list = list.filter((p: any) => p.hasVariants && p.productVariants?.length > 0);
    }

    return list;
  }, [products, productSearch, filterType]);

  // Helper for variant display name
  const getVariantLabel = (variant: any) => {
    if (!variant) return "Standard";
    if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
      return variant.attributes
        .map((a: any) => `${a.attribute?.name || a.attribute || "Spec"}: ${a.value}`)
        .join(" | ");
    }
    return variant.sku || "Variation";
  };

  // Helper for variant attribute chips
  const getVariantAttributePills = (variant: any) => {
    if (!variant) return [];
    if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
      return variant.attributes.map((a: any) => ({
        name: a.attribute?.name || a.attribute || "Spec",
        value: a.value,
      }));
    }
    return [{ name: "SKU", value: variant.sku || "Variation" }];
  };

  // Open variant modal for configuration
  const handleOpenVariantPicker = (product: any) => {
    setSelectedProductForVariant(product);
    setVariantModalQty(1);
    if (product.productVariants && product.productVariants.length > 0) {
      // Pick first in-stock variant or default first
      const firstInStock = product.productVariants.find((v: any) => (v.stock ?? 0) > 0);
      setActiveVariant(firstInStock || product.productVariants[0]);
    } else {
      setActiveVariant(null);
    }
  };

  // Direct quick add for simple products (or opens picker for variant products)
  const handleProductCardClick = (product: any) => {
    const hasVariants = product.hasVariants && product.productVariants && product.productVariants.length > 0;
    if (hasVariants) {
      handleOpenVariantPicker(product);
      return;
    }

    const stock = product.totalStock ?? 0;
    if (stock <= 0) {
      toast.error("This product is currently out of stock!");
      return;
    }

    // Add simple product directly
    const existingIndex = cartItems.findIndex((item) => item.product._id === product._id);
    const price = product.salePrice || product.basePrice || 0;
    const sku = product.sku || "SKU";

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + 1;
      if (newQty > stock) {
        toast.error(`Stock limit reached (${stock} units max)`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setCartItems(updated);
      toast.success(`Increased ${product.name} qty (${newQty})`, { duration: 1500 });
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          product,
          quantity: 1,
          price,
          sku,
          variantLabel: "Standard Item",
        },
      ]);
      toast.success(`Added ${product.name} to order`, { duration: 1500 });
    }
  };

  // Add from Variant Modal
  const handleAddVariantToCart = (variant: any, qty: number) => {
    if (!selectedProductForVariant || !variant) return;

    const currentStock = variant.stock ?? 0;
    if (currentStock <= 0) {
      toast.error("Selected variant is out of stock!");
      return;
    }

    if (qty > currentStock) {
      toast.error(`Only ${currentStock} units available for this variant!`);
      return;
    }

    const price = variant.price || selectedProductForVariant.salePrice || selectedProductForVariant.basePrice || 0;
    const sku = variant.sku || selectedProductForVariant.sku || "SKU";
    const variantLabel = getVariantLabel(variant);

    const existingIndex = cartItems.findIndex(
      (item) =>
        item.product._id === selectedProductForVariant._id &&
        item.variant?._id === variant._id
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + qty;
      if (newQty > currentStock) {
        toast.error(`Cannot exceed available stock (${currentStock})!`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setCartItems(updated);
      toast.success(`Updated ${selectedProductForVariant.name} (${variantLabel})`, { duration: 1500 });
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          product: selectedProductForVariant,
          variant: variant,
          quantity: qty,
          price,
          sku,
          variantLabel,
        },
      ]);
      toast.success(`Added ${selectedProductForVariant.name} to order`, { duration: 1500 });
    }

    setSelectedProductForVariant(null);
    setActiveVariant(null);
  };

  // Cart operations
  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = cartItems[index];
    const maxStock = item.variant ? item.variant.stock ?? 999 : item.product.totalStock ?? 999;
    if (newQty > maxStock) {
      toast.error(`Only ${maxStock} units available in inventory!`);
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
  };

  // Financial Calculations
  const totalItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const vatAmount = useMemo(() => {
    if (!vatPercent || vatPercent <= 0) return 0;
    return Math.round((subtotal * vatPercent) / 100);
  }, [subtotal, vatPercent]);

  const grandTotal = useMemo(() => {
    const total = subtotal - (discount || 0) + (deliveryCharge || 0) + vatAmount;
    return total > 0 ? total : 0;
  }, [subtotal, discount, deliveryCharge, vatAmount]);

  // Preset Handlers
  const handleApplyDiscountPreset = (val: number, isPct = false) => {
    if (isPct) {
      setDiscount(Math.round((subtotal * val) / 100));
    } else {
      setDiscount(val);
    }
  };

  const handleApplyVatPreset = (pct: number) => {
    setVatPercent(pct);
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one product to the order!");
      return;
    }

    const customerName = fullName.trim() || (customerMode === "walkin" ? "Walk-in Customer" : "Direct Client");
    const customerPhone = phone.trim() || "01700000000";
    const customerAddress = address.trim() || (deliveryType === "pos_takeaway" ? "Store Pickup Outlet" : "Delivery Address");

    const payload = {
      customerInfo: {
        fullName: customerName,
        phone: customerPhone,
        email: email.trim() || undefined,
        address: customerAddress,
        city: city || "Dhaka",
      },
      shippingAddress: {
        fullName: customerName,
        phone: customerPhone,
        address: customerAddress,
        city: city || "Dhaka",
      },
      items: cartItems.map((item) => ({
        product: item.product._id,
        variant: item.variant?._id || undefined,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      discount: discount || 0,
      vat: vatAmount,
      deliveryCharge: deliveryCharge || 0,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus,
      orderStatus: paymentStatus === "paid" ? "processing" : "pending",
      deliveryType,
      notes: orderNotes,
      source: "pos",
    };

    try {
      const res = await createAdminOrder(payload).unwrap();
      toast.success("POS Sale completed & Invoice generated!", { duration: 3000 });
      if (onOrderCreated) {
        onOrderCreated(res.data, res.invoice);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to create POS order");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn">
      {/* Main POS Workstation Container */}
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[950px] bg-card border border-border/80 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        
        {/* ========================================================= */}
        {/* HEADER BAR                                                */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70 bg-muted/30 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shadow-inner">
              <Store size={20} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base md:text-lg text-foreground tracking-tight">
                  POS Sales Terminal
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Instant billing, real-time inventory deduction & digital invoice generation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/50 text-xs text-muted-foreground">
              <Package size={14} className="text-primary" />
              <span>Catalog: <strong className="text-foreground">{products.length}</strong> items</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all cursor-pointer"
              title="Close Terminal (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2-COLUMN WORKSTATION LAYOUT                               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border/70">
          
          {/* ------------------------------------------------------- */}
          {/* LEFT PANE: PRODUCT CATALOG & SEARCH (7 Columns)         */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0 bg-background/50">
            
            {/* Search & Filter Header */}
            <div className="p-4 border-b border-border/60 bg-muted/10 space-y-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, or barcode (Ctrl+K)..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-xs bg-background/80 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/70"
                    autoFocus
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "all"
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  All Products ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("in_stock")}
                  className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "in_stock"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  In Stock
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("low_stock")}
                  className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "low_stock"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Low Stock
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("variants")}
                  className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "variants"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Multi-Variant
                </button>
              </div>
            </div>

            {/* Product Grid Area (Scrollable single container) */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isProductsLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Spinner className="w-8 h-8 text-primary" />
                  <p className="text-xs font-semibold">Loading product catalog...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border/70 rounded-2xl p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60">
                    <Search size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">No Products Found</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No matching items found for &quot;{productSearch}&quot;.
                    </p>
                  </div>
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold rounded-lg transition-all"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => {
                    const stock = product.totalStock ?? 0;
                    const isOutOfStock = stock <= 0;
                    const isLowStock = stock > 0 && stock < 5;
                    const hasVariants =
                      product.hasVariants &&
                      product.productVariants &&
                      product.productVariants.length > 0;
                    const price = product.salePrice || product.basePrice || 0;

                    // Check if already in cart
                    const inCartCount = cartItems
                      .filter((c) => c.product._id === product._id)
                      .reduce((sum, c) => sum + c.quantity, 0);

                    return (
                      <div
                        key={product._id}
                        onClick={() => !isOutOfStock && handleProductCardClick(product)}
                        className={`group relative p-3 rounded-xl border transition-all select-none flex flex-col justify-between ${
                          isOutOfStock
                            ? "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed"
                            : "border-border/80 bg-card hover:border-primary/60 hover:shadow-md hover:bg-muted/20 cursor-pointer"
                        }`}
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative w-full h-28 rounded-lg bg-muted/40 border border-border/50 overflow-hidden mb-2.5 flex items-center justify-center">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <Package size={28} className="text-muted-foreground/40" />
                            )}

                            {/* In-Cart Indicator */}
                            {inCartCount > 0 && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black shadow-lg flex items-center gap-1">
                                <ShoppingBag size={10} />
                                {inCartCount} in cart
                              </div>
                            )}

                            {/* Stock Badge */}
                            <div className="absolute bottom-2 left-2">
                              {isOutOfStock ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-500/90 text-white shadow-sm">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/90 text-black shadow-sm">
                                  Low: {stock} left
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                                  Stock: {stock}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>

                          <div className="flex items-center justify-between gap-1 mt-1 text-[11px]">
                            <span className="text-muted-foreground font-mono text-[10px] truncate">
                              SKU: {product.sku || "N/A"}
                            </span>
                            {hasVariants && (
                              <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20 shrink-0 flex items-center gap-0.5">
                                <Layers size={8} /> {product.productVariants.length} Variants
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action Row */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/50">
                          <div className="font-mono font-black text-sm text-primary">
                            ৳{price.toLocaleString()}
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              hasVariants
                                ? "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30"
                                : "bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30"
                            }`}
                          >
                            {hasVariants ? (
                              <>
                                <Layers size={11} /> Select
                              </>
                            ) : (
                              <>
                                <Plus size={12} /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Customer & Fulfillment Settings Strip */}
            <div className="p-3.5 border-t border-border/70 bg-muted/20 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-muted/70 p-0.5 rounded-xl text-xs font-semibold border border-border/60">
                    <button
                      type="button"
                      onClick={() => setCustomerMode("walkin")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        customerMode === "walkin"
                          ? "bg-card text-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <User size={13} />
                      Walk-in Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode("custom")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        customerMode === "custom"
                          ? "bg-card text-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <SlidersHorizontal size={13} />
                      Customer Details
                    </button>
                  </div>

                  {customerMode === "custom" && (
                    <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                      {fullName ? `Customer: ${fullName}` : "Adding custom info..."}
                    </span>
                  )}
                </div>

                {/* Fulfillment selector */}
                <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-xl text-xs font-semibold border border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType("pos_takeaway");
                      setDeliveryCharge(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      deliveryType === "pos_takeaway"
                        ? "bg-primary text-white font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Store size={12} />
                    Store Pickup (৳0)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType("home_delivery");
                      if (deliveryCharge === 0) setDeliveryCharge(60);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      deliveryType === "home_delivery"
                        ? "bg-primary text-white font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Truck size={12} />
                    Home Delivery
                  </button>
                </div>
              </div>

              {/* Customer Input Panel (Shows when 'custom' is active) */}
              {customerMode === "custom" && (
                <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-fadeIn">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block uppercase tracking-wider">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Shipping Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block uppercase tracking-wider">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Dhaka"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT PANE: POS REGISTER & BILLING (5 Columns)          */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-0 bg-muted/15">
            
            {/* Cart Header */}
            <div className="px-5 py-3 border-b border-border/70 bg-card/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt size={17} className="text-primary" />
                <h3 className="font-heading font-black text-xs md:text-sm uppercase tracking-wider text-foreground">
                  Order Slip
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-all"
                >
                  <Trash2 size={12} />
                  Clear Slip
                </button>
              )}
            </div>

            {/* Cart Items List (Flex-1 scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar min-h-0">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/70 rounded-2xl text-muted-foreground space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">No Items on Slip</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Search or click any product from the catalog on the left to add items.
                    </p>
                  </div>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={`${item.product._id}-${item.variant?._id || "base"}-${index}`}
                    className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product.thumbnail ? (
                            <img
                              src={item.product.thumbnail}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={16} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {item.product.name}
                          </h4>
                          {item.variant ? (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 truncate max-w-full">
                              {item.variantLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              SKU: {item.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-muted-foreground/60 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-muted"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Price, Stepper & Subtotal Row */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                      <div className="font-mono text-xs text-muted-foreground">
                        ৳{item.price.toLocaleString()} <span className="text-[10px]">/ unit</span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-border/80 rounded-lg bg-background overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center text-xs font-black font-mono text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right font-mono font-black text-sm text-foreground">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Financial Controls & Checkout Section (Fixed Bottom) */}
            <div className="p-4 border-t border-border/80 bg-card/90 space-y-3 shrink-0 shadow-lg">
              
              {/* Financial Inputs: Discount, Delivery, VAT */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Discount (৳)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={discount === 0 ? "" : discount}
                    placeholder="0"
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Delivery (৳)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharge === 0 ? "" : deliveryCharge}
                    placeholder="0"
                    onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      VAT / Tax (%)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vatPercent === 0 ? "" : vatPercent}
                    placeholder="0%"
                    onChange={(e) => setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Payment Method
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNotesInput(!showNotesInput)}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    {showNotesInput ? "Hide Notes" : "+ Order Note"}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { id: "cash", label: "Cash", color: "hover:border-emerald-500", activeBg: "bg-emerald-600 text-white border-emerald-600 shadow-sm" },
                    { id: "bkash", label: "bKash", color: "hover:border-pink-500", activeBg: "bg-[#e2136e] text-white border-[#e2136e] shadow-sm" },
                    { id: "nagad", label: "Nagad", color: "hover:border-orange-500", activeBg: "bg-[#f7941d] text-white border-[#f7941d] shadow-sm" },
                    { id: "card", label: "Card / POS", color: "hover:border-blue-500", activeBg: "bg-blue-600 text-white border-blue-600 shadow-sm" },
                    { id: "cod", label: "COD", color: "hover:border-purple-500", activeBg: "bg-purple-600 text-white border-purple-600 shadow-sm" },
                    { id: "bank_transfer", label: "Bank", color: "hover:border-sky-500", activeBg: "bg-sky-600 text-white border-sky-600 shadow-sm" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer text-center truncate ${
                        paymentMethod === m.id
                          ? m.activeBg
                          : `border-border/80 bg-background text-foreground hover:bg-muted ${m.color}`
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Order Notes */}
              {showNotesInput && (
                <input
                  type="text"
                  placeholder="Special instructions or invoice remarks..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary animate-fadeIn"
                />
              )}

              {/* Payment Status Segmented Switch */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-muted-foreground">Payment Status:</span>
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("paid")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      paymentStatus === "paid"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Check size={12} /> Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("pending")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      paymentStatus === "pending"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Clock size={12} /> Due / Pending
                  </button>
                </div>
              </div>

              {/* Receipt Totals Summary Slip */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItemCount} items)</span>
                  <span className="font-mono font-bold text-foreground">৳{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-rose-500 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-৳{discount.toLocaleString()}</span>
                  </div>
                )}

                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className="font-mono font-semibold text-foreground">+৳{deliveryCharge.toLocaleString()}</span>
                  </div>
                )}

                {vatAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT ({vatPercent}%)</span>
                    <span className="font-mono font-semibold text-foreground">+৳{vatAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-border/80">
                  <span className="font-heading font-black text-sm text-foreground">Grand Total:</span>
                  <span className="font-mono font-black text-xl text-primary">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleSubmitOrder}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-black text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 text-white" />
                    <span>Creating Sale Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Complete Sale • ৳{grandTotal.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VARIANT PICKER MODAL OVERLAY                              */}
      {/* ========================================================= */}
      <VariantConfigModal
        isOpen={Boolean(selectedProductForVariant)}
        product={selectedProductForVariant}
        initialVariant={activeVariant}
        onClose={() => {
          setSelectedProductForVariant(null);
          setActiveVariant(null);
        }}
        onAddToCart={handleAddVariantToCart}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  Package,
  Layers,
  Receipt,
  Store,
  Clock,
  Check,
  SlidersHorizontal,
  History,
  X, 
  Truck,
  Bookmark,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { TbCurrencyTaka } from "react-icons/tb";
import Link from "next/link";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useCreateAdminOrderMutation } from "@/redux/features/order/orderApi";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import InvoiceSlideOver from "@/components/ui/commerce/invoices/InvoiceSlideOver";
import VariantConfigModal from "@/components/ui/commerce/pos/VariantConfigModal";
import { useAppSelector } from "@/redux/hooks";

interface CartItem {
  product: any;
  variant?: any;
  quantity: number;
  price: number;
  sku: string;
  variantLabel: string;
}

export default function POSPage() {
  const currentUser = useAppSelector((state) => state.auth);

  // Product Search & Filter State
  const [productSearch, setProductSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in_stock" | "low_stock" | "variants">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);
  const [activeVariant, setActiveVariant] = useState<any | null>(null);
  const [variantModalQty, setVariantModalQty] = useState(1);

  // Cart / Order Items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<{ id: string; time: string; items: CartItem[]; customer: string }[]>([]);

  // Customer Details
  const [customerMode, setCustomerMode] = useState<"walkin" | "custom">("custom");
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
  const [cashTendered, setCashTendered] = useState<number | "">("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bkash" | "nagad" | "card" | "pos" | "cod" | "bank_transfer"
  >("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">("paid");
  const [orderNotes, setOrderNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Post-order invoice preview
  const [createdInvoice, setCreatedInvoice] = useState<any | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
          " • " +
          now.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // RTK Queries & Mutations
  const { data: productsRes, isLoading: isProductsLoading, refetch: refetchProducts } = useGetAllProductsQuery({
    admin: true,
    limit: 250,
  });
  const [createAdminOrder, { isLoading: isSubmitting }] = useCreateAdminOrderMutation();

  const products: any[] = useMemo(() => {
    if (Array.isArray(productsRes?.data?.data)) return productsRes.data.data;
    if (Array.isArray(productsRes?.data)) return productsRes.data;
    if (Array.isArray(productsRes)) return productsRes;
    return [];
  }, [productsRes]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      const cat = p.category?.name || p.category;
      if (typeof cat === "string" && cat.trim()) set.add(cat.trim());
    });
    return Array.from(set);
  }, [products]);

  // Filter products by search, tab & category
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

    if (selectedCategory !== "all") {
      list = list.filter((p: any) => {
        const cat = p.category?.name || p.category;
        return cat === selectedCategory;
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
  }, [products, productSearch, filterType, selectedCategory]);

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
      const firstInStock = product.productVariants.find((v: any) => (v.stock ?? 0) > 0);
      setActiveVariant(firstInStock || product.productVariants[0]);
    } else {
      setActiveVariant(null);
    }
  };

  // Quick add or open variant picker
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
      toast.success(`Increased ${product.name} qty (${newQty})`, { duration: 1200 });
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
      toast.success(`Added ${product.name} to order`, { duration: 1200 });
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
      toast.error(`Only ${maxStock} units available in stock!`);
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
  };

  // Hold Order Feature
  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty, cannot hold order!");
      return;
    }
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      items: [...cartItems],
      customer: fullName || "Walk-in Guest",
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    setCartItems([]);
    toast.success(`Order ${newHold.id} held successfully!`);
  };

  const handleRestoreHeldOrder = (hold: typeof heldOrders[0]) => {
    setCartItems(hold.items);
    setHeldOrders((prev) => prev.filter((h) => h.id !== hold.id));
    toast.success(`Restored order ${hold.id}`);
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

  const changeDue = useMemo(() => {
    if (typeof cashTendered !== "number" || cashTendered <= 0) return 0;
    const change = cashTendered - grandTotal;
    return change > 0 ? change : 0;
  }, [cashTendered, grandTotal]);

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
      channel: "pos",
      createdBy: {
        name: currentUser?.name || "POS Cashier",
        email: currentUser?.email || "cashier@store.local",
        role: currentUser?.role || "admin",
        id: currentUser?.id || undefined,
      },
      cashierName: currentUser?.name || "POS Cashier",
    };

    try {
      const res = await createAdminOrder(payload).unwrap();
      toast.success("POS Sale completed & Invoice generated!", { duration: 3000 });
      
      // Open instant invoice slide-over if invoice returned
      if (res.invoice) {
        setCreatedInvoice(res.invoice);
      }

      // Reset cart and fields
      setCartItems([]);
      setDiscount(0);
      setDeliveryCharge(0);
      setVatPercent(0);
      setCashTendered("");
      setFullName("");
      setPhone("");
      setAddress("");
      setOrderNotes("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to create POS order");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 animate-fade-in max-w-[1920px] mx-auto p-1 md:p-3 pb-8">
        
        {/* ========================================================= */}
        {/* TOP STATION CONTROL BAR                                   */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center shadow-inner shrink-0">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-lg md:text-xl text-foreground tracking-tight">
                  POS Sales Workstation
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Terminal Live
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Clock size={12} className="text-muted-foreground" />
                <span>{currentTime || "Live Terminal Session"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Cashier Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/80 border border-border text-xs font-bold text-foreground shadow-xs">
              <User size={13} className="text-primary" />
              <span>Cashier: <strong className="text-primary">{currentUser?.name || "Admin Cashier"}</strong></span>
            </div>

            {heldOrders.length > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <Bookmark size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-500">Held Orders ({heldOrders.length}):</span>
                <div className="flex items-center gap-1 ml-1">
                  {heldOrders.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleRestoreHeldOrder(h)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all"
                      title={`Restore ${h.customer} (${h.items.length} items)`}
                    >
                      {h.id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleHoldOrder}
              disabled={cartItems.length === 0}
              className="h-9 px-3 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl border border-border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Bookmark size={14} />
              <span>Hold Slip</span>
            </button>

            <button
              type="button"
              onClick={() => refetchProducts()}
              className="h-9 px-3 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl border border-border transition-all flex items-center gap-1.5 cursor-pointer"
              title="Refresh inventory"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Sync Stock</span>
            </button>

            <Link
              href="/orders"
              className="h-9 px-3.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <History size={14} />
              <span>Order History</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN WORKSTATION GRID (Full Width & Ergonomic)            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* ------------------------------------------------------- */}
          {/* LEFT COLUMN: CATALOG WORKSTATION (7 Cols on desktop)   */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {/* Catalog Controls Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 w-full">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, product code, or barcode..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
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

                {/* Stock Status Pills */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      filterType === "all"
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("in_stock")}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      filterType === "in_stock"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("low_stock")}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      filterType === "low_stock"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Low Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("variants")}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      filterType === "variants"
                        ? "bg-sky-600 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Variants
                  </button>
                </div>
              </div>

              {/* Category Quick Filter Row */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1 border-t border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
                    Category:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === "all"
                        ? "bg-foreground text-background font-bold"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? "bg-foreground text-background font-bold"
                          : "bg-muted/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="rounded-2xl bg-card border border-border/80 shadow-sm p-4 min-h-[520px]">
              {isProductsLoading ? (
                <div className="h-[480px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Spinner className="w-9 h-9 text-primary" />
                  <p className="text-xs font-semibold">Loading live product catalog...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-[480px] flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/60">
                    <Search size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">No Products Found</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      No matching items found for &quot;{productSearch}&quot;. Try clearing filters or searching another keyword.
                    </p>
                  </div>
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold rounded-xl transition-all"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredProducts.map((product) => {
                    const stock = product.totalStock ?? 0;
                    const isOutOfStock = stock <= 0;
                    const isLowStock = stock > 0 && stock < 5;
                    const hasVariants =
                      product.hasVariants &&
                      product.productVariants &&
                      product.productVariants.length > 0;
                    const price = product.salePrice || product.basePrice || 0;

                    const inCartCount = cartItems
                      .filter((c) => c.product._id === product._id)
                      .reduce((sum, c) => sum + c.quantity, 0);

                    return (
                      <div
                        key={product._id}
                        onClick={() => !isOutOfStock && handleProductCardClick(product)}
                        className={`group relative p-3 rounded-2xl border transition-all select-none flex flex-col justify-between ${
                          isOutOfStock
                            ? "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed"
                            : "border-border/80 bg-background hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                        }`}
                      >
                        <div>
                          {/* Image Container */}
                          <div className="relative w-full h-32 rounded-xl bg-muted/40 border border-border/50 overflow-hidden mb-3 flex items-center justify-center">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <Package size={32} className="text-muted-foreground/30" />
                            )}

                            {/* In-Cart Tag */}
                            {inCartCount > 0 && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black shadow-md flex items-center gap-1">
                                <ShoppingBag size={10} />
                                {inCartCount}
                              </div>
                            )}

                            {/* Stock Badge */}
                            <div className="absolute bottom-2 left-2">
                              {isOutOfStock ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-sm">
                                  Low Stock: {stock}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                                  Stock: {stock}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>

                          <div className="flex items-center justify-between gap-1 mt-1 text-[11px]">
                            <span className="text-muted-foreground font-mono text-[10px] truncate">
                              SKU: {product.sku || "N/A"}
                            </span>
                            {hasVariants && (
                              <span className="text-[9px] font-bold text-sky-500 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20 shrink-0 flex items-center gap-0.5">
                                <Layers size={8} /> {product.productVariants.length} Vars
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action Button */}
                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border/50">
                          <div className="font-mono font-black text-sm text-primary">
                            ৳{price.toLocaleString()}
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              hasVariants
                                ? "bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white border border-sky-500/30"
                                : "bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30"
                            }`}
                          >
                            {hasVariants ? (
                              <>
                                <Layers size={11} /> Variant
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

            {/* Customer & Delivery Settings Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-muted p-0.5 rounded-xl text-xs font-bold border border-border">
                    <button
                      type="button"
                      onClick={() => setCustomerMode("walkin")}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        customerMode === "walkin"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <User size={13} />
                      Walk-in Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode("custom")}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        customerMode === "custom"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <SlidersHorizontal size={13} />
                      Customer Details
                    </button>
                  </div>
                </div>

                {/* Fulfillment selector */}
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-xl text-xs font-bold border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType("pos_takeaway");
                      setDeliveryCharge(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      deliveryType === "pos_takeaway"
                        ? "bg-primary text-white shadow-sm"
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
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      deliveryType === "home_delivery"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Truck size={12} />
                    Home Delivery
                  </button>
                </div>
              </div>

              {/* Customer detailed input row */}
              {customerMode === "custom" && (
                <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street / Area / House"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                      City / Zone
                    </label>
                    <input
                      type="text"
                      placeholder="Dhaka"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT COLUMN: POS REGISTER & BILLING (5/4 Cols)        */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-4 space-y-4">
            
            <div className="rounded-2xl bg-card border border-border/80 shadow-sm overflow-hidden flex flex-col">
              
              {/* Slip Header */}
              <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-primary" />
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">
                    Order Slip
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/25">
                    {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCartItems([])}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 hover:underline cursor-pointer transition-all"
                  >
                    <Trash2 size={12} />
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="p-4 space-y-2.5 max-h-[340px] overflow-y-auto custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-2xl text-muted-foreground space-y-2.5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40">
                      <ShoppingBag size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Slip is Empty</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                        Click any product on the left catalog or scan barcode to add items.
                      </p>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div
                      key={`${item.product._id}-${item.variant?._id || "base"}-${index}`}
                      className="p-3 rounded-xl border border-border bg-background shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
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
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 truncate max-w-full">
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

                      {/* Stepper & Subtotal */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                        <div className="font-mono text-xs text-muted-foreground">
                          ৳{item.price.toLocaleString()} <span className="text-[10px]">/ unit</span>
                        </div>

                        <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
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

                        <div className="text-right font-mono font-black text-sm text-foreground">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Adjustments & Checkout Actions */}
              <div className="p-4 border-t border-border bg-muted/20 space-y-3.5 shrink-0">
                
                {/* Financial Inputs: Discount, Delivery, VAT */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Discount (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount === 0 ? "" : discount}
                      placeholder="0"
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Delivery (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={deliveryCharge === 0 ? "" : deliveryCharge}
                      placeholder="0"
                      onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      VAT / Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={vatPercent === 0 ? "" : vatPercent}
                      placeholder="0%"
                      onChange={(e) => setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
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
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      {showNotesInput ? "Hide Notes" : "+ Order Notes"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { id: "cash", label: "Cash", activeBg: "bg-emerald-600 text-white border-emerald-600 shadow-sm" },
                      { id: "bkash", label: "bKash", activeBg: "bg-[#e2136e] text-white border-[#e2136e] shadow-sm" },
                      { id: "nagad", label: "Nagad", activeBg: "bg-[#f7941d] text-white border-[#f7941d] shadow-sm" },
                      { id: "card", label: "Card / POS", activeBg: "bg-blue-600 text-white border-blue-600 shadow-sm" },
                      { id: "cod", label: "COD", activeBg: "bg-purple-600 text-white border-purple-600 shadow-sm" },
                      { id: "bank_transfer", label: "Bank", activeBg: "bg-sky-600 text-white border-sky-600 shadow-sm" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center truncate ${
                          paymentMethod === m.id
                            ? m.activeBg
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Tendered & Change Return (Shown when Cash is selected) */}
                {paymentMethod === "cash" && (
                  <div className="p-2.5 rounded-xl bg-background border border-border space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                        <TbCurrencyTaka size={14} className="text-emerald-500" /> Cash Tendered:
                      </span>
                      <input
                        type="number"
                        placeholder="Received ৳"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value ? parseFloat(e.target.value) : "")}
                        className="w-28 px-2 py-1 text-xs font-mono font-bold bg-muted border border-border rounded-lg text-right text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {typeof cashTendered === "number" && cashTendered >= grandTotal && (
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-500 pt-1 border-t border-border/50">
                        <span>Change Return:</span>
                        <span className="font-mono text-sm">৳{changeDue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Order Notes */}
                {showNotesInput && (
                  <input
                    type="text"
                    placeholder="Invoice remarks or customer notes..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary animate-fadeIn"
                  />
                )}

                {/* Payment Status Segmented Control */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground">Payment Status:</span>
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("paid")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        paymentStatus === "paid"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Check size={12} /> Paid / Received
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("pending")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        paymentStatus === "pending"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Clock size={12} /> Due / Pending
                    </button>
                  </div>
                </div>

                {/* Receipt Totals Summary */}
                <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({totalItemCount} items)</span>
                    <span className="font-mono font-bold text-foreground">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>Discount</span>
                      <span className="font-mono">-৳{discount.toLocaleString()}</span>
                    </div>
                  )}

                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Charge</span>
                      <span className="font-mono font-bold text-foreground">+৳{deliveryCharge.toLocaleString()}</span>
                    </div>
                  )}

                  {vatAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>VAT ({vatPercent}%)</span>
                      <span className="font-mono font-bold text-foreground">+৳{vatAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-heading font-black text-sm text-foreground">Grand Total:</span>
                    <span className="font-mono font-black text-2xl text-primary">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  disabled={isSubmitting || cartItems.length === 0}
                  onClick={handleSubmitOrder}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] border border-white/10"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="w-4 h-4 text-white" />
                      <span>Completing POS Sale...</span>
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

      {/* ========================================================= */}
      {/* INSTANT INVOICE SLIDEOVER AFTER ORDER COMPLETE            */}
      {/* ========================================================= */}
      {createdInvoice && (
        <InvoiceSlideOver
          selectedInvoice={createdInvoice}
          onClose={() => setCreatedInvoice(null)}
          formatMethod={(m: string) => {
            const map: Record<string, string> = {
              bkash: "bKash",
              nagad: "Nagad",
              cod: "Cash on Delivery",
              card: "Card / POS",
              cash: "Cash",
              bank_transfer: "Bank Transfer",
            };
            return map[m?.toLowerCase()] || m?.toUpperCase() || "N/A";
          }}
          statusBadge={(s: string) => (
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 font-black">
              {s?.toUpperCase() || "PAID"}
            </Badge>
          )}
        />
      )}
    </DashboardLayout>
  );
}

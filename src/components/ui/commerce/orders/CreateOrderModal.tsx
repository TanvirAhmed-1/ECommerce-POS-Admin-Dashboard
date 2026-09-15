"use client";

import React, { useState, useMemo } from "react";
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
  DollarSign,
  Tag,
  Truck,
} from "lucide-react";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useCreateAdminOrderMutation } from "@/redux/features/order/orderApi";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

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
  // Product Search State
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [itemQty, setItemQty] = useState(1);

  // Cart / Order Items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Customer Details
  const [customerType, setCustomerType] = useState<"guest" | "registered">("guest");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [deliveryType, setDeliveryType] = useState<"home_delivery" | "pickup" | "pos_takeaway">("pos_takeaway");

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

  // RTK Queries & Mutations
  const { data: productsRes, isLoading: isProductsLoading } = useGetAllProductsQuery({
    admin: true,
    limit: 100,
  });
  const [createAdminOrder, { isLoading: isSubmitting }] = useCreateAdminOrderMutation();

  const products: any[] = useMemo(() => {
    if (Array.isArray(productsRes?.data?.data)) return productsRes.data.data;
    if (Array.isArray(productsRes?.data)) return productsRes.data;
    if (Array.isArray(productsRes)) return productsRes;
    return [];
  }, [productsRes]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    if (!productSearch.trim()) return products.slice(0, 20);
    const q = productSearch.toLowerCase();
    return products.filter((p: any) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchCode = p.productCode?.toLowerCase().includes(q);
      const matchBarcode = p.barcode?.toLowerCase().includes(q);
      return matchName || matchSku || matchCode || matchBarcode;
    });
  }, [products, productSearch]);


  // Handle Product Select
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setItemQty(1);
    if (product.hasVariants && product.productVariants && product.productVariants.length > 0) {
      setSelectedVariant(product.productVariants[0]);
    } else {
      setSelectedVariant(null);
    }
  };

  // Helper for variant display name
  const getVariantLabel = (variant: any) => {
    if (!variant) return "Standard Product";
    if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
      return variant.attributes
        .map((a: any) => `${a.attribute?.name || a.attribute || "Spec"}: ${a.value}`)
        .join(" | ");
    }
    return variant.sku || "Variation";
  };

  // Add Item to Order Cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const isVariantProduct = selectedProduct.hasVariants && selectedProduct.productVariants?.length > 0;
    if (isVariantProduct && !selectedVariant) {
      toast.error("Please select a product variant!");
      return;
    }

    const currentStock = isVariantProduct
      ? selectedVariant?.stock ?? 0
      : selectedProduct.totalStock ?? 0;

    if (currentStock <= 0) {
      toast.error("Selected item is out of stock!");
      return;
    }

    if (itemQty > currentStock) {
      toast.error(`Only ${currentStock} units available in stock!`);
      return;
    }

    const price = isVariantProduct
      ? selectedVariant.price || selectedProduct.salePrice || selectedProduct.basePrice || 0
      : selectedProduct.salePrice || selectedProduct.basePrice || 0;

    const sku = isVariantProduct
      ? selectedVariant.sku || selectedProduct.sku || "SKU"
      : selectedProduct.sku || "SKU";

    const variantLabel = getVariantLabel(selectedVariant);

    // Check if already in cart
    const existingIndex = cartItems.findIndex((item) => {
      if (isVariantProduct) {
        return (
          item.product._id === selectedProduct._id &&
          item.variant?._id === selectedVariant?._id
        );
      }
      return item.product._id === selectedProduct._id;
    });

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + itemQty;
      if (newQty > currentStock) {
        toast.error(`Cannot exceed available stock (${currentStock})!`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setCartItems(updated);
      toast.success(`Updated ${selectedProduct.name} quantity`);
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          product: selectedProduct,
          variant: isVariantProduct ? selectedVariant : undefined,
          quantity: itemQty,
          price,
          sku,
          variantLabel,
        },
      ]);
      toast.success(`Added ${selectedProduct.name} to order`);
    }

    // Reset selection
    setSelectedProduct(null);
    setSelectedVariant(null);
    setItemQty(1);
  };

  // Remove from cart
  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item quantity in cart
  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const item = cartItems[index];
    const maxStock = item.variant ? item.variant.stock ?? 999 : item.product.totalStock ?? 999;
    if (newQty > maxStock) {
      toast.error(`Only ${maxStock} units available!`);
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
  };

  // Update item price override
  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;
    const updated = [...cartItems];
    updated[index].price = newPrice;
    setCartItems(updated);
  };

  // Calculations
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

  // Handle Order Submission
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one product to the order!");
      return;
    }

    if (!fullName.trim() && customerType === "guest") {
      toast.error("Please enter customer name!");
      return;
    }

    const payload = {
      customerInfo: {
        fullName: fullName || "Walk-in Customer",
        phone: phone || "01700000000",
        email: email || undefined,
        address: address || "Store Outlet",
        city: city || "Dhaka",
      },
      shippingAddress: {
        fullName: fullName || "Walk-in Customer",
        phone: phone || "01700000000",
        address: address || "Store Outlet",
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
      toast.success("Order & Invoice created successfully!");
      if (onOrderCreated) {
        onOrderCreated(res.data, res.invoice);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to create order");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-heading font-black text-base text-foreground tracking-tight flex items-center gap-2">
                Create POS Order / Quick Sale
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  Live Stock Sync
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Rapidly create orders, deduct stock in real time, and generate instant invoices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Left Column: Product Selection & Live Variant Picker (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-5 overflow-y-auto">
            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Search size={14} className="text-primary" /> Select Products
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, or barcode..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Product Quick Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Product Catalog ({filteredProducts.length} items)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {isProductsLoading ? (
                  <div className="col-span-2 py-8 flex justify-center">
                    <Spinner className="w-6 h-6 text-primary" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    No products found matching your search.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedProduct?._id === product._id;
                    const stock = product.totalStock ?? 0;
                    const isOutOfStock = stock <= 0;

                    return (
                      <div
                        key={product._id}
                        onClick={() => handleSelectProduct(product)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : isOutOfStock
                            ? "border-border/50 bg-muted/20 opacity-60 hover:opacity-100"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted/60 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="font-mono font-bold text-primary">
                              ৳{product.salePrice || product.basePrice || 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              SKU: {product.sku || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isOutOfStock ? (
                              <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded">
                                Out of Stock
                              </span>
                            ) : stock < 5 ? (
                              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                                Low Stock: {stock}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                In Stock: {stock}
                              </span>
                            )}
                            {product.hasVariants && (
                              <span className="text-[9px] font-semibold text-sky-500 bg-sky-500/10 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Layers size={8} /> Variants
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Product Variant Picker & Add to Order Bar */}
            {selectedProduct && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3.5 animate-fadeIn">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Configure Item
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>

                {/* Variant Options Selection */}
                {selectedProduct.hasVariants &&
                selectedProduct.productVariants &&
                selectedProduct.productVariants.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground">
                      Select Variant / Specification:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {selectedProduct.productVariants.map((variant: any) => {
                        const isVarSelected = selectedVariant?._id === variant._id;
                        const vStock = variant.stock ?? 0;
                        const isVOutOfStock = vStock <= 0;

                        return (
                          <div
                            key={variant._id}
                            onClick={() => !isVOutOfStock && setSelectedVariant(variant)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isVarSelected
                                ? "border-primary bg-primary/15 text-primary font-bold shadow-sm"
                                : isVOutOfStock
                                ? "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed"
                                : "border-border bg-card hover:border-primary/40 text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold truncate">{getVariantLabel(variant)}</span>
                              <span className="font-mono font-bold">
                                ৳{variant.price || selectedProduct.salePrice || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px]">
                              <span className="text-muted-foreground font-mono">
                                {variant.sku || "VAR-SKU"}
                              </span>
                              <span
                                className={`font-bold ${
                                  isVOutOfStock
                                    ? "text-rose-500"
                                    : vStock < 5
                                    ? "text-amber-500"
                                    : "text-emerald-500"
                                }`}
                              >
                                {isVOutOfStock ? "Out of stock" : `Stock: ${vStock}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Quantity Stepper & Add Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Qty:</span>
                    <div className="flex items-center border border-border rounded-lg bg-background">
                      <button
                        type="button"
                        onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-lg"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={itemQty}
                        onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center text-xs font-bold bg-transparent border-none focus:outline-none text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setItemQty((q) => q + 1)}
                        className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-r-lg"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground">Subtotal</span>
                      <p className="text-sm font-black text-foreground font-mono">
                        ৳
                        {(
                          (selectedVariant?.price ||
                            selectedProduct.salePrice ||
                            selectedProduct.basePrice ||
                            0) * itemQty
                        ).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus size={14} /> Add to Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details Section */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User size={14} className="text-primary" /> Customer & Delivery Details
                </label>
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setCustomerType("guest")}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      customerType === "guest"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Walk-in / Guest
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType("registered")}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      customerType === "registered"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Registered
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe / Walk-in"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    placeholder="Outlet / Shipping Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                    City / Area
                  </label>
                  <input
                    type="text"
                    placeholder="Dhaka"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Fulfillment Type:
                </span>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === "pos_takeaway"}
                      onChange={() => {
                        setDeliveryType("pos_takeaway");
                        setDeliveryCharge(0);
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    POS Takeaway / Store Pickup
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === "home_delivery"}
                      onChange={() => {
                        setDeliveryType("home_delivery");
                        setDeliveryCharge(60);
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    Home Delivery
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items Summary & Billing Checkout (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-muted/10 flex flex-col justify-between space-y-5 overflow-y-auto">
            {/* Cart Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-primary" />
                  <h3 className="font-heading font-black text-sm text-foreground uppercase tracking-wider">
                    Order Summary ({cartItems.length} items)
                  </h3>
                </div>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-muted-foreground/50" />
                    <p className="text-xs font-semibold">No items added to the order yet</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      Search and click products on the left to add items.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-border bg-card shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] text-primary font-semibold truncate">
                            {item.variantLabel}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">Price:</span>
                          <span className="font-mono font-bold text-foreground">৳{item.price}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                            className="p-1 hover:bg-card rounded text-muted-foreground"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center font-bold font-mono text-[11px]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                            className="p-1 hover:bg-card rounded text-muted-foreground"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-foreground">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Calculations & Payment Options */}
            <div className="space-y-4 pt-3 border-t border-border">
              {/* Discounts, Delivery & VAT Inputs */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    Discount (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    placeholder="0"
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    Delivery (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharge || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    VAT / Tax (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vatPercent || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "cash", label: "Cash" },
                    { id: "bkash", label: "bKash" },
                    { id: "nagad", label: "Nagad" },
                    { id: "card", label: "Card / POS" },
                    { id: "cod", label: "COD" },
                    { id: "bank_transfer", label: "Bank" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Payment Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("paid")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentStatus === "paid"
                        ? "bg-emerald-500 text-white shadow"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ✓ Paid / Received
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("pending")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentStatus === "pending"
                        ? "bg-amber-500 text-white shadow"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pending / Due
                  </button>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-rose-500">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery Fee:</span>
                    <span className="font-mono">+৳{deliveryCharge.toLocaleString()}</span>
                  </div>
                )}
                {vatAmount > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>VAT ({vatPercent}%):</span>
                    <span className="font-mono">+৳{vatAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-bold text-sm text-foreground">Grand Total:</span>
                  <span className="font-mono font-black text-lg text-primary">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Final Submit Button */}
              <button
                type="button"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleSubmitOrder}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 text-white" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Complete Sale & Generate Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

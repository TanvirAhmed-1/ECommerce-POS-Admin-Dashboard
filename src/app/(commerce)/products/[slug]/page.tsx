"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetSingleProductQuery,
} from "@/redux/features/product/productApi";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveCartItemMutation,
} from "@/redux/features/cart/cartApi";
import {
  useCheckoutOrderMutation,
} from "@/redux/features/order/orderApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  ShoppingCart,
  Plus,
  Minus,
  Tag,
  ChevronLeft,
  ShoppingBag,
  X,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react";

function ProductDetailsContent() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Queries & Mutations
  const { data: productRes, isLoading: isProductLoading, error: productError } = useGetSingleProductQuery(slug);
  const { data: cartRes, refetch: refetchCart } = useGetCartQuery(undefined);
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [updateCartQuantity] = useUpdateCartQuantityMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [checkoutOrder, { isLoading: isCheckingOut }] = useCheckoutOrderMutation();

  const product = productRes?.data;

  // Local States
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad" | "online_payment">("cod");
  const [deliveryType, setDeliveryType] = useState<"home_delivery" | "pickup">("home_delivery");

  // Setup initial selections from URL query params or fallback to first variant attributes
  useEffect(() => {
    if (product) {
      if (product.thumbnail) {
        setActiveImage(product.thumbnail);
      }
      
      const initialOptions: { [key: string]: string } = {};

      if (product.hasVariants && product.productVariants?.length > 0) {
        const firstVariant = product.productVariants[0];
        
        // Populate option values checking search params first
        firstVariant.attributes.forEach((attrEntry: any) => {
          const name = attrEntry.attribute?.name || "Option";
          const paramKey = name.toLowerCase().replace(/\s+/g, "_");
          const urlVal = searchParams.get(paramKey);
          
          if (urlVal) {
            initialOptions[name] = urlVal;
          } else {
            initialOptions[name] = attrEntry.value;
          }
        });
      }
      setSelectedOptions(initialOptions);
    }
  }, [product, searchParams]);

  // Sync state changes with URL query parameters in real-time
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(selectedOptions).length > 0) {
      const url = new URL(window.location.href);
      Object.entries(selectedOptions).forEach(([key, val]) => {
        const paramKey = key.toLowerCase().replace(/\s+/g, "_");
        url.searchParams.set(paramKey, val);
      });
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [selectedOptions]);

  // Extract unique attributes and their values
  const attributeGroups = useMemo(() => {
    if (!product?.productVariants) return [];
    
    const groups: { [key: string]: { id: string; name: string; values: string[] } } = {};
    
    product.productVariants.forEach((variant: any) => {
      if (!variant.isActive) return;
      variant.attributes.forEach((attrEntry: any) => {
        const attrId = attrEntry.attribute?._id || attrEntry.attribute;
        const attrName = attrEntry.attribute?.name || "Option";
        
        if (!groups[attrName]) {
          groups[attrName] = { id: attrId, name: attrName, values: [] };
        }
        if (!groups[attrName].values.includes(attrEntry.value)) {
          groups[attrName].values.push(attrEntry.value);
        }
      });
    });
    
    return Object.values(groups);
  }, [product]);

  // Find active variant matching selections
  const activeVariant = useMemo(() => {
    if (!product?.productVariants || product.productVariants.length === 0) return null;
    
    return product.productVariants.find((variant: any) => {
      if (!variant.isActive) return false;
      return variant.attributes.every((attrEntry: any) => {
        const name = attrEntry.attribute?.name || "Option";
        return selectedOptions[name] === attrEntry.value;
      });
    });
  }, [product, selectedOptions]);

  // Update active image when selected variant images exist
  useEffect(() => {
    if (activeVariant?.images?.length > 0) {
      setActiveImage(activeVariant.images[0]);
    }
  }, [activeVariant]);

  // Compute pricing metadata
  const pricing = useMemo(() => {
    if (!product) return { price: 0, hasDiscount: false, originalPrice: 0, sku: "N/A", stock: 0, discountText: "" };
    
    const baseVal = activeVariant ? activeVariant.price : product.salePrice;
    const originalVal = activeVariant ? activeVariant.price : product.basePrice;
    
    let discountAmt = product.productDiscount || 0;
    let finalVal = baseVal;
    
    if (discountAmt > 0) {
      if (product.discountType === "percentage") {
        finalVal = baseVal - (baseVal * discountAmt) / 100;
      } else {
        finalVal = baseVal - discountAmt;
      }
    }
    
    return {
      price: finalVal,
      originalPrice: baseVal,
      hasDiscount: discountAmt > 0,
      discountText: product.discountType === "percentage" ? `${discountAmt}% OFF` : `৳${discountAmt} OFF`,
      sku: activeVariant ? activeVariant.sku : product.sku || "N/A",
      stock: activeVariant ? activeVariant.stock : product.totalStock || 0,
    };
  }, [product, activeVariant]);

  const cartSummary = useMemo(() => {
    if (!cartRes?.data) return { items: [], totalAmount: 0, totalItems: 0 };
    return cartRes.data;
  }, [cartRes]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imagesList = [product.thumbnail];
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: string) => {
        if (img && !imagesList.includes(img)) imagesList.push(img);
      });
    }
    if (activeVariant?.images) {
      activeVariant.images.forEach((img: string) => {
        if (img && !imagesList.includes(img)) imagesList.push(img);
      });
    }
    return imagesList;
  }, [product, activeVariant]);

  const handleAddToCart = async () => {
    if (product?.hasVariants && !activeVariant) {
      toast.error("Please select all variant combinations!");
      return;
    }

    if (pricing.stock <= 0) {
      toast.error("This product is currently out of stock!");
      return;
    }

    if (quantity > pricing.stock) {
      toast.error(`Only ${pricing.stock} items available in stock.`);
      return;
    }

    const toastId = toast.loading("Adding item to cart...");
    try {
      await addToCart({
        product: product._id,
        variant: activeVariant?._id || product._id,
        quantity,
      }).unwrap();
      
      toast.success("Successfully added to cart!", { id: toastId });
      refetchCart();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to add to cart.", { id: toastId });
    }
  };

  const handleUpdateQty = async (itemId: string, currentQty: number, maxStock: number, isIncrement: boolean) => {
    if (isIncrement && currentQty >= maxStock) {
      toast.error("Reached maximum stock limit!");
      return;
    }
    
    const toastId = toast.loading("Updating quantity...");
    try {
      await updateCartQuantity({
        variantId: itemId,
        action: isIncrement ? "increment" : "decrement"
      }).unwrap();
      toast.success("Cart updated!", { id: toastId });
      refetchCart();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update quantity", { id: toastId });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const toastId = toast.loading("Removing item...");
    try {
      await removeCartItem(itemId).unwrap();
      toast.success("Item removed from cart!", { id: toastId });
      refetchCart();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to remove item", { id: toastId });
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      toast.error("Please fill in all shipping details!");
      return;
    }

    const toastId = toast.loading("Placing your order...");
    try {
      const payload = {
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        },
        paymentMethod,
        deliveryType,
      };

      const result = await checkoutOrder(payload).unwrap();
      
      if (paymentMethod === "bkash" && result?.data) {
        toast.success("Order created! Redirecting to bKash payment...", { id: toastId });
        window.location.href = result.data;
      } else {
        toast.success("Order placed successfully!", { id: toastId });
        setFullName("");
        setPhone("");
        setAddress("");
        setCity("");
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        refetchCart();
        router.push("/orders");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to create order.", { id: toastId });
    }
  };

  if (isProductLoading) {
    return (
      <div className="flex h-[75vh] w-full items-center justify-center">
        <Loader size={50} />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle size={48} className="text-rose-500 animate-bounce" />
        <h3 className="text-lg font-bold text-foreground">Product Not Found</h3>
        <p className="text-xs text-muted-foreground">The product you are trying to view does not exist or has been removed.</p>
        <Link href="/products" className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-lg flex items-center justify-center">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in p-1 md:p-4 pb-20">
      
      {/* Navigation Breadcrumbs */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <Link href="/products" className="hover:text-primary transition-colors">Catalog</Link>
          <span className="opacity-50">/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative h-10 px-4 rounded-xl border border-border bg-card hover:bg-muted/40 text-xs font-bold text-foreground flex items-center gap-2 cursor-pointer transition-all"
        >
          <ShoppingCart size={15} className="text-primary" />
          <span>My Cart</span>
          {cartSummary.totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center animate-scale-in">
              {cartSummary.totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Showcase Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card rounded-3xl border border-border/80 overflow-hidden bg-card/40 relative aspect-square flex items-center justify-center p-6 group">
            <img
              src={activeImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"}
              alt={product.name}
              className="max-h-[460px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600";
              }}
            />
            
            {pricing.hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg">
                {pricing.discountText}
              </span>
            )}
          </div>

          {/* Thumbnail Carousel Row */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1 custom-scrollbar">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border bg-card transition-all cursor-pointer ${
                    activeImage === imgUrl ? "border-primary ring-2 ring-primary/20 scale-95" : "border-border hover:border-zinc-400"
                  }`}
                >
                  <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Ratings, Pricing, Variants & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                {product.category?.name || "Templates"}
              </span>
              {product.brand?.name && (
                <span className="text-xs text-muted-foreground font-semibold">
                  by <strong className="text-foreground">{product.brand.name}</strong>
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight font-heading leading-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center text-amber-500">
                {"★".repeat(Math.round(product.averageRating || 5))}
                {"☆".repeat(5 - Math.round(product.averageRating || 5))}
              </div>
              <span>({product.totalReviews || 0} reviews)</span>
              <span className="opacity-50">•</span>
              <span className="font-mono text-[10px]">SKU: {pricing.sku}</span>
            </div>
          </div>

          {/* Price Cards */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Unit Price</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">
                  ৳{pricing.price.toFixed(2)}
                </span>
                {pricing.hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    ৳{pricing.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-muted-foreground mt-1 block">Prices exclude {product.vat}% VAT</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Availability</span>
              <div className="mt-1">
                {pricing.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({pricing.stock} left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400 text-[10px] font-bold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Variant Selector Badges */}
          {product.hasVariants && attributeGroups.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/40">
              {attributeGroups.map((group) => {
                const selectedVal = selectedOptions[group.name];
                const isColor = group.name.toLowerCase() === "color" || group.name.toLowerCase() === "core color";
                
                return (
                  <div key={group.name} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      <Tag size={12} className="text-primary" />
                      <span>{group.name}</span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-black">
                        {group.values.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {group.values.map((val) => {
                        const isSelected = selectedVal === val;
                        
                        // For color options, try to get the matching variant's image preview
                        let colorImageUrl = "";
                        if (isColor && product.productVariants) {
                          const matchingVariant = product.productVariants.find((v: any) =>
                            v.isActive && v.attributes?.some((a: any) => (a.attribute?.name || "").toLowerCase() === "color" && a.value === val)
                          );
                          if (matchingVariant?.images?.[0]) {
                            colorImageUrl = matchingVariant.images[0];
                          }
                        }

                        if (isColor && colorImageUrl) {
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [group.name]: val,
                                });
                              }}
                              className={`relative w-16 h-16 rounded-xl border overflow-hidden transition-all cursor-pointer bg-zinc-950 ${
                                isSelected
                                  ? "border-primary ring-2 ring-primary/20 scale-95"
                                  : "border-border hover:border-zinc-500 opacity-80 hover:opacity-100"
                              }`}
                              title={val}
                            >
                              <img
                                src={colorImageUrl}
                                alt={val}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-black text-white text-center py-0.5 truncate px-1 uppercase tracking-tighter">
                                {val}
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setSelectedOptions({
                                ...selectedOptions,
                                [group.name]: val,
                              });
                            }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all shadow-sm ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-primary/20 scale-95"
                                : "bg-card text-muted-foreground border-border hover:border-zinc-400 hover:text-foreground"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Variant Validation Check */}
              {Object.keys(selectedOptions).length === attributeGroups.length && !activeVariant && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-500 flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>This combination of attributes is currently unavailable.</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector & Order Buttons */}
          <div className="pt-6 border-t border-border/40 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg bg-card h-10 px-1">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || pricing.stock <= 0}
                  className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-xs font-bold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(pricing.stock, q + 1))}
                  disabled={quantity >= pricing.stock || pricing.stock <= 0}
                  className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={pricing.stock <= 0 || (product.hasVariants && !activeVariant) || isAddingToCart}
                className="flex-1 h-12 bg-card hover:bg-muted/40 border border-border text-foreground font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <Spinner className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <ShoppingCart size={15} className="text-primary" />
                )}
                <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (product?.hasVariants && !activeVariant) {
                    toast.error("Please select all variant combinations!");
                    return;
                  }
                  if (pricing.stock <= 0) {
                    toast.error("Product is out of stock!");
                    return;
                  }
                  handleAddToCart().then(() => {
                    setIsCheckoutOpen(true);
                  });
                }}
                disabled={pricing.stock <= 0 || (product.hasVariants && !activeVariant)}
                className="flex-1 h-12 bg-primary text-white font-black text-xs uppercase rounded-xl hover:opacity-95 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={15} />
                <span>Order Now</span>
              </button>
            </div>
          </div>

          {/* Details Card */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card/10 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={13} className="text-primary" />
              Product Details
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {product.description || product.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* CART DRAWER SLIDE-OVER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-0 animate-fade-in">
          <div className="absolute inset-0 -z-10" onClick={() => setIsCartOpen(false)} />

          <div className="w-full max-w-[420px] h-full bg-card border-l border-border flex flex-col justify-between relative shadow-2xl animate-slide-in">
            <div className="h-16 px-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-primary" size={18} />
                <h4 className="font-heading text-sm font-bold text-foreground">Shopping Cart</h4>
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black">
                  {cartSummary.totalItems} Items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              {cartSummary.items && cartSummary.items.length > 0 ? (
                cartSummary.items.map((item: any) => {
                  const pImageUrl = item.product?.thumbnail || "";
                  const itemPrice = item.price || 0;
                  const maxStock = item.variant?.stock || 0;

                  return (
                    <div
                      key={item.variant?._id || item.variant}
                      className="glass-card p-3 rounded-xl border border-border/60 bg-muted/5 flex gap-3 items-center group relative hover:border-border transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center">
                        <img src={pImageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="text-[11px] font-bold text-foreground truncate">{item.product?.name}</h5>
                        
                        {item.variant?.size || item.variant?.color ? (
                          <div className="flex flex-wrap gap-1">
                            {item.variant?.size && (
                              <span className="text-[8px] font-extrabold px-1 py-0.25 bg-primary/10 text-primary rounded">
                                Size: {item.variant.size}
                              </span>
                            )}
                            {item.variant?.color && (
                              <span className="text-[8px] font-extrabold px-1 py-0.25 bg-violet-500/10 text-violet-500 rounded">
                                Color: {item.variant.color}
                              </span>
                            )}
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-foreground">৳{itemPrice.toFixed(2)}</span>
                          
                          <div className="flex items-center border border-border/80 rounded-md h-7 px-0.5 bg-card scale-90">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.variant?._id || item.variant, item.quantity, maxStock, false)}
                              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-[10px] font-bold text-foreground">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.variant?._id || item.variant, item.quantity, maxStock, true)}
                              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.variant?._id || item.variant)}
                        className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 absolute top-2 right-2 cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-center text-muted-foreground">
                  <ShoppingCart size={32} className="opacity-30" />
                  <p className="text-xs font-bold">Your cart is empty</p>
                  <p className="text-[10px]">Add products to your cart to see them here.</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border bg-muted/20 space-y-4">
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>৳{cartSummary.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground text-sm pt-2 border-t border-border/40 font-extrabold">
                  <span>Total Amount</span>
                  <span className="text-primary text-base font-black">৳{cartSummary.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!cartSummary.items || cartSummary.items.length === 0) {
                    toast.error("Your cart is empty!");
                    return;
                  }
                  setIsCheckoutOpen(true);
                }}
                disabled={!cartSummary.items || cartSummary.items.length === 0}
                className="w-full h-11 bg-primary text-white font-black text-xs uppercase rounded-xl hover:opacity-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={14} />
                <span>Place Order Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT BILLING DETAILS MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-[460px] p-6 rounded-2xl border border-border bg-card shadow-2xl relative animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
            
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Truck size={16} />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">Shipping & Billing</h4>
                <p className="text-[10px] text-muted-foreground">Provide delivery credentials to place order</p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <UserIcon size={10} /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary transition-all text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Phone size={10} /> Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary transition-all text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} /> City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} /> Delivery Type
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e: any) => setDeliveryType(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary cursor-pointer text-foreground"
                  >
                    <option value="home_delivery">Home Delivery</option>
                    <option value="pickup">Store Pickup</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} /> Shipping Address *
                </label>
                <textarea
                  required
                  placeholder="House No, Road No, Area details..."
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary transition-all text-foreground resize-none"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CreditCard size={10} /> Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-muted/10 transition-all select-none ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-primary"
                    />
                    <span className="text-[10px] font-bold text-foreground">Cash on Delivery</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-muted/10 transition-all select-none ${
                    paymentMethod === "bkash" ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === "bkash"}
                      onChange={() => setPaymentMethod("bkash")}
                      className="text-primary"
                    />
                    <span className="text-[10px] font-bold text-foreground">bKash (Bkash URL)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-primary/15 disabled:opacity-60 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <Spinner className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  <span>{isCheckingOut ? "Placing Order..." : "Confirm & Checkout"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex h-[75vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      }>
        <ProductDetailsContent />
      </Suspense>
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllProductsQuery,
  useUpdateProductMutation,
} from "@/redux/features/product/productApi";
import {
  useGetAllVariantsQuery,
  useUpdateVariantMutation,
  useUpdateVariantStockMutation,
} from "@/redux/features/variant/variantApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Download,
  RefreshCw,
  Boxes,
} from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import StockStatsCards from "@/components/ui/commerce/stocks/StockStatsCards";
import StockAdjustmentModal from "@/components/ui/commerce/stocks/StockAdjustmentModal";
import StockGroupedView from "@/components/ui/commerce/stocks/StockGroupedView";
import StockFlatTable from "@/components/ui/commerce/stocks/StockFlatTable";

export default function StocksPage() {
  // RTK Queries & Mutations
  const {
    data: productsRes,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useGetAllProductsQuery({});

  const {
    data: variantsRes,
    isLoading: isVariantsLoading,
    refetch: refetchVariants,
  } = useGetAllVariantsQuery({});

  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [updateVariant, { isLoading: isUpdatingVariant }] = useUpdateVariantMutation();
  const [updateVariantStock, { isLoading: isUpdatingVariantStock }] = useUpdateVariantStockMutation();

  const isUpdating = isUpdatingProduct || isUpdatingVariant || isUpdatingVariantStock;

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"All" | "Out" | "Low" | "In">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  // Modal State for stock adjustment
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedVariantForAdjust, setSelectedVariantForAdjust] = useState<any | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editStock, setEditStock] = useState<number | "">("");
  const [editSku, setEditSku] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load localStorage fallback products
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenith_products");
      if (saved) {
        try {
          setLocalProducts(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const products = useMemo(() => {
    if (productsRes?.data) {
      if (Array.isArray(productsRes.data.data)) return productsRes.data.data;
      if (Array.isArray(productsRes.data)) return productsRes.data;
    }
    return localProducts;
  }, [productsRes, localProducts]);

  // Extract unique categories for filter
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      const catName =
        typeof p.category === "string"
          ? p.category
          : p.category?.name || "Uncategorized";
      if (catName) set.add(catName);
    });
    return Array.from(set);
  }, [products]);

  // Build full variation dataset
  const flatVariants = useMemo(() => {
    const list: any[] = [];

    products.forEach((prod: any) => {
      const prodId = prod._id || prod.id;
      const prodName = prod.name;
      const prodSlug = prod.slug;
      const prodImage = prod.thumbnail || prod.images?.[0] || "";
      const prodCat =
        typeof prod.category === "string"
          ? prod.category
          : prod.category?.name || "Uncategorized";
      const prodBrand =
        typeof prod.brand === "string"
          ? prod.brand
          : prod.brand?.name || "";

      const rawVariants = prod.variants || prod.productVariants || [];

      if (rawVariants.length > 0) {
        rawVariants.forEach((v: any) => {
          let attrMap: Record<string, string> = {};
          if (Array.isArray(v.attributes)) {
            v.attributes.forEach((a: any) => {
              const k = a.attribute?.name || a.name || "Option";
              if (k && a.value) attrMap[k] = a.value;
            });
          } else if (v.attributes && typeof v.attributes === "object") {
            attrMap = v.attributes;
          }

          const nameParts = Object.values(attrMap);
          const varName =
            nameParts.length > 0
              ? nameParts.join(" / ")
              : v.name || v.sku || "Variation Option";

          list.push({
            productId: prodId,
            productName: prodName,
            productSlug: prodSlug,
            productImage: v.images?.[0] || prodImage,
            productCategory: prodCat,
            productBrand: prodBrand,
            parentProduct: prod,
            variantId: v._id || v.id,
            variantName: varName,
            sku: v.sku || `${prod.slug?.toUpperCase()}-VAR`,
            price: Number(v.price) || Number(prod.salePrice) || Number(prod.basePrice) || 0,
            stock: Number(v.stock) || 0,
            attributes: attrMap,
            isBaseProduct: false,
          });
        });
      } else {
        // Standard single product with base stock
        list.push({
          productId: prodId,
          productName: prodName,
          productSlug: prodSlug,
          productImage: prodImage,
          productCategory: prodCat,
          productBrand: prodBrand,
          parentProduct: prod,
          variantId: `${prodId}-base`,
          variantName: "Standard Product Option",
          sku: prod.sku || `${prod.slug?.toUpperCase()}-BASE`,
          price: Number(prod.salePrice) || Number(prod.basePrice) || 0,
          stock: Number(prod.totalStock !== undefined ? prod.totalStock : (prod.stock || 0)),
          attributes: {},
          isBaseProduct: true,
        });
      }
    });

    return list;
  }, [products]);

  // Filtered variants
  const filteredVariants = useMemo(() => {
    return flatVariants.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        item.variantName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.productCategory.toLowerCase().includes(q) ||
        (item.productBrand && item.productBrand.toLowerCase().includes(q));

      let matchesStock = true;
      if (stockFilter === "Out") {
        matchesStock = item.stock === 0;
      } else if (stockFilter === "Low") {
        matchesStock = item.stock > 0 && item.stock < 10;
      } else if (stockFilter === "In") {
        matchesStock = item.stock >= 10;
      }

      let matchesCategory = true;
      if (categoryFilter !== "All") {
        matchesCategory = item.productCategory === categoryFilter;
      }

      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [flatVariants, searchQuery, stockFilter, categoryFilter]);

  // Grouped by product structure
  const groupedProducts = useMemo(() => {
    const map = new Map<string, any>();

    filteredVariants.forEach((v) => {
      if (!map.has(v.productId)) {
        map.set(v.productId, {
          productId: v.productId,
          productName: v.productName,
          productSlug: v.productSlug,
          productImage: v.parentProduct?.thumbnail || v.productImage,
          productCategory: v.productCategory,
          productBrand: v.productBrand,
          totalStock: 0,
          parentProduct: v.parentProduct,
          variants: [],
        });
      }

      const pGroup = map.get(v.productId);
      pGroup.variants.push(v);
      pGroup.totalStock += v.stock;
    });

    return Array.from(map.values());
  }, [filteredVariants]);

  // Calculate overall metrics
  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalValuation = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    flatVariants.forEach((v) => {
      totalUnits += v.stock;
      totalValuation += v.stock * v.price;
      if (v.stock === 0) outOfStock++;
      else if (v.stock < 10) lowStock++;
      else inStock++;
    });

    return {
      totalVariants: flatVariants.length,
      totalUnits,
      totalValuation,
      inStockCount: inStock,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
    };
  }, [flatVariants]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stockFilter, categoryFilter, viewMode]);

  // Paginated items
  const paginatedFlatVariants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVariants.slice(start, start + itemsPerPage);
  }, [filteredVariants, currentPage, itemsPerPage]);

  const paginatedGroupedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return groupedProducts.slice(start, start + itemsPerPage);
  }, [groupedProducts, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    const count = viewMode === "flat" ? filteredVariants.length : groupedProducts.length;
    return Math.max(1, Math.ceil(count / itemsPerPage));
  }, [viewMode, filteredVariants.length, groupedProducts.length, itemsPerPage]);

  // Refresh handler
  const handleRefetch = () => {
    refetchProducts();
    refetchVariants();
    toast.success("Stock inventory synced!");
  };

  // Open Adjust Modal
  const handleOpenAdjustModal = (item: any) => {
    setSelectedVariantForAdjust(item);
    setAdjustModalOpen(true);
  };

  // Quick Inline Edit Controls
  const handleEditClick = (item: any) => {
    setEditingId(item.variantId);
    setEditPrice(item.price);
    setEditStock(item.stock);
    setEditSku(item.sku || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice("");
    setEditStock("");
    setEditSku("");
  };

  // Quick Delta Increment / Decrement (+1 / -1)
  const handleQuickDelta = async (item: any, delta: number) => {
    const newStock = Math.max(0, item.stock + delta);
    await applyStockUpdate(item, newStock, item.price, item.sku);
  };

  // Inline Save
  const handleSaveEdit = async (item: any) => {
    if (editPrice === "" || editStock === "") {
      toast.error("Price and Stock are required!");
      return;
    }
    await applyStockUpdate(item, Number(editStock), Number(editPrice), editSku.trim());
    handleCancelEdit();
  };

  // Confirm modal stock adjustment
  const handleConfirmModalAdjust = async (payload: {
    variantItem: any;
    mode: string;
    quantity: number;
    resultingStock: number;
    reason: string;
    note: string;
  }) => {
    await applyStockUpdate(
      payload.variantItem,
      payload.resultingStock,
      payload.variantItem.price,
      payload.variantItem.sku
    );
    setAdjustModalOpen(false);
    setSelectedVariantForAdjust(null);
  };

  // Master Stock Sync Function
  const applyStockUpdate = async (
    item: any,
    newStock: number,
    newPrice: number,
    newSku: string
  ) => {
    const toastId = toast.loading("Updating variation stock...");
    const parent = item.parentProduct;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(item.variantId);

    try {
      if (item.isBaseProduct) {
        // Base product update
        const updatedPayload = {
          ...parent,
          price: Number(newPrice),
          salePrice: Number(newPrice),
          stock: Number(newStock),
          totalStock: Number(newStock),
          sku: newSku,
        };

        const isApiAvailable = productsRes?.data !== undefined;
        if (isApiAvailable && parent._id) {
          await updateProduct({ id: parent._id, data: updatedPayload }).unwrap();
          toast.success(`Stock for "${item.productName}" updated to ${newStock}!`, { id: toastId });
          refetchProducts();
          refetchVariants();
        } else {
          const updatedList = localProducts.map((p) =>
            p._id === parent._id || p.id === parent.id ? updatedPayload : p
          );
          setLocalProducts(updatedList);
          localStorage.setItem("zenith_products", JSON.stringify(updatedList));
          toast.success(`Stock saved locally!`, { id: toastId });
        }
      } else {
        // Multi-variant update
        if (isMongoId) {
          // Direct backend variant update
          await updateVariant({
            id: item.variantId,
            data: {
              stock: Number(newStock),
              price: Number(newPrice),
              sku: newSku,
            },
          }).unwrap();
          toast.success(`Variation stock updated to ${newStock}!`, { id: toastId });
          refetchProducts();
          refetchVariants();
        } else {
          // Fallback: update parent product's variants array
          const rawVariants = parent.variants || parent.productVariants || [];
          const updatedVariants = rawVariants.map((v: any) => {
            if ((v._id || v.id) === item.variantId) {
              return {
                ...v,
                sku: newSku,
                price: Number(newPrice),
                stock: Number(newStock),
              };
            }
            return v;
          });

          const totalStock = updatedVariants.reduce(
            (sum: number, v: any) => sum + (Number(v.stock) || 0),
            0
          );

          const updatedPayload = {
            ...parent,
            variants: updatedVariants,
            totalStock,
          };

          const isApiAvailable = productsRes?.data !== undefined;
          if (isApiAvailable && parent._id) {
            await updateProduct({ id: parent._id, data: updatedPayload }).unwrap();
            toast.success(`Variation stock updated to ${newStock}!`, { id: toastId });
            refetchProducts();
            refetchVariants();
          } else {
            const updatedList = localProducts.map((p) =>
              p._id === parent._id || p.id === parent.id ? updatedPayload : p
            );
            setLocalProducts(updatedList);
            localStorage.setItem("zenith_products", JSON.stringify(updatedList));
            toast.success("Variation stock saved locally!", { id: toastId });
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to update stock.",
        { id: toastId }
      );
    }
  };

  // Export Stock CSV
  const handleExportCSV = () => {
    const headers = [
      "Product Name",
      "Variation Name",
      "SKU",
      "Category",
      "Brand",
      "Price",
      "Stock Level",
      "Status",
    ];

    const rows = filteredVariants.map((v) => [
      `"${v.productName.replace(/"/g, '""')}"`,
      `"${v.variantName.replace(/"/g, '""')}"`,
      `"${v.sku}"`,
      `"${v.productCategory}"`,
      `"${v.productBrand || "N/A"}"`,
      v.price.toFixed(2),
      v.stock,
      v.stock === 0 ? "Out of Stock" : v.stock < 10 ? "Low Stock" : "In Stock",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zenith_stock_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock inventory exported successfully!");
  };

  if (isProductsLoading || isVariantsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[75vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Commerce</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Stock Management</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Stock Management
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor, audit, and adjust product inventory variation-wise across all SKUs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefetch}
              disabled={isUpdating}
              className="h-9 px-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Sync Inventory"
            >
              <RefreshCw size={14} className={isUpdating ? "animate-spin" : ""} />
              <span>Sync</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="h-9 px-3.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Cards */}
        <StockStatsCards
          totalVariants={stats.totalVariants}
          totalUnits={stats.totalUnits}
          totalValuation={stats.totalValuation}
          inStockCount={stats.inStockCount}
          lowStockCount={stats.lowStockCount}
          outOfStockCount={stats.outOfStockCount}
          activeFilter={stockFilter}
          onFilterSelect={(f) => setStockFilter(f)}
        />

        {/* Toolbar & Filters */}
        <div className="glass-card p-4 rounded-2xl border border-border space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex bg-muted/80 p-0.5 rounded-xl border border-border self-start overflow-x-auto custom-scrollbar">
              {[
                { key: "All", label: "All Items" },
                { key: "In", label: `In Stock (${stats.inStockCount})` },
                { key: "Low", label: `Low Stock (${stats.lowStockCount})` },
                { key: "Out", label: `Out of Stock (${stats.outOfStockCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStockFilter(tab.key as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                    stockFilter === tab.key
                      ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Grouped Tree vs Flat Table) */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <span className="text-xs font-bold text-muted-foreground">View:</span>
              <div className="flex bg-muted/80 p-0.5 rounded-xl border border-border">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                    viewMode === "grouped"
                      ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grouped by Product"
                >
                  <LayoutGrid size={13} />
                  <span>Product Tree</span>
                </button>
                <button
                  onClick={() => setViewMode("flat")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                    viewMode === "flat"
                      ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Flat Variants Table"
                >
                  <List size={13} />
                  <span>All Variations</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Category Filter Row */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex items-center h-10 flex-1 rounded-xl px-3 gap-2 border border-border bg-card transition-all focus-within:border-primary">
              <Search className="text-muted-foreground shrink-0" size={16} />
              <input
                type="text"
                placeholder="Search variations by name, SKU, parent product, brand, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-muted-foreground hover:text-foreground font-bold px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer transition-all"
              >
                <option value="All">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content: Grouped View or Flat View */}
        <div className="space-y-4">
          {viewMode === "grouped" ? (
            <StockGroupedView
              groupedProducts={paginatedGroupedProducts}
              onOpenAdjustModal={handleOpenAdjustModal}
              onQuickDelta={handleQuickDelta}
              editingId={editingId}
              editSku={editSku}
              setEditSku={setEditSku}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              editStock={editStock}
              setEditStock={setEditStock}
              handleEditClick={handleEditClick}
              handleCancelEdit={handleCancelEdit}
              handleSaveEdit={handleSaveEdit}
              isUpdating={isUpdating}
            />
          ) : (
            <StockFlatTable
              filteredVariants={paginatedFlatVariants}
              editingId={editingId}
              editSku={editSku}
              setEditSku={setEditSku}
              editStock={editStock}
              setEditStock={setEditStock}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              handleEditClick={handleEditClick}
              onOpenAdjustModal={handleOpenAdjustModal}
              onQuickDelta={handleQuickDelta}
              isUpdating={isUpdating}
            />
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={viewMode === "flat" ? filteredVariants.length : groupedProducts.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>

        {/* Interactive Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={adjustModalOpen}
          onClose={() => {
            setAdjustModalOpen(false);
            setSelectedVariantForAdjust(null);
          }}
          variantItem={selectedVariantForAdjust}
          onConfirm={handleConfirmModalAdjust}
          isUpdating={isUpdating}
        />
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllProductsQuery,
  useUpdateProductMutation,
} from "@/redux/features/product/productApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";
import VariantTable from "@/components/ui/commerce/variants/VariantTable";
import Pagination from "@/components/shared/Pagination";

export default function VariantsPage() {
  const { data: productsRes, isLoading, refetch } = useGetAllProductsQuery({});
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"All" | "Out" | "Low" | "In">("All");
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Editing state for inline values
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editStock, setEditStock] = useState<number | "">("");
  const [editSku, setEditSku] = useState("");

  // Load local storage fallback products
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
    if (productsRes && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
      return productsRes.data;
    }
    return localProducts;
  }, [productsRes, localProducts]);

  // Flatten variants across all products
  const flatVariants = useMemo(() => {
    const list: any[] = [];
    products.forEach((prod: any) => {
      const prodId = prod._id || prod.id;
      const prodName = prod.name;
      const prodImage = prod.images?.[0] || "";
      const prodCat = typeof prod.category === "string" ? prod.category : prod.category?.name || "Uncategorized";

      if (prod.variants && prod.variants.length > 0) {
        prod.variants.forEach((v: any) => {
          list.push({
            productId: prodId,
            productName: prodName,
            productImage: prodImage,
            productCategory: prodCat,
            parentProduct: prod,
            variantId: v.id || v._id,
            variantName: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes || {},
          });
        });
      } else {
        // Product itself is a single variant if it has no variants generated
        list.push({
          productId: prodId,
          productName: prodName,
          productImage: prodImage,
          productCategory: prodCat,
          parentProduct: prod,
          variantId: `${prodId}-base`,
          variantName: "Base Standard Option",
          sku: prod.sku || `${prod.slug?.toUpperCase()}-BASE`,
          price: prod.price || 0,
          stock: prod.stock || 0,
          attributes: {},
          isBaseProduct: true,
        });
      }
    });
    return list;
  }, [products]);

  // Filter list
  const filteredVariants = useMemo(() => {
    return flatVariants.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStock = true;
      if (stockFilter === "Out") {
        matchesStock = item.stock === 0;
      } else if (stockFilter === "Low") {
        matchesStock = item.stock > 0 && item.stock < 10;
      } else if (stockFilter === "In") {
        matchesStock = item.stock >= 10;
      }

      return matchesSearch && matchesStock;
    });
  }, [flatVariants, searchQuery, stockFilter]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stockFilter]);

  // Paginated list
  const paginatedVariants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVariants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVariants, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredVariants.length / itemsPerPage);
  }, [filteredVariants, itemsPerPage]);

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

  const handleSaveEdit = async (item: any) => {
    if (editPrice === "" || editStock === "") {
      toast.error("Price and Stock are required!");
      return;
    }

    const toastId = toast.loading("Saving variant stock changes...");
    const parent = item.parentProduct;

    let updatedProductPayload: any;

    if (item.isBaseProduct) {
      updatedProductPayload = {
        ...parent,
        price: Number(editPrice),
        stock: Number(editStock),
        sku: editSku.trim(),
      };
    } else {
      const updatedVariants = parent.variants.map((v: any) => {
        if ((v.id || v._id) === item.variantId) {
          return {
            ...v,
            sku: editSku.trim(),
            price: Number(editPrice),
            stock: Number(editStock),
          };
        }
        return v;
      });

      const totalStock = updatedVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

      updatedProductPayload = {
        ...parent,
        variants: updatedVariants,
        stock: totalStock,
      };
    }

    try {
      const isApiAvailable = productsRes?.data !== undefined;

      if (isApiAvailable) {
        const pId = parent._id || parent.id;
        await updateProduct({ id: pId, data: updatedProductPayload }).unwrap();
        toast.success("Variant saved to backend server!", { id: toastId });
        refetch();
      } else {
        const updatedList = localProducts.map((p) =>
          (p._id === parent._id || p.id === parent.id) ? updatedProductPayload : p
        );
        setLocalProducts(updatedList);
        localStorage.setItem("zenith_products", JSON.stringify(updatedList));
        toast.success("Variant saved locally!", { id: toastId });
      }

      handleCancelEdit();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "An unexpected error occurred while saving variant.",
        { id: toastId }
      );
    }
  };

  if (isLoading) {
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Commerce</span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Variants Inventory</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-foreground">Variants Inventory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor and manage individual product options, pricing, and stock levels globally.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start">
            {[
              { key: "All", label: "All Stock" },
              { key: "Out", label: "Out of Stock" },
              { key: "Low", label: "Low Stock (< 10)" },
              { key: "In", label: "In Stock" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStockFilter(tab.key as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                  stockFilter === tab.key
                    ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex items-center h-10 flex-1 max-w-md rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
              <Search className="text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search variants by name, SKU, or parent product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="space-y-4">
          <VariantTable
            filteredVariants={paginatedVariants}
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
            isUpdating={isUpdating}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredVariants.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

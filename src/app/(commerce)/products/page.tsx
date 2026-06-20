"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/redux/features/product/productApi";
import {
  useGetHomeSectionsQuery,
  useUpdateSectionMutation,
} from "@/redux/features/section/sectionApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Search,
  Plus,
  Sliders,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductTable from "@/components/ui/commerce/products/ProductTable";

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Draft" | "Archived">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [localProds, setLocalProds] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // reset to page 1 on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Map activeTab to query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      admin: true,
    };
    if (debouncedSearchQuery.trim()) {
      params.searchTerm = debouncedSearchQuery.trim();
    }
    if (activeTab === "Active") {
      params.visibility = "published";
      params.isActive = true;
    } else if (activeTab === "Draft") {
      params.visibility = "hidden";
    } else if (activeTab === "Archived") {
      params.isActive = false;
    }
    return params;
  }, [page, limit, debouncedSearchQuery, activeTab]);

  const { data: productsRes, isLoading, refetch } = useGetAllProductsQuery(queryParams);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const { data: sectionsRes, refetch: refetchSections } = useGetHomeSectionsQuery({ admin: "true" });
  const [updateSection] = useUpdateSectionMutation();

  const activeSections = useMemo(() => {
    return (sectionsRes?.data || []).filter((sec: any) => sec.isActive);
  }, [sectionsRes]);

  const handleToggleProductSection = async (product: any, section: any) => {
    const sectionId = section._id;
    const currentProducts = section.products || [];
    const isAssigned = currentProducts.some(
      (p: any) => p._id === product._id || p._id === product.id || p.id === product._id
    );

    let updatedProductIds: string[] = [];
    if (isAssigned) {
      updatedProductIds = currentProducts
        .filter((p: any) => p._id !== product._id && p._id !== product.id && p.id !== product._id)
        .map((p: any) => p._id || p.id);
    } else {
      const ids = currentProducts.map((p: any) => p._id || p.id);
      updatedProductIds = [...ids, product._id || product.id];
    }

    const toastId = toast.loading(`Updating ${section.title}...`);
    try {
      await updateSection({
        id: sectionId,
        data: { products: updatedProductIds },
      }).unwrap();
      toast.success(
        `Product ${isAssigned ? "removed from" : "assigned to"} ${section.title}!`,
        { id: toastId }
      );
      refetchSections();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update section.", {
        id: toastId,
      });
    }
  };

  const handleToggleBadge = async (prod: any, field: string) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(prod._id || prod.id);
    const currentValue = prod[field] || false;
    const newValue = !currentValue;
    const toastId = toast.loading(`Updating status...`);

    try {
      const isApiAvailable = productsRes?.data !== undefined;

      if (isApiAvailable && isMongoId) {
        await updateProduct({
          id: prod._id || prod.id,
          data: { [field]: newValue }
        }).unwrap();
        refetch();
      } else {
        // Fallback local storage
        const updated = localProds.map((p) =>
          (p._id === prod._id || p.id === prod.id) ? { ...p, [field]: newValue } : p
        );
        setLocalProds(updated);
        localStorage.setItem("zenith_products", JSON.stringify(updated));
      }
      toast.success("Status updated successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update status.", { id: toastId });
    }
  };

  const handleTabChange = (tab: "All" | "Active" | "Draft" | "Archived") => {
    setActiveTab(tab);
    setPage(1);
  };

  // Initialize and load products from LocalStorage fallback if needed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenith_products");
      if (saved) {
        try {
          setLocalProds(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultMock = [
          {
            _id: "mock-p1",
            id: "mock-p1",
            name: "Pro Dashboard License",
            description: "Full-featured admin dashboard template with all components and pages.",
            category: { name: "Templates" },
            brand: { name: "Apex" },
            status: "Active",
            stock: 999,
            price: 299,
            sku: "DASH-PRO-BASE",
            images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300"],
          },
          {
            _id: "mock-p2",
            id: "mock-p2",
            name: "Team Plan Upgrade",
            description: "Upgrade to team plan with shared access and collaboration features.",
            category: { name: "Plans" },
            brand: { name: "Apex" },
            status: "Active",
            stock: 450,
            price: 59,
            sku: "TEAM-PLAN-BASE",
            images: ["https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=300"],
          },
          {
            _id: "mock-p3",
            id: "mock-p3",
            name: "Enterprise License",
            description: "Enterprise-grade license with priority support and custom branding.",
            category: { name: "Licenses" },
            brand: { name: "Bata" },
            status: "Active",
            stock: 120,
            price: 1499,
            sku: "ENTERPRISE-BASE",
            images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300"],
          },
        ];
        localStorage.setItem("zenith_products", JSON.stringify(defaultMock));
        setLocalProds(defaultMock);
      }
    }
  }, []);

  // Local filter fallback for offline mode
  const filteredLocalProducts = useMemo(() => {
    return localProds.filter((prod: any) => {
      const displayStatus = prod.visibility
        ? (prod.visibility === "published" ? "Active" : prod.visibility === "hidden" ? "Draft" : "Out of Stock")
        : (prod.isActive !== false ? "Active" : "Inactive");
      
      const matchesTab = activeTab === "All" || displayStatus === activeTab;
      if (!matchesTab) return false;

      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const nameMatch = prod.name?.toLowerCase().includes(query) || false;
        const descMatch = prod.description?.toLowerCase().includes(query) || false;
        const catMatch = (typeof prod.category === "string" ? prod.category : prod.category?.name)?.toLowerCase().includes(query) || false;
        const brandMatch = (typeof prod.brand === "string" ? prod.brand : prod.brand?.name)?.toLowerCase().includes(query) || false;
        return nameMatch || descMatch || catMatch || brandMatch;
      }
      return true;
    });
  }, [localProds, activeTab, debouncedSearchQuery]);

  // Final display list
  const displayProducts = useMemo(() => {
    if (productsRes) {
      if (productsRes.data && Array.isArray(productsRes.data.data)) {
        return productsRes.data.data;
      }
      if (Array.isArray(productsRes.data)) {
        return productsRes.data;
      }
      if (Array.isArray(productsRes)) {
        return productsRes;
      }
    }
    const startIndex = (page - 1) * limit;
    return filteredLocalProducts.slice(startIndex, startIndex + limit);
  }, [productsRes, filteredLocalProducts, page, limit]);

  // Pagination stats
  const totalItems = useMemo(() => {
    if (productsRes?.data?.meta?.total !== undefined) {
      return productsRes.data.meta.total;
    }
    return filteredLocalProducts.length;
  }, [productsRes, filteredLocalProducts]);

  const totalPages = useMemo(() => {
    if (productsRes?.data?.meta?.totalPage !== undefined) {
      return productsRes.data.meta.totalPage;
    }
    return Math.ceil(filteredLocalProducts.length / limit);
  }, [productsRes, filteredLocalProducts, limit]);

  const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    const toastId = toast.loading(`Deleting product "${name}"...`);

    try {
      const isApiAvailable = productsRes?.data !== undefined;
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

      if (isApiAvailable && isMongoId) {
        await deleteProduct(id).unwrap();
        refetch();
      } else {
        const updated = localProds.filter((p) => p._id !== id && p.id !== id);
        setLocalProds(updated);
        localStorage.setItem("zenith_products", JSON.stringify(updated));
      }

      toast.success(`Successfully deleted "${name}"!`, { id: toastId });
      setDeleteTarget(null);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || `Failed to delete product.`,
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
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Products</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Products Catalog</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse, filter, edit details, and manage variant SKU inventories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/attributes"
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-border text-xs font-bold bg-card text-foreground hover:bg-muted/50 cursor-pointer transition-all"
            >
              <Sliders size={14} />
              Manage Attributes
            </Link>

            <Link
              href="/products/create"
              className="flex items-center gap-1.5 h-10 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer transition-all shadow-sm shadow-primary/20"
            >
              <Plus size={14} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Filters and Action Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start">
            {(["All", "Active", "Draft", "Archived"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                  activeTab === tab
                    ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex items-center h-10 flex-1 max-w-md rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
              <Search className="text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by name, category, brand, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <ProductTable
          displayProducts={displayProducts}
          handleToggleBadge={handleToggleBadge}
          handleDeleteClick={handleDeleteClick}
          activeSections={activeSections}
          handleToggleProductSection={handleToggleProductSection}
        />

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-4 border border-border rounded-2xl text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-bold cursor-pointer"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} items
                </option>
              ))}
            </select>
            <span>
              of <span className="text-foreground font-bold">{totalItems}</span> total products
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          page === p
                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                            : "border border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-[400px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-destructive" />

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="font-heading text-base font-bold text-foreground">Delete Product?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete product <span className="text-foreground font-bold">"{deleteTarget.name}"</span>? This will remove all its configured inventory variants. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-destructive/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Spinner className="w-3.5 h-3.5 animate-spin text-destructive-foreground" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

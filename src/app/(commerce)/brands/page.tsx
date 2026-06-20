"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "@/redux/features/brand/brandApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Info,
  Save,
  Globe,
  Image as ImageIcon,
  Search,
  Check,
  X,
  Layers,
  UploadCloud,
} from "lucide-react";

// Mock Fallback Data in case the backend DB is empty
const mockBrands = [
  {
    _id: "mock-b1",
    name: "Apex",
    slug: "apex",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120&auto=format&fit=crop",
    description: "Premium footwear and activewear brand.",
    website: "https://apexfootwear.com",
    isFeatured: true,
    isActive: true,
  },
  {
    _id: "mock-b2",
    name: "Bata",
    slug: "bata",
    logo: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=120&auto=format&fit=crop",
    description: "International style and comfort shoes.",
    website: "https://batabd.com",
    isFeatured: false,
    isActive: true,
  },
  {
    _id: "mock-b3",
    name: "Lotto",
    slug: "lotto",
    logo: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=120&auto=format&fit=crop",
    description: "Italian sports apparel and shoes.",
    website: "https://lotto-sport.com",
    isFeatured: true,
    isActive: true,
  }
];

export default function BrandsPage() {
  // Queries & Mutations
  const { data: brandRes, isLoading, refetch } = useGetAllBrandsQuery({});
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const isSaving = isCreating || isUpdating;

  // Brands list with fallback
  const brands = useMemo(() => {
    if (brandRes && Array.isArray(brandRes.data) && brandRes.data.length > 0) {
      return brandRes.data;
    }
    if (Array.isArray(brandRes)) {
      return brandRes;
    }
    return mockBrands;
  }, [brandRes]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSingleImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size exceeds the 2MB limit!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading logo image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setLogoUrl(res.data.url);
        toast.success("Logo uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to upload image.",
        { id: toastId }
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size exceeds the 2MB limit!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading logo image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setLogoUrl(res.data.url);
        toast.success("Logo uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to upload image.",
        { id: toastId }
      );
    }
  };

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter((b: any) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [brands, searchQuery]);

  // Simple browser-safe slugify helper
  const slugifyString = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleNameChange = (val: string) => {
    setBrandName(val);
    if (!isSlugManuallyEdited) {
      setBrandSlug(slugifyString(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setBrandSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  const handleEditClick = (brand: any) => {
    setFormMode("update");
    setTargetId(brand._id);
    setBrandName(brand.name);
    setBrandSlug(brand.slug || "");
    setIsSlugManuallyEdited(true);
    setLogoUrl(brand.logo || "");
    setDescription(brand.description || "");
    setWebsite(brand.website || "");
    setIsActive(brand.isActive);
    setIsFeatured(brand.isFeatured);
  };

  const handleCancel = () => {
    setFormMode("create");
    setTargetId(null);
    setBrandName("");
    setBrandSlug("");
    setIsSlugManuallyEdited(false);
    setLogoUrl("");
    setDescription("");
    setWebsite("");
    setIsActive(true);
    setIsFeatured(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      toast.error("Brand name is required!");
      return;
    }

    if (!logoUrl.trim()) {
      toast.error("Logo URL is required!");
      return;
    }

    const toastId = toast.loading(
      formMode === "update" ? "Updating brand details..." : "Saving new brand..."
    );

    try {
      const payload = {
        name: brandName,
        slug: brandSlug.trim() || undefined,
        logo: logoUrl.trim(),
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        isActive,
        isFeatured,
      };

      if (formMode === "create") {
        await createBrand(payload).unwrap();
        toast.success(`Successfully created "${brandName}"!`, { id: toastId });
        handleCancel();
        refetch();
      } else if (formMode === "update" && targetId) {
        if (targetId.startsWith("mock")) {
          toast.error("Cannot edit mock demo data. Please create a new brand instead!", { id: toastId });
          return;
        }
        await updateBrand({ id: targetId, data: payload }).unwrap();
        toast.success(`Successfully updated "${brandName}"!`, { id: toastId });
        handleCancel();
        refetch();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "An unexpected error occurred while saving.",
        { id: toastId }
      );
    }
  };

  const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { id, name } = deleteTarget;
    if (id.startsWith("mock")) {
      toast.error("Cannot delete mock demo data.");
      setDeleteTarget(null);
      return;
    }
    const toastId = toast.loading(`Deleting brand "${name}"...`);

    try {
      await deleteBrand(id).unwrap();
      toast.success(`Successfully deleted "${name}"!`, { id: toastId });
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || `Failed to delete brand.`,
        { id: toastId }
      );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Commerce</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Brands</span>
            </div>
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Brand Directory
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              Manage manufacturing entities, vendor branding profiles, status visibility, and website mappings.
            </p>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Brand list view */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Active Brands ({filteredBrands.length})
                </h3>
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Brands Grid / List */}
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                {filteredBrands.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBrands.map((brand: any) => {
                      const isSelectedForEdit = targetId === brand._id;
                      return (
                        <div
                          key={brand._id}
                          onClick={() => handleEditClick(brand)}
                          className={`group p-4 rounded-xl border transition-all cursor-pointer flex gap-3.5 relative overflow-hidden ${
                            isSelectedForEdit
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                          }`}
                        >
                          {/* Brand Logo URL */}
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                                }}
                              />
                            ) : (
                              <Tag size={18} className="text-muted-foreground" />
                            )}
                          </div>

                          {/* Brand Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-foreground truncate">
                                {brand.name}
                              </h4>
                              {brand.isFeatured && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider shrink-0">
                                  Featured
                                </span>
                              )}
                              {!brand.isActive && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 uppercase tracking-wider shrink-0">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              slug: {brand.slug}
                            </p>
                            {brand.website && (
                              <a
                                href={brand.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Globe size={10} /> {brand.website.replace(/^https?:\/\//i, "")}
                              </a>
                            )}
                          </div>

                          {/* Float Actions */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(brand);
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer transition-colors"
                              title="Edit Brand"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                handleDeleteClick(brand._id, brand.name, e);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
                              title="Delete Brand"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-2">
                    <Tag className="mx-auto text-muted/30 animate-pulse" size={36} />
                    <p className="text-xs font-bold">No Brands Found</p>
                    <p className="text-[10px]">Create your first brand using the form on the right.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Edit/Create form */}
          <div className="lg:col-span-5">
            <div className="glass-card p-5 rounded-2xl border border-border sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Tag size={16} />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-foreground capitalize">
                    {formMode === "create" && "Create Brand"}
                    {formMode === "update" && "Update Brand"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formMode === "create" && "Establish a new brand profile"}
                    {formMode === "update" && `Modifying settings for active brand`}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Brand Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    placeholder="e.g. Nike, Adidas, Samsung"
                    value={brandName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                  />
                </div>

                {/* Brand Slug */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Brand Slug
                    </label>
                    <span className="text-[9px] text-muted-foreground font-bold">
                      {isSlugManuallyEdited ? "Custom Edit Mode" : "Auto-Generated"}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    placeholder="e.g. nike, adidas, samsung"
                    value={brandSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                  />
                </div>

                {/* Brand Logo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Brand Logo
                    </label>
                    <div className="flex gap-1 p-0.5 rounded-lg bg-muted border border-border">
                      <button
                        type="button"
                        onClick={() => setUploadMode("upload")}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          uploadMode === "upload"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("url")}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          uploadMode === "url"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        URL Input
                      </button>
                    </div>
                  </div>

                  {uploadMode === "upload" ? (
                    <div>
                      {logoUrl ? (
                        <div className="relative group rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3 min-h-[80px]">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                              <img
                                src={logoUrl}
                                alt="Brand logo preview"
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-foreground truncate max-w-[180px]">
                                Logo Selected
                              </p>
                              <p className="text-[9px] text-muted-foreground truncate max-w-[180px]">
                                {logoUrl}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-all shrink-0"
                            title="Remove Image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("logo-file-input")?.click()}
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isDragging
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                          }`}
                        >
                          <input
                            id="logo-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          
                          {isUploadingImage ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-1">
                              <Spinner className="w-6 h-6 animate-spin text-primary" />
                              <span className="text-[10px] font-bold text-muted-foreground">Uploading image...</span>
                            </div>
                          ) : (
                            <>
                              <UploadCloud
                                size={24}
                                className={`text-muted-foreground/60 transition-transform ${
                                  isDragging ? "scale-110 text-primary" : "group-hover:scale-105"
                                }`}
                              />
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-bold text-foreground">
                                  Drag & drop logo file here
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  or <span className="text-primary hover:underline font-bold">browse your files</span>
                                </p>
                              </div>
                              <p className="text-[8px] text-muted-foreground/80 mt-1">
                                Supported formats: JPG, PNG, WEBP (Max 2MB)
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="url"
                        required
                        disabled={isSaving}
                        placeholder="e.g. https://domain.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Website URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                      type="url"
                      disabled={isSaving}
                      placeholder="e.g. https://brandwebsite.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    disabled={isSaving}
                    placeholder="Enter short description of the brand..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
                    <input
                      type="checkbox"
                      disabled={isSaving}
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground">Active Status</span>
                      <span className="text-[9px] text-muted-foreground">Visible on site</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
                    <input
                      type="checkbox"
                      disabled={isSaving}
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground">Featured</span>
                      <span className="text-[9px] text-muted-foreground">Promote on home</span>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Spinner className="w-4 h-4 mr-1 animate-spin text-white" />
                    ) : (
                      <Save size={14} className="shrink-0" />
                    )}
                    {isSaving ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        {formMode === "create" && "Save Brand"}
                        {formMode === "update" && "Update Settings"}
                      </>
                    )}
                  </button>
                  {formMode !== "create" && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleCancel}
                      className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted/50 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
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
                <h4 className="font-heading text-base font-bold text-foreground">Delete Brand?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete brand <span className="text-foreground font-bold">"{deleteTarget.name}"</span>? This action cannot be undone.
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

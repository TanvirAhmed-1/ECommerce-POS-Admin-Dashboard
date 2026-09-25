"use client";

import React, { useState, useEffect } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/redux/features/category/categoryApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import { FolderTree, Info, Save, X, UploadCloud, Image as ImageIcon, FileText, Globe } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-hot-toast";

interface CategoryFormProps {
  formMode: "create" | "update" | "sub";
  activeCategory: any | null;
  flatCategories: any[];
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  formMode,
  activeCategory,
  flatCategories,
  onSaveSuccess,
  onCancel,
}: CategoryFormProps) {
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [uploadSingleImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation();

  const isSaving = isCreating || isUpdating;

  // Form states
  const [categoryName, setCategoryName] = useState<string>("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaKeywords, setMetaKeywords] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [categorySubtitle, setCategorySubtitle] = useState<string>("");
  const [categoryDescription, setCategoryDescription] = useState<string>("");
  
  // Category Thumbnail Image
  const [categoryImage, setCategoryImage] = useState<string>("");
  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "url">("upload");
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);

  // Category Hero Banner Image
  const [categoryBanner, setCategoryBanner] = useState<string>("");
  const [bannerUploadMode, setBannerUploadMode] = useState<"upload" | "url">("upload");
  const [isDraggingBanner, setIsDraggingBanner] = useState<boolean>(false);

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [showInFooter, setShowInFooter] = useState<boolean>(false);
  const [showInNavbar, setShowInNavbar] = useState<boolean>(false);
  const [parentCategory, setParentCategory] = useState<string>("");

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

  const resetForm = () => {
    setCategoryName("");
    setCategorySlug("");
    setParentCategory("");
    setIsActive(true);
    setShowInFooter(false);
    setShowInNavbar(false);
    setMetaTitle("");
    setMetaKeywords("");
    setMetaDescription("");
    setCategorySubtitle("");
    setCategoryDescription("");
    setCategoryImage("");
    setCategoryBanner("");
    setIsFeatured(false);
    setIsSlugManuallyEdited(false);
    setIsDraggingImage(false);
    setIsDraggingBanner(false);
  };

  useEffect(() => {
    if (formMode === "update" && activeCategory) {
      setCategoryName(activeCategory.name || "");
      setCategorySlug(activeCategory.slug || "");
      setParentCategory(activeCategory.parentCategory || "");
      setIsActive(activeCategory.isActive ?? true);
      setShowInFooter(activeCategory.showInFooter ?? false);
      setShowInNavbar(activeCategory.showInNavbar ?? false);
      setMetaTitle(activeCategory.metaTitle || "");
      setMetaKeywords(
        Array.isArray(activeCategory.metaKeywords)
          ? activeCategory.metaKeywords.join(", ")
          : activeCategory.metaKeywords || ""
      );
      setMetaDescription(activeCategory.metaDescription || "");
      setCategorySubtitle(activeCategory.subtitle || "");
      setCategoryDescription(activeCategory.description || "");
      setCategoryImage(activeCategory.image || "");
      setCategoryBanner(activeCategory.banner || "");
      setIsFeatured(activeCategory.isFeatured ?? false);
      setIsSlugManuallyEdited(true);
    } else if (formMode === "sub" && activeCategory) {
      setCategoryName("");
      setCategorySlug("");
      setParentCategory(activeCategory._id || "");
      setIsActive(true);
      setShowInFooter(false);
      setShowInNavbar(false);
      setMetaTitle("");
      setMetaKeywords("");
      setMetaDescription("");
      setCategorySubtitle("");
      setCategoryDescription("");
      setCategoryImage("");
      setCategoryBanner("");
      setIsFeatured(false);
      setIsSlugManuallyEdited(false);
    } else {
      resetForm();
    }
  }, [activeCategory, formMode]);

  const handleNameChange = (val: string) => {
    setCategoryName(val);
    if (!isSlugManuallyEdited) {
      setCategorySlug(slugifyString(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setCategorySlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  // Thumbnail Image upload handler
  const uploadThumbnailFile = async (file: File) => {
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
    const toastId = toast.loading("Uploading thumbnail image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setCategoryImage(res.data.url);
        toast.success("Thumbnail image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to upload image", { id: toastId });
    }
  };

  // Banner Image upload handler
  const uploadBannerFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Banner size exceeds the 3MB limit!");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    const toastId = toast.loading("Uploading category banner...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setCategoryBanner(res.data.url);
        toast.success("Category banner uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to upload banner", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required!");
      return;
    }

    const toastId = toast.loading(
      formMode === "update" ? "Updating category settings..." : "Saving new category..."
    );

    try {
      const commonData = {
        name: categoryName.trim(),
        slug: categorySlug.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        metaKeywords: metaKeywords.trim()
          ? metaKeywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : undefined,
        subtitle: categorySubtitle.trim() || undefined,
        description: categoryDescription.trim() || undefined,
        image: categoryImage.trim() || undefined,
        banner: categoryBanner.trim() || undefined,
        isActive,
        showInFooter,
        showInNavbar,
        isFeatured,
      };

      if (formMode === "create" || formMode === "sub") {
        const payload = {
          ...commonData,
          parentCategory: parentCategory || undefined,
        };

        const res = await createCategory(payload).unwrap();
        toast.success(`Successfully created "${res?.data?.name || categoryName}"!`, { id: toastId });
        resetForm();
        onSaveSuccess();
      } else if (formMode === "update" && activeCategory) {
        const payload = {
          id: activeCategory._id,
          data: {
            ...commonData,
            parentId: parentCategory || null,
          },
        };

        const res = await updateCategory(payload).unwrap();
        toast.success(`Successfully updated "${res?.data?.name || categoryName}"!`, { id: toastId });
        resetForm();
        onSaveSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "An unexpected error occurred while saving.",
        { id: toastId }
      );
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-border sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <FolderTree size={16} />
        </div>
        <div>
          <h4 className="font-heading text-base font-bold text-foreground capitalize">
            {formMode === "create" && "Create Category"}
            {formMode === "sub" && "Add Subcategory"}
            {formMode === "update" && "Update Category"}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formMode === "create" && "Establish a new root category node with banner & SEO details"}
            {formMode === "sub" && "Configure child subcategory node"}
            {formMode === "update" && `Modifying settings for active category`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Category Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. Plastic Household, Kitchenware, Rice Cookers"
            value={categoryName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* 2. Category Slug */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              URL Slug
            </label>
            <span className="text-[9px] text-muted-foreground font-semibold">
              {isSlugManuallyEdited ? "Custom Slug" : "Auto-Generated"}
            </span>
          </div>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. plastic-household"
            value={categorySlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* 3. Parent Category Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Parent Category
          </label>
          <select
            disabled={formMode === "sub" || isSaving}
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">None (Make Root Category)</option>
            {flatCategories
              .filter((c) => c._id !== (formMode === "update" ? activeCategory?._id : null))
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {"— ".repeat(cat.level)}
                  {cat.name}
                </option>
              ))}
          </select>
          {formMode === "sub" && (
            <p className="text-[10px] text-primary font-bold flex items-center gap-1 mt-1">
              <Info size={12} /> Parent category is preset for this subcategory.
            </p>
          )}
        </div>

        {/* 4. SEO Meta Tags Section */}
        <div className="space-y-3 p-3.5 rounded-xl border border-border/80 bg-muted/15">
          <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
            <Globe size={14} className="text-primary" />
            <h5 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              SEO Meta Tags
            </h5>
          </div>

          {/* Meta Tag Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Meta Tag Title
              </label>
              <span className="text-[9px] text-muted-foreground font-semibold">
                {metaTitle.length}/70
              </span>
            </div>
            <input
              type="text"
              maxLength={70}
              disabled={isSaving}
              placeholder="e.g. Plastic Household Products - Best Quality & Deals Online"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          {/* Meta Tag Keywords */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Meta Tag Keywords
            </label>
            <input
              type="text"
              disabled={isSaving}
              placeholder="e.g. plastic household, kitchen items, containers, storage box (comma separated)"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          {/* Meta Tag Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Meta Tag Description
              </label>
              <span className="text-[9px] text-muted-foreground font-semibold">
                {metaDescription.length}/160
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={160}
              disabled={isSaving}
              placeholder="Short search engine description (under 160 characters)..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-card text-xs font-normal text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        {/* 5. Subtitle / Tagline */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Subtitle / Tagline
          </label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="e.g. Durable and useful plastic products for your everyday home needs. Quality you can trust."
            value={categorySubtitle}
            onChange={(e) => setCategorySubtitle(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* 6. Thumbnail / Card Image */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Category Thumbnail / Icon Image
            </label>
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setImageUploadMode("upload")}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  imageUploadMode === "upload"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageUploadMode("url")}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  imageUploadMode === "url"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {imageUploadMode === "upload" ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingImage(false);
                const file = e.dataTransfer.files?.[0];
                if (file) await uploadThumbnailFile(file);
              }}
              className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                isDraggingImage
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary bg-card"
              }`}
              onClick={() => document.getElementById("category-image-file-input-id")?.click()}
            >
              <input
                type="file"
                id="category-image-file-input-id"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await uploadThumbnailFile(file);
                }}
                disabled={isUploadingImage || isSaving}
              />
              {categoryImage ? (
                <div className="relative w-20 h-20 mx-auto group">
                  <img
                    src={categoryImage}
                    alt="Category Preview"
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryImage("");
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90 shadow transition-all cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-muted-foreground py-1">
                  <UploadCloud size={20} className="mx-auto text-muted/50" />
                  <p className="text-[10px] font-bold text-foreground">Upload category icon / thumbnail</p>
                  <p className="text-[8px]">Max 2MB</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                disabled={isSaving}
                placeholder="Paste image URL e.g. https://domain.com/image.png"
                value={categoryImage}
                onChange={(e) => setCategoryImage(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* 7. Checkboxes / Visibility */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
            <input
              type="checkbox"
              disabled={isSaving}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground leading-tight">Active</span>
              <span className="text-[8px] text-muted-foreground">Visible on site</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
            <input
              type="checkbox"
              disabled={isSaving}
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground leading-tight">Featured</span>
              <span className="text-[8px] text-muted-foreground">Highlight on home</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
            <input
              type="checkbox"
              disabled={isSaving}
              checked={showInNavbar}
              onChange={(e) => setShowInNavbar(e.target.checked)}
              className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground leading-tight">Navbar Menu</span>
              <span className="text-[8px] text-muted-foreground">Show in header</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
            <input
              type="checkbox"
              disabled={isSaving}
              checked={showInFooter}
              onChange={(e) => setShowInFooter(e.target.checked)}
              className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground leading-tight">Footer Links</span>
              <span className="text-[8px] text-muted-foreground">Show in footer</span>
            </div>
          </label>
        </div>

        {/* 8. Hero Banner Image (Wide Banner for Top Page) - Placed at Bottom */}
        <div className="space-y-1.5 p-3.5 rounded-xl border border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={13} className="text-primary" />
              <span>Category Hero Banner (Top Wide Image)</span>
            </label>
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setBannerUploadMode("upload")}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  bannerUploadMode === "upload"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setBannerUploadMode("url")}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  bannerUploadMode === "url"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {bannerUploadMode === "upload" ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingBanner(true); }}
              onDragLeave={() => setIsDraggingBanner(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingBanner(false);
                const file = e.dataTransfer.files?.[0];
                if (file) await uploadBannerFile(file);
              }}
              className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                isDraggingBanner
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary bg-card"
              }`}
              onClick={() => document.getElementById("category-banner-file-input-id")?.click()}
            >
              <input
                type="file"
                id="category-banner-file-input-id"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await uploadBannerFile(file);
                }}
                disabled={isUploadingImage || isSaving}
              />
              {categoryBanner ? (
                <div className="relative w-full h-24 mx-auto group overflow-hidden rounded-lg border border-border">
                  <img
                    src={categoryBanner}
                    alt="Category Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryBanner("");
                    }}
                    className="absolute top-1.5 right-1.5 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90 shadow transition-all cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-muted-foreground py-1">
                  <UploadCloud size={20} className="mx-auto text-muted/50" />
                  <p className="text-[10px] font-bold text-foreground">Upload wide banner image (1200x350 recommended)</p>
                  <p className="text-[8px]">or drag & drop file here (Max 3MB)</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                disabled={isSaving}
                placeholder="Paste banner image URL e.g. https://domain.com/banner.jpg"
                value={categoryBanner}
                onChange={(e) => setCategoryBanner(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
              />
              {categoryBanner && (
                <div className="mt-1 relative h-20 w-full rounded-lg overflow-hidden border border-border">
                  <img
                    src={categoryBanner}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 9. Category Description (SEO Content for Footer Area) - Placed at Bottom */}
        <div className="space-y-1.5 p-3.5 rounded-xl border border-border/80 bg-muted/15">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={13} className="text-primary" />
              <span>Category Description (SEO Footer Content)</span>
            </label>
            <span className="text-[9px] text-muted-foreground font-semibold">
              Appears at bottom of page
            </span>
          </div>
          <textarea
            rows={4}
            disabled={isSaving}
            placeholder="Write a comprehensive SEO overview, buyer's guide, key benefits, and search keywords for this category. This content will appear at the bottom of the category page for search engines and shoppers..."
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-border bg-card text-xs font-normal text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50 custom-scrollbar"
          />
        </div>

        {/* 10. Buttons */}
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
                {formMode === "create" && "Save Category"}
                {formMode === "sub" && "Add Subcategory"}
                {formMode === "update" && "Update Settings"}
              </>
            )}
          </button>
          {formMode !== "create" && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted/50 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

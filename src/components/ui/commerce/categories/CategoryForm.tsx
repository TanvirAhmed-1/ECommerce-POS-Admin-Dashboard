import React, { useState, useEffect } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/redux/features/category/categoryApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import { FolderTree, Info, Save, X, UploadCloud } from "lucide-react";
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
  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [categoryImage, setCategoryImage] = useState<string>("");
  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "url">("upload");
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);
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
      .replace(/\s+/g, "-")          // Replace spaces with -
      .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
      .replace(/\-\-+/g, "-");        // Replace multiple - with single -
  };

  useEffect(() => {
    if (formMode === "update" && activeCategory) {
      setCategoryName(activeCategory.name || "");
      setCategorySlug(activeCategory.slug || "");
      setParentCategory(activeCategory.parentCategory || "");
      setIsActive(activeCategory.isActive ?? true);
      setShowInFooter(activeCategory.showInFooter ?? false);
      setShowInNavbar(activeCategory.showInNavbar ?? false);
      setCategoryTitle(activeCategory.title || "");
      setCategoryImage(activeCategory.image || "");
      setIsFeatured(activeCategory.isFeatured ?? false);
      setIsSlugManuallyEdited(true);
    } else if (formMode === "sub" && activeCategory) {
      setCategoryName("");
      setCategorySlug("");
      setParentCategory(activeCategory._id || "");
      setIsActive(true);
      setShowInFooter(false);
      setShowInNavbar(false);
      setCategoryTitle("");
      setCategoryImage("");
      setIsFeatured(false);
      setIsSlugManuallyEdited(false);
    } else {
      setCategoryName("");
      setCategorySlug("");
      setParentCategory("");
      setIsActive(true);
      setShowInFooter(false);
      setShowInNavbar(false);
      setCategoryTitle("");
      setCategoryImage("");
      setIsFeatured(false);
      setIsSlugManuallyEdited(false);
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

  const handleDragOverImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleDragLeaveImage = () => {
    setIsDraggingImage(false);
  };

  const handleDropImage = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadImageFile(file);
  };

  const handleFileChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadImageFile(file);
  };

  const uploadImageFile = async (file: File) => {
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
    const toastId = toast.loading("Uploading category image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setCategoryImage(res.data.url);
        toast.success("Category image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to upload image", { id: toastId });
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
      if (formMode === "create" || formMode === "sub") {
        const payload = {
          name: categoryName,
          slug: categorySlug.trim() || undefined,
          parentCategory: parentCategory || undefined,
          isActive,
          showInFooter,
          showInNavbar,
          title: categoryTitle.trim() || undefined,
          image: categoryImage.trim() || undefined,
          isFeatured,
        };

        const res = await createCategory(payload).unwrap();
        toast.success(`Successfully created "${res?.data?.name || categoryName}"!`, { id: toastId });
        onSaveSuccess();
      } else if (formMode === "update" && activeCategory) {
        const payload = {
          id: activeCategory._id,
          data: {
            name: categoryName,
            slug: categorySlug.trim() || undefined,
            parentId: parentCategory || null,
            isActive,
            showInFooter,
            showInNavbar,
            title: categoryTitle.trim() || undefined,
            image: categoryImage.trim() || undefined,
            isFeatured,
          },
        };

        const res = await updateCategory(payload).unwrap();
        toast.success(`Successfully updated "${res?.data?.name || categoryName}"!`, { id: toastId });
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
    <div className="glass-card p-5 rounded-2xl border border-border sticky top-20">
      <div className="flex items-center gap-2 mb-4">
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
            {formMode === "create" && "Establish a new root category node"}
            {formMode === "sub" && "Configure child subcategory node"}
            {formMode === "update" && `Modifying settings for active category`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Category Name
          </label>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. Shoes, Laptops, Jeans"
            value={categoryName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* Category Title */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Category Title (Optional)
          </label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="e.g. Premium Leather Footwear Collection"
            value={categoryTitle}
            onChange={(e) => setCategoryTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* Category Image */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Category Image (Optional)
            </label>
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setImageUploadMode("upload")}
                className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                  imageUploadMode === "upload"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageUploadMode("url")}
                className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                  imageUploadMode === "url"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {imageUploadMode === "upload" ? (
            <div
              onDragOver={handleDragOverImage}
              onDragLeave={handleDragLeaveImage}
              onDrop={handleDropImage}
              className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDraggingImage
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card"
              }`}
              onClick={() => document.getElementById("category-image-file-input-id")?.click()}
            >
              <input
                type="file"
                id="category-image-file-input-id"
                className="hidden"
                accept="image/*"
                onChange={handleFileChangeImage}
                disabled={isUploadingImage || isSaving}
              />
              {categoryImage ? (
                <div className="relative w-24 h-24 mx-auto group">
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
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90 shadow transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-muted-foreground">
                  <UploadCloud size={24} className="mx-auto text-muted/50" />
                  {isUploadingImage ? (
                    <p className="text-[10px] font-semibold text-primary">Uploading image...</p>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold text-foreground">Drag & drop image file here</p>
                      <p className="text-[9px]">or click to browse (Max 2MB)</p>
                    </>
                  )}
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
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
              />
              {categoryImage && (
                <div className="mt-2 text-center">
                  <img
                    src={categoryImage}
                    alt="URL Preview"
                    className="max-h-20 max-w-full mx-auto object-contain rounded-lg border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Slug */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Category Slug
            </label>
            <span className="text-[9px] text-muted-foreground font-bold">
              {isSlugManuallyEdited ? "Custom Edit Mode" : "Auto-Generated"}
            </span>
          </div>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. shoes, laptops, jeans"
            value={categorySlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* Parent Category Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Parent Category
          </label>
          <select
            disabled={formMode === "sub" || isSaving}
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
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

        {/* Checkboxes */}
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
              <span className="text-[8px] text-muted-foreground">Show in featured</span>
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
              <span className="text-[10px] font-bold text-foreground leading-tight">Footer</span>
              <span className="text-[8px] text-muted-foreground">Show in footer</span>
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
              <span className="text-[10px] font-bold text-foreground leading-tight">Navbar</span>
              <span className="text-[8px] text-muted-foreground">Show in nav</span>
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

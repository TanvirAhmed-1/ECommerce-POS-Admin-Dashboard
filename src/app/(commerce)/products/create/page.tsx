"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetAllProductsQuery,
} from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery, useCreateCategoryMutation } from "@/redux/features/category/categoryApi";
import { useGetAllBrandsQuery, useCreateBrandMutation } from "@/redux/features/brand/brandApi";
import { useGetAllAttributesQuery } from "@/redux/features/attribute/attributeApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  Save,
  Info,
  Image as ImageIcon,
  Sliders,
  DollarSign,
  Globe,
} from "lucide-react";

import GeneralTab from "@/components/ui/commerce/products/create/GeneralTab";
import MediaTab from "@/components/ui/commerce/products/create/MediaTab";
import PricingTab from "@/components/ui/commerce/products/create/PricingTab";
import SeoTab from "@/components/ui/commerce/products/create/SeoTab";
import VariantsTab from "@/components/ui/commerce/products/create/VariantsTab";
import ListingDetailsSidebar from "@/components/ui/commerce/products/create/ListingDetailsSidebar";
import QuickAddModals from "@/components/ui/commerce/products/create/QuickAddModals";
import VariantImagesModal from "@/components/ui/commerce/products/create/VariantImagesModal";

// Mock Fallbacks
const defaultCategories = [
  { _id: "mock-1", name: "Electronics", children: [] },
  { _id: "mock-2", name: "Apparel & Fashion", children: [] },
];

const defaultBrands = [
  { _id: "mock-b1", name: "Apex" },
  { _id: "mock-b2", name: "Bata" },
  { _id: "mock-b3", name: "Lotto" },
];

const defaultAttributes = [
  { _id: "attr-1", name: "Color", slug: "color", values: ["Black", "White", "Navy Blue", "Crimson Red"] },
  { _id: "attr-2", name: "Size", slug: "size", values: ["S", "M", "L", "XL"] },
];

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Active Wizard Tab
  const [activeTab, setActiveTab] = useState<"general" | "media" | "pricing" | "seo" | "variants">("general");

  // RTK Queries & Mutations
  const { data: productsRes, refetch: refetchProducts } = useGetAllProductsQuery({});
  const { data: categoriesRes, refetch: refetchCategories } = useGetAllCategoriesQuery({});
  const { data: brandsRes, refetch: refetchBrands } = useGetAllBrandsQuery({});
  const { data: attributesRes } = useGetAllAttributesQuery({});

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [createBrand] = useCreateBrandMutation();
  const [uploadSingleImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation();

  const isSaving = isCreating || isUpdating;

  const showApiError = (err: any, toastId?: string) => {
    console.error(err);
    const errorSources = err?.data?.errorSources;
    if (Array.isArray(errorSources) && errorSources.length > 0) {
      errorSources.forEach((source: any) => {
        toast.error(`${source.path}: ${source.message}`);
      });
      if (toastId) toast.dismiss(toastId);
    } else {
      const msg = err?.data?.message || err?.message || "An unexpected error occurred.";
      toast.error(msg, { id: toastId });
    }
  };

  // Local state fallbacks
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  // Modals for Quick Add
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  // Load backend data or local storage fallbacks
  useEffect(() => {
    if (categoriesRes?.data && categoriesRes.data.length > 0) {
      setCategories(categoriesRes.data);
    } else if (Array.isArray(categoriesRes) && categoriesRes.length > 0) {
      setCategories(categoriesRes);
    } else {
      const savedCats = localStorage.getItem("zenith_categories");
      if (savedCats) {
        try { setCategories(JSON.parse(savedCats)); } catch (e) { setCategories(defaultCategories); }
      } else {
        setCategories(defaultCategories);
      }
    }
  }, [categoriesRes]);

  useEffect(() => {
    if (brandsRes?.data && brandsRes.data.length > 0) {
      setBrands(brandsRes.data);
    } else if (Array.isArray(brandsRes) && brandsRes.length > 0) {
      setBrands(brandsRes);
    } else {
      const savedBrands = localStorage.getItem("zenith_brands");
      if (savedBrands) {
        try { setBrands(JSON.parse(savedBrands)); } catch (e) { setBrands(defaultBrands); }
      } else {
        setBrands(defaultBrands);
      }
    }
  }, [brandsRes]);

  useEffect(() => {
    if (attributesRes?.data && attributesRes.data.length > 0) {
      setAttributes(attributesRes.data);
    } else if (Array.isArray(attributesRes) && attributesRes.length > 0) {
      setAttributes(attributesRes);
    } else {
      const savedAttrs = localStorage.getItem("zenith_attributes");
      if (savedAttrs) {
        try { setAttributes(JSON.parse(savedAttrs)); } catch (e) { setAttributes(defaultAttributes); }
      } else {
        setAttributes(defaultAttributes);
      }
    }
  }, [attributesRes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenith_products");
      if (saved) {
        try { setLocalProducts(JSON.parse(saved)); } catch (e) { console.error(e); }
      }
    }
  }, []);

  // Form Field States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Pricing & Stock
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [resellerPrice, setResellerPrice] = useState<number | "">(0);
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat");
  const [productDiscount, setProductDiscount] = useState<number | "">(0);
  const [vat, setVat] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number | "">("");
  const [baseSku, setBaseSku] = useState("");

  // Relations & Visibility
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [visibility, setVisibility] = useState<"published" | "hidden" | "out_of_stock">("published");
  const [isActive, setIsActive] = useState(true);

  // Design/Badge Fields
  const [isRecommended, setIsRecommended] = useState(false);
  const [isCategoryProduct, setIsCategoryProduct] = useState(false);
  const [isTopSelling, setIsTopSelling] = useState(false);

  // Media (Thumbnail vs Images)
  const [thumbnail, setThumbnail] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featuredImageIdx, setFeaturedImageIdx] = useState<number>(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Upload States
  const [thumbnailUploadMode, setThumbnailUploadMode] = useState<"upload" | "url">("upload");
  const [galleryUploadMode, setGalleryUploadMode] = useState<"upload" | "url">("upload");
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // SEO Fields State
  const [seoMetaTitle, setSeoMetaTitle] = useState("");
  const [seoMetaDescription, setSeoMetaDescription] = useState("");
  const [seoMetaKeywords, setSeoMetaKeywords] = useState("");

  // Attributes & Variants configuration
  const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);
  const [selectedAttrValues, setSelectedAttrValues] = useState<Record<string, string[]>>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [activeVariantImageEditId, setActiveVariantImageEditId] = useState<string | null>(null);

  // Compute Categories dropdown listing
  const parentCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const subcategories = useMemo(() => {
    if (!category) return [];
    const parentNode = categories.find((c) => c._id === category);
    return parentNode?.children || [];
  }, [categories, category]);

  // Load existing product for editing
  useEffect(() => {
    if (editId) {
      let allProds: any[] = [];
      if (productsRes?.data) {
        if (Array.isArray(productsRes.data.data)) {
          allProds = productsRes.data.data;
        } else if (Array.isArray(productsRes.data)) {
          allProds = productsRes.data;
        }
      }
      if (allProds.length === 0 && Array.isArray(localProducts)) {
        allProds = localProducts;
      }

      const target = allProds.find((p: any) => p._id === editId || p.id === editId);

      if (target) {
        setName(target.name || "");
        setSlug(target.slug || "");
        setShortDescription(target.shortDescription || "");
        setDescription(target.description || "");

        setBasePrice(target.basePrice !== undefined ? target.basePrice : "");
        setSalePrice(target.salePrice !== undefined ? target.salePrice : "");
        setResellerPrice(target.resellerPrice !== undefined ? target.resellerPrice : 0);
        setDiscountType(target.discountType || "flat");
        setProductDiscount(target.productDiscount !== undefined ? target.productDiscount : 0);
        setVat(target.vat !== undefined ? target.vat : 0);

        setBaseStock(target.totalStock !== undefined ? target.totalStock : (target.stock || ""));
        setBaseSku(target.sku || "");

        setCategory(target.category?._id || target.category || "");
        setSubcategory(target.subcategory?._id || target.subcategory || "");
        setBrand(target.brand?._id || target.brand || "");

        setVisibility(target.visibility || "published");
        setIsActive(target.isActive !== undefined ? target.isActive : true);

        setIsRecommended(target.isRecommended || false);
        setIsCategoryProduct(target.isCategoryProduct || false);
        setIsTopSelling(target.isTopSelling || false);

        setThumbnail(target.thumbnail || "");
        setImageUrls(target.images || []);
        setFeaturedImageIdx(0);
        setIsSlugManuallyEdited(true);

        if (target.seo) {
          setSeoMetaTitle(target.seo.metaTitle || "");
          setSeoMetaDescription(target.seo.metaDescription || "");
          setSeoMetaKeywords(Array.isArray(target.seo.metaKeywords) ? target.seo.metaKeywords.join(", ") : "");
        }

        if (target.variants || target.productVariants) {
          const loadedVariants = target.variants || target.productVariants || [];

          const attrIds: string[] = [];
          const attrVals: Record<string, string[]> = {};

          const mappedVariants = loadedVariants.map((v: any) => {
            let attributesObj: Record<string, string> = {};
            if (Array.isArray(v.attributes)) {
              v.attributes.forEach((attr: any) => {
                const attrId = attr.attribute?._id || attr.attribute;
                const attrName = attr.attribute?.name;
                if (attrId && attr.value) {
                  if (!attrIds.includes(attrId)) {
                    attrIds.push(attrId);
                  }
                  if (!attrVals[attrId]) {
                    attrVals[attrId] = [];
                  }
                  if (!attrVals[attrId].includes(attr.value)) {
                    attrVals[attrId].push(attr.value);
                  }

                  if (attrName) {
                    attributesObj[attrName] = attr.value;
                  }
                }
              });
            } else if (v.attributes && typeof v.attributes === "object") {
              attributesObj = v.attributes;
            }

            const nameParts = Object.values(attributesObj);
            const variantName = nameParts.length > 0 ? nameParts.join(" / ") : (v.name || v.sku || "Variant");

            return {
              ...v,
              id: v.id || v._id,
              name: variantName,
              attributes: attributesObj,
              price: v.price || 0,
              stock: v.stock || 0,
              sku: v.sku || "",
              images: v.images || (v.image ? [v.image] : []),
            };
          });

          setSelectedAttrIds(target.selectedAttrIds || attrIds);
          setSelectedAttrValues(target.selectedAttrValues || attrVals);
          setVariants(mappedVariants);
        }
      }
    }
  }, [editId, productsRes, localProducts]);

  const slugifyString = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleUpdateVariantField = (varId: string, field: string, value: any) => {
    setVariants(
      variants.map((v) => {
        if (v.id === varId || v._id === varId) {
          return {
            ...v,
            [field]: ["sku", "image", "images"].includes(field) ? value : Number(value) || 0,
          };
        }
        return v;
      })
    );
  };

  // Quick Add Category Action
  const handleQuickAddCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setIsSavingCategory(true);
    const toastId = toast.loading("Adding category...");

    try {
      const isApiAvailable = categoriesRes?.data !== undefined;

      if (isApiAvailable) {
        const res = await createCategory({ name: trimmed }).unwrap();
        toast.success(`Category "${trimmed}" added!`, { id: toastId });
        refetchCategories();
        if (res?.data?._id) setCategory(res.data._id);
      } else {
        const savedCats = localStorage.getItem("zenith_categories");
        let parsed = savedCats ? JSON.parse(savedCats) : defaultCategories;
        const newCat = { _id: `cat-${Date.now()}`, name: trimmed, children: [] };
        parsed = [...parsed, newCat];
        localStorage.setItem("zenith_categories", JSON.stringify(parsed));
        setCategories(parsed);
        setCategory(newCat._id);
        toast.success(`Category "${trimmed}" added locally!`, { id: toastId });
      }

      setNewCatName("");
      setShowCategoryModal(false);
    } catch (e: any) {
      showApiError(e, toastId);
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Quick Add Brand Action
  const handleQuickAddBrand = async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    setIsSavingBrand(true);
    const toastId = toast.loading("Adding brand...");

    try {
      const isApiAvailable = brandsRes?.data !== undefined;

      if (isApiAvailable) {
        const res = await createBrand({ name: trimmed }).unwrap();
        toast.success(`Brand "${trimmed}" added!`, { id: toastId });
        refetchBrands();
        if (res?.data?._id) setBrand(res.data._id);
      } else {
        const savedBrands = localStorage.getItem("zenith_brands");
        let parsed = savedBrands ? JSON.parse(savedBrands) : defaultBrands;
        const newBrand = { _id: `brand-${Date.now()}`, name: trimmed };
        parsed = [...parsed, newBrand];
        localStorage.setItem("zenith_brands", JSON.stringify(parsed));
        setBrands(parsed);
        setBrand(newBrand._id);
        toast.success(`Brand "${trimmed}" added locally!`, { id: toastId });
      }

      setNewBrandName("");
      setShowBrandModal(false);
    } catch (e: any) {
      showApiError(e, toastId);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required!");
      return;
    }
    if (!shortDescription.trim() || shortDescription.trim().length < 10) {
      toast.error("Short description is required (min 10 characters)!");
      return;
    }
    if (!category) {
      toast.error("Please select a Category!");
      return;
    }
    if (!thumbnail.trim()) {
      toast.error("Thumbnail image is required!");
      return;
    }
    if (basePrice === "") {
      toast.error("Base price is required!");
      return;
    }
    if (resellerPrice === "") {
      toast.error("Reseller price is required!");
      return;
    }
    if (Number(resellerPrice) <= Number(basePrice)) {
      toast.error("Reseller price must be greater than base price!");
      return;
    }
    if (salePrice === "") {
      toast.error("Sale price is required!");
      return;
    }
    if (Number(salePrice) <= Number(resellerPrice)) {
      toast.error("Sale price must be greater than reseller price!");
      return;
    }

    const toastId = toast.loading(editId ? "Updating product..." : "Saving new product...");

    // Split SEO keywords
    const keywordsArray = seoMetaKeywords
      ? seoMetaKeywords.split(",").map(k => k.trim()).filter(Boolean)
      : [];

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugifyString(name),
      shortDescription: shortDescription.trim(),
      description: description.trim() || undefined,

      category,
      subcategory: subcategory || undefined,
      brand: brand || undefined,

      thumbnail: thumbnail.trim(),
      images: imageUrls,

      basePrice: Number(basePrice),
      salePrice: Number(salePrice),
      resellerPrice: Number(resellerPrice),
      discountType,
      productDiscount: Number(productDiscount) || 0,
      vat: Number(vat) || 0,

      hasVariants: variants.length > 0,
      totalStock: baseStock !== "" ? Number(baseStock) : 0,
      sku: baseSku.trim() || undefined,
      variants: variants.length > 0 ? variants.map(v => {
        let mappedAttributes: { attribute: string; value: string }[] = [];

        if (Array.isArray(v.attributes)) {
          mappedAttributes = v.attributes.map((attr: any) => ({
            attribute: attr.attribute?._id || attr.attribute,
            value: attr.value,
          }));
        } else if (v.attributes && typeof v.attributes === "object") {
          mappedAttributes = Object.entries(v.attributes).map(([attrName, attrVal]) => {
            const matchedAttr = attributes.find((a: any) => a.name === attrName);
            return {
              attribute: matchedAttr?._id || attrName,
              value: String(attrVal),
            };
          });
        }

        return {
          sku: v.sku,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          images: v.images || [],
          isActive: v.isActive !== undefined ? v.isActive : true,
          attributes: mappedAttributes,
        };
      }) : undefined,

      isRecommended,
      isCategoryProduct,
      isTopSelling,

      visibility,
      isActive,

      seo: {
        metaTitle: seoMetaTitle.trim() || undefined,
        metaDescription: seoMetaDescription.trim() || undefined,
        metaKeywords: keywordsArray,
      }
    };

    try {
      const isApiAvailable = productsRes?.data !== undefined;
      const isMongoId = editId ? /^[0-9a-fA-F]{24}$/.test(editId) : false;

      if (isApiAvailable && (!editId || isMongoId)) {
        if (editId) {
          await updateProduct({ id: editId, data: payload }).unwrap();
          toast.success("Successfully updated product!", { id: toastId });
        } else {
          await createProduct(payload).unwrap();
          toast.success("Successfully created product!", { id: toastId });
        }
        refetchProducts();
      } else {
        let updatedList: any[] = [];
        if (editId) {
          updatedList = localProducts.map((p) =>
            p._id === editId || p.id === editId ? { ...p, ...payload } : p
          );
          toast.success("Product updated locally!", { id: toastId });
        } else {
          const newProd = {
            _id: `prod-${Date.now()}`,
            id: `prod-${Date.now()}`,
            ...payload,
          };
          updatedList = [newProd, ...localProducts];
          toast.success("Product created locally!", { id: toastId });
        }
        localStorage.setItem("zenith_products", JSON.stringify(updatedList));
      }

      router.push("/products");
    } catch (err: any) {
      showApiError(err, toastId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/products")}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer transition-all hover:bg-muted/30"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Commerce</span>
              <span>/</span>
              <span>Products</span>
              <span>/</span>
              <span className="text-foreground font-semibold">
                {editId ? "Edit" : "New"} Product
              </span>
            </div>
            <h1 className="font-heading text-xl font-black tracking-tight text-foreground md:text-2xl mt-1">
              {editId ? "Modify Product Details" : "Create Product Wizard"}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="h-10 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50"
        >
          {isSaving ? (
            <Spinner className="w-4 h-4 mr-1 animate-spin text-white" />
          ) : (
            <Save size={14} />
          )}
          <span>{isSaving ? "Saving..." : "Publish Product"}</span>
        </button>
      </div>

      {/* Modern Stepper Tabs */}
      <div className="flex border-b border-border gap-6 overflow-x-auto pb-0.5 custom-scrollbar">
        {[
          { key: "general", label: "1. Info & Relations", icon: <Info size={14} /> },
          { key: "media", label: "2. Product Media", icon: <ImageIcon size={14} /> },
          { key: "pricing", label: "3. Pricing & Inventory", icon: <DollarSign size={14} /> },
          { key: "seo", label: "4. SEO Configurations", icon: <Globe size={14} /> },
          { key: "variants", label: "5. Specifications & Variants", icon: <Sliders size={14} /> },
        ].map((tab) => (
          <button
            className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all relative cursor-pointer select-none whitespace-nowrap ${
              activeTab === tab.key
                ? "text-primary font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Workspace Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Segment depending on active tab */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "general" && (
            <GeneralTab
              name={name}
              setName={setName}
              slug={slug}
              setSlug={setSlug}
              shortDescription={shortDescription}
              setShortDescription={setShortDescription}
              description={description}
              setDescription={setDescription}
              isSlugManuallyEdited={isSlugManuallyEdited}
              setIsSlugManuallyEdited={setIsSlugManuallyEdited}
              baseSku={baseSku}
              setBaseSku={setBaseSku}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "media" && (
            <MediaTab
              thumbnailUploadMode={thumbnailUploadMode}
              setThumbnailUploadMode={setThumbnailUploadMode}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              galleryUploadMode={galleryUploadMode}
              setGalleryUploadMode={setGalleryUploadMode}
              isDraggingThumbnail={isDraggingThumbnail}
              setIsDraggingThumbnail={setIsDraggingThumbnail}
              isDraggingGallery={isDraggingGallery}
              setIsDraggingGallery={setIsDraggingGallery}
              isUploadingImage={isUploadingImage}
              newImageUrl={newImageUrl}
              setNewImageUrl={setNewImageUrl}
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
              uploadSingleImage={uploadSingleImage}
              showApiError={showApiError}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "pricing" && (
            <PricingTab
              basePrice={basePrice}
              setBasePrice={setBasePrice}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
              resellerPrice={resellerPrice}
              setResellerPrice={setResellerPrice}
              discountType={discountType}
              setDiscountType={setDiscountType}
              productDiscount={productDiscount}
              setProductDiscount={setProductDiscount}
              vat={vat}
              setVat={setVat}
              baseStock={baseStock}
              setBaseStock={setBaseStock}
              baseSku={baseSku}
              setBaseSku={setBaseSku}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "seo" && (
            <SeoTab
              seoMetaTitle={seoMetaTitle}
              setSeoMetaTitle={setSeoMetaTitle}
              seoMetaKeywords={seoMetaKeywords}
              setSeoMetaKeywords={setSeoMetaKeywords}
              seoMetaDescription={seoMetaDescription}
              setSeoMetaDescription={setSeoMetaDescription}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "variants" && (
            <VariantsTab
              attributes={attributes}
              selectedAttrIds={selectedAttrIds}
              setSelectedAttrIds={setSelectedAttrIds}
              selectedAttrValues={selectedAttrValues}
              setSelectedAttrValues={setSelectedAttrValues}
              variants={variants}
              setVariants={setVariants}
              setActiveVariantImageEditId={setActiveVariantImageEditId}
              slug={slug}
              basePrice={basePrice}
              baseStock={baseStock}
              thumbnail={thumbnail}
              imageUrls={imageUrls}
              isSaving={isSaving}
              handleSubmit={handleSubmit}
              uploadSingleImage={uploadSingleImage}
              showApiError={showApiError}
              setActiveTab={setActiveTab}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4">
          <ListingDetailsSidebar
            visibility={visibility}
            setVisibility={setVisibility}
            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
            brand={brand}
            setBrand={setBrand}
            parentCategories={parentCategories}
            subcategories={subcategories}
            brands={brands}
            isActive={isActive}
            setIsActive={setIsActive}
            isRecommended={isRecommended}
            setIsRecommended={setIsRecommended}
            isCategoryProduct={isCategoryProduct}
            setIsCategoryProduct={setIsCategoryProduct}
            isTopSelling={isTopSelling}
            setIsTopSelling={setIsTopSelling}
            setShowCategoryModal={setShowCategoryModal}
            setShowBrandModal={setShowBrandModal}
          />
        </div>
      </div>

      {/* Quick Add Modals */}
      <QuickAddModals
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        isSavingCategory={isSavingCategory}
        handleQuickAddCategory={handleQuickAddCategory}
        showBrandModal={showBrandModal}
        setShowBrandModal={setShowBrandModal}
        newBrandName={newBrandName}
        setNewBrandName={setNewBrandName}
        isSavingBrand={isSavingBrand}
        handleQuickAddBrand={handleQuickAddBrand}
      />

      {/* Manage Variant Images Modal */}
      <VariantImagesModal
        activeVariantImageEditId={activeVariantImageEditId}
        setActiveVariantImageEditId={setActiveVariantImageEditId}
        variants={variants}
        handleUpdateVariantField={handleUpdateVariantField}
        uploadSingleImage={uploadSingleImage}
        showApiError={showApiError}
      />
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader />
        </div>
      }>
        <ProductFormContent />
      </Suspense>
    </DashboardLayout>
  );
}

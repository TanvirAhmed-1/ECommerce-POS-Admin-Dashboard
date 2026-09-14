import React from "react";
import {
  Sparkles,
  Barcode,
  Hash,
  Layers,
  Tag,
  Scale,
  Shirt,
  Ruler,
  FolderTree,
  Plus,
  RefreshCw,
  Info,
} from "lucide-react";

interface GeneralTabProps {
  name: string;
  setName: (val: string) => void;
  productCode: string;
  setProductCode: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  subcategory: string;
  setSubcategory: (val: string) => void;
  parentCategories: any[];
  subcategories: any[];
  setShowCategoryModal: (val: boolean) => void;
  brand: string;
  setBrand: (val: string) => void;
  brands: any[];
  setShowBrandModal: (val: boolean) => void;
  materials: string;
  setMaterials: (val: string) => void;
  unitMeasure: string;
  setUnitMeasure: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  isSlugManuallyEdited: boolean;
  setIsSlugManuallyEdited: (val: boolean) => void;
  baseSku: string;
  setBaseSku: (val: string) => void;
  barcode: string;
  setBarcode: (val: string) => void;
  weight: number | "";
  setWeight: (val: number | "") => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  setActiveTab: (val: any) => void;
}

export default function GeneralTab({
  name,
  setName,
  productCode,
  setProductCode,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  parentCategories,
  subcategories,
  setShowCategoryModal,
  brand,
  setBrand,
  brands,
  setShowBrandModal,
  materials,
  setMaterials,
  unitMeasure,
  setUnitMeasure,
  gender,
  setGender,
  slug,
  setSlug,
  isSlugManuallyEdited,
  setIsSlugManuallyEdited,
  baseSku,
  setBaseSku,
  barcode,
  setBarcode,
  weight,
  setWeight,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  setActiveTab,
}: GeneralTabProps) {
  const slugifyString = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const generateProductCode = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const prefix = name ? name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "PRD") : "PRD";
    setProductCode(`${prefix}-${randomNum}`);
  };

  const generateBarcode = () => {
    // Generate a standard EAN-13 format random barcode
    let code = "890";
    for (let i = 0; i < 9; i++) {
      code += Math.floor(Math.random() * 10);
    }
    // Simple checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    setBarcode(`${code}${checkDigit}`);
  };

  const generateSku = () => {
    const base = slug ? slug.toUpperCase().slice(0, 8) : "PROD";
    const random = Math.floor(100 + Math.random() * 900);
    setBaseSku(`${base}-${random}`);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      const slugValue = slugifyString(val);
      setSlug(slugValue);
      if (baseSku === "" || baseSku.startsWith(slugifyString(name))) {
        setBaseSku(slugValue.toUpperCase() + "-BASE");
      }
    }
    if (!productCode && val.trim().length >= 3) {
      const prefix = val.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "PRD");
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setProductCode(`${prefix}-${randomNum}`);
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={16} className="text-primary animate-pulse" />
          Base Information & Identification
        </h3>
        <span className="text-[10px] text-muted-foreground font-semibold px-2.5 py-1 rounded-full bg-muted/60">
          Core Attributes
        </span>
      </div>

      {/* Row 1: Product Name, Product Code & Product Slug */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Product Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Classic Oxford Cotton Shirt"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Product Code */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Hash size={12} className="text-primary" /> Product Code
            </label>
            <button
              type="button"
              onClick={generateProductCode}
              className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw size={10} /> Auto
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. PRD-89421"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value.toUpperCase())}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Row 2: Category & Brand Selection with Quick Add buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border border-border/60">
        {/* Category */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <FolderTree size={12} className="text-primary" /> Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus size={10} /> Quick Add
            </button>
          </div>
          <select
            value={category}
            required
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Select Category...</option>
            {parentCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <FolderTree size={12} className="text-muted-foreground" /> Subcategory
          </label>
          <select
            value={subcategory}
            disabled={!category || subcategories.length === 0}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary cursor-pointer disabled:opacity-50"
          >
            <option value="">
              {category
                ? subcategories.length === 0
                  ? "No Subcategories available"
                  : "Select Subcategory..."
                : "Select Category first"}
            </option>
            {subcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-primary" /> Brand
            </label>
            <button
              type="button"
              onClick={() => setShowBrandModal(true)}
              className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus size={10} /> Quick Add
            </button>
          </div>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Select Brand (Optional)...</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Product Slug, Product SKU & Barcode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Product Slug */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Product Slug <span className="text-red-500">*</span>
            </label>
            <span className="text-[9px] text-muted-foreground font-semibold">
              {isSlugManuallyEdited ? "Custom" : "Auto"}
            </span>
          </div>
          <input
            type="text"
            required
            placeholder="e.g. classic-oxford-shirt"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Product SKU */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Product SKU
            </label>
            <button
              type="button"
              onClick={generateSku}
              className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw size={10} /> Auto
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. OXFORD-BASE-01"
            value={baseSku}
            onChange={(e) => setBaseSku(e.target.value.toUpperCase())}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Barcode */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Barcode size={12} className="text-primary" /> Barcode / UPC
            </label>
            <button
              type="button"
              onClick={generateBarcode}
              className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw size={10} /> Auto
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. 8901234567890"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.trim())}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Row 4: Materials, Unit Measure, Gender & Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Materials */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Layers size={12} className="text-primary" /> Materials
          </label>
          <input
            type="text"
            placeholder="e.g. 100% Cotton, Leather"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Unit Measure */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Ruler size={12} className="text-primary" /> Unit Measure
          </label>
          <select
            value={unitMeasure}
            onChange={(e) => setUnitMeasure(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="pcs">Pieces (pcs)</option>
            <option value="box">Box (box)</option>
            <option value="pack">Pack (pack)</option>
            <option value="set">Set (set)</option>
            <option value="pair">Pair (pair)</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="gm">Gram (g)</option>
            <option value="ltr">Litre (ltr)</option>
            <option value="ml">Millilitre (ml)</option>
            <option value="meter">Meter (m)</option>
            <option value="yard">Yard (yd)</option>
            <option value="roll">Roll (roll)</option>
          </select>
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Shirt size={12} className="text-primary" /> Target Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">Universal / All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
            <option value="kids">Kids</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Scale size={12} className="text-primary" /> Weight (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 0.45"
              value={weight}
              onChange={(e) => setWeight(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full h-10 pl-3 pr-10 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
              KG
            </span>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-4 pt-2 border-t border-border/40">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Short Description <span className="text-red-500">*</span> (min 10 characters)
          </label>
          <input
            type="text"
            required
            placeholder="A quick, punchy summary of key features and highlights..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Detailed Description (Optional)
          </label>
          <textarea
            rows={5}
            placeholder="Enter comprehensive information regarding composition, wash instructions, sizing, specifications..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
          />
        </div>
      </div>

      {/* Next Step Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className="h-9 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer shadow-sm shadow-primary/20 transition-all flex items-center gap-1.5"
        >
          <span>Continue to Media</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

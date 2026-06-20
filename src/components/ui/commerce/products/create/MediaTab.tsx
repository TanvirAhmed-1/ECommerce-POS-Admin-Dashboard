import React from "react";
import { Image as ImageIcon, UploadCloud, Trash2, X, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-hot-toast";

interface MediaTabProps {
  thumbnailUploadMode: "upload" | "url";
  setThumbnailUploadMode: (val: "upload" | "url") => void;
  thumbnail: string;
  setThumbnail: (val: string) => void;
  galleryUploadMode: "upload" | "url";
  setGalleryUploadMode: (val: "upload" | "url") => void;
  isDraggingThumbnail: boolean;
  setIsDraggingThumbnail: (val: boolean) => void;
  isDraggingGallery: boolean;
  setIsDraggingGallery: (val: boolean) => void;
  isUploadingImage: boolean;
  newImageUrl: string;
  setNewImageUrl: (val: string) => void;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  uploadSingleImage: any;
  showApiError: (err: any, toastId?: string) => void;
  setActiveTab: (val: any) => void;
}

export default function MediaTab({
  thumbnailUploadMode,
  setThumbnailUploadMode,
  thumbnail,
  setThumbnail,
  galleryUploadMode,
  setGalleryUploadMode,
  isDraggingThumbnail,
  setIsDraggingThumbnail,
  isDraggingGallery,
  setIsDraggingGallery,
  isUploadingImage,
  newImageUrl,
  setNewImageUrl,
  imageUrls,
  setImageUrls,
  uploadSingleImage,
  showApiError,
  setActiveTab,
}: MediaTabProps) {
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
    const toastId = toast.loading("Uploading thumbnail...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setThumbnail(res.data.url);
        toast.success("Thumbnail uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err: any) {
      showApiError(err, toastId);
    }
  };

  const uploadGalleryFiles = async (files: File[]) => {
    const validFiles = files.filter(f => {
      if (!f.type.startsWith("image/")) {
        toast.error(`"${f.name}" is not an image!`);
        return false;
      }
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the 2MB size limit!`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const toastId = toast.loading(`Uploading ${validFiles.length} image(s)...`);
    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await uploadSingleImage(formData).unwrap();
        if (res?.success && res?.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }
      if (uploadedUrls.length > 0) {
        setImageUrls(prev => [...prev, ...uploadedUrls]);
        toast.success(`Uploaded ${uploadedUrls.length} image(s) successfully!`, { id: toastId });
      } else {
        toast.error("Failed to upload images", { id: toastId });
      }
    } catch (err: any) {
      showApiError(err, toastId);
    }
  };

  const handleAddImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newImageUrl.trim();
    if (!clean) return;

    if (imageUrls.includes(clean)) {
      toast.error("Image URL is already added.");
      return;
    }

    setImageUrls([...imageUrls, clean]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Thumbnail Upload */}
      <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={16} className="text-primary" />
            Product Thumbnail (Main Image)
          </h3>

          <div className="flex gap-1 p-0.5 rounded-lg bg-muted border border-border">
            <button
              type="button"
              onClick={() => setThumbnailUploadMode("upload")}
              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                thumbnailUploadMode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setThumbnailUploadMode("url")}
              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                thumbnailUploadMode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              URL Link
            </button>
          </div>
        </div>

        {thumbnailUploadMode === "upload" ? (
          <div>
            {thumbnail ? (
              <div className="relative group rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3 min-h-[90px]">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate max-w-[250px]">
                      Main Thumbnail Image
                    </p>
                    <p className="text-[9px] text-muted-foreground truncate max-w-[250px]">
                      {thumbnail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingThumbnail(true); }}
                onDragLeave={() => setIsDraggingThumbnail(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDraggingThumbnail(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) await uploadThumbnailFile(file);
                }}
                onClick={() => document.getElementById("thumbnail-file-input")?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDraggingThumbnail
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                }`}
              >
                <input
                  id="thumbnail-file-input"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadThumbnailFile(file);
                  }}
                  className="hidden"
                />
                {isUploadingImage ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-1">
                    <Spinner className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground">Uploading image...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={28} className="text-muted-foreground/60" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-foreground">Drag & drop thumbnail file here</p>
                      <p className="text-[9px] text-muted-foreground">
                        or <span className="text-primary hover:underline font-bold">browse your files</span>
                      </p>
                    </div>
                    <p className="text-[8px] text-muted-foreground/80">JPG, PNG, WEBP (Max 2MB)</p>
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
              placeholder="Paste thumbnail image URL e.g. https://domain.com/image.png"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Additional Product Gallery Images */}
      <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={16} className="text-primary" />
            Additional Product Gallery Images
          </h3>

          <div className="flex gap-1 p-0.5 rounded-lg bg-muted border border-border">
            <button
              type="button"
              onClick={() => setGalleryUploadMode("upload")}
              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                galleryUploadMode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => setGalleryUploadMode("url")}
              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                galleryUploadMode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              URL Link
            </button>
          </div>
        </div>

        {galleryUploadMode === "upload" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
            onDragLeave={() => setIsDraggingGallery(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDraggingGallery(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) await uploadGalleryFiles(files);
            }}
            onClick={() => document.getElementById("gallery-file-input")?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDraggingGallery
                ? "border-primary bg-primary/5"
                : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
            }`}
          >
            <input
              id="gallery-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) await uploadGalleryFiles(files);
              }}
              className="hidden"
            />
            {isUploadingImage ? (
              <div className="flex flex-col items-center justify-center gap-2 py-1">
                <Spinner className="w-6 h-6 animate-spin text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground">Uploading image...</span>
              </div>
            ) : (
              <>
                <UploadCloud size={28} className="text-muted-foreground/60" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-foreground">Drag & drop multiple files here</p>
                  <p className="text-[9px] text-muted-foreground">
                    or <span className="text-primary hover:underline font-bold">browse your files</span>
                  </p>
                </div>
                <p className="text-[8px] text-muted-foreground/80">Upload up to 10 additional images (Max 2MB each)</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste additional image URL e.g. https://domain.com/image-2.png"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => handleAddImage()}
              className="h-10 px-4 border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        )}

        {/* Images Preview Grid */}
        {imageUrls.length > 0 ? (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
              Gallery Images ({imageUrls.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative h-24 rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={url}
                    alt={`Gallery preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex justify-end p-1.5">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 h-6 w-6 bg-black/60 hover:bg-rose-500 rounded-md text-white cursor-pointer flex items-center justify-center"
                      title="Delete Image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground bg-muted/10">
            <ImageIcon className="mx-auto text-muted/30" size={32} />
            <p className="text-xs font-bold">No gallery images uploaded yet</p>
            <p className="text-[10px]">Populate additional product catalog slider items.</p>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className="h-9 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
        >
          Continue to Pricing
        </button>
      </div>
    </div>
  );
}

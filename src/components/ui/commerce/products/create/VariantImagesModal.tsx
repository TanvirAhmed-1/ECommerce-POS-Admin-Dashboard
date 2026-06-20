import React from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface VariantImagesModalProps {
  activeVariantImageEditId: string | null;
  setActiveVariantImageEditId: (val: string | null) => void;
  variants: any[];
  handleUpdateVariantField: (id: string, field: string, val: any) => void;
  uploadSingleImage: any;
  showApiError: (err: any, toastId?: string) => void;
}

export default function VariantImagesModal({
  activeVariantImageEditId,
  setActiveVariantImageEditId,
  variants,
  handleUpdateVariantField,
  uploadSingleImage,
  showApiError,
}: VariantImagesModalProps) {
  if (!activeVariantImageEditId) return null;

  const targetVariant = variants.find(
    (v) => v.id === activeVariantImageEditId || v._id === activeVariantImageEditId
  );
  if (!targetVariant) return null;
  const varImages = targetVariant.images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-card w-full max-w-[500px] p-6 rounded-2xl border border-border bg-card shadow-2xl relative animate-scale-in">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
        <button
          type="button"
          onClick={() => setActiveVariantImageEditId(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ImageIcon size={16} />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-foreground">Manage Variant Images</h4>
            <p className="text-[10px] text-muted-foreground truncate max-w-[340px]">
              {targetVariant.name}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Mode/Upload block */}
          <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Add New Image
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* File Upload Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-muted-foreground font-semibold">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("File size exceeds 2MB limit!");
                        return;
                      }
                      const formData = new FormData();
                      formData.append("image", file);
                      const toastId = toast.loading("Uploading variant image...");
                      try {
                        const res = await uploadSingleImage(formData).unwrap();
                        if (res?.success && res?.data?.url) {
                          const updatedImages = [...varImages, res.data.url];
                          handleUpdateVariantField(targetVariant.id || targetVariant._id, "images", updatedImages);
                          toast.success("Image added!", { id: toastId });
                        } else {
                          toast.error("Upload failed", { id: toastId });
                        }
                      } catch (err: any) {
                        showApiError(err, toastId);
                      }
                    }
                  }}
                  className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-md file:border file:border-border file:text-[10px] file:font-bold file:bg-card file:text-foreground file:hover:bg-muted cursor-pointer"
                />
              </div>

              {/* Paste URL Input */}
              <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2">
                <label className="text-[10px] text-muted-foreground font-semibold">Paste Image URL</label>
                <div className="flex gap-2">
                  <input
                    id="var-image-url-input"
                    type="url"
                    placeholder="https://domain.com/image.png"
                    className="flex-1 h-8 px-2 rounded-md border border-border bg-card text-xs outline-none focus:border-primary"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const input = e.currentTarget;
                        const url = input.value.trim();
                        if (url) {
                          const updatedImages = [...varImages, url];
                          handleUpdateVariantField(targetVariant.id || targetVariant._id, "images", updatedImages);
                          input.value = "";
                          toast.success("Image URL added!");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("var-image-url-input") as HTMLInputElement;
                      const url = input?.value.trim();
                      if (url) {
                        const updatedImages = [...varImages, url];
                        handleUpdateVariantField(targetVariant.id || targetVariant._id, "images", updatedImages);
                        input.value = "";
                        toast.success("Image URL added!");
                      }
                    }}
                    className="h-8 px-3 bg-muted border border-border text-foreground hover:bg-muted/80 text-xs font-bold rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List/Grid of images with Delete */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-heading">
              Variant Images ({varImages.length})
            </span>

            {varImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 max-h-[160px] overflow-y-auto custom-scrollbar p-1">
                {varImages.map((imgUrl: string, idx: number) => (
                  <div
                    key={idx}
                    className="group relative h-16 rounded-lg border border-border bg-card overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={imgUrl}
                      alt="Variant visual preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex justify-end p-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = varImages.filter((_: any, i: number) => i !== idx);
                          handleUpdateVariantField(targetVariant.id || targetVariant._id, "images", updated);
                        }}
                        className="p-0.5 h-5 w-5 bg-black/60 hover:bg-rose-500 rounded text-white flex items-center justify-center cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-6 text-center text-muted-foreground bg-muted/10">
                <ImageIcon className="mx-auto text-muted/30" size={24} />
                <p className="text-[10px] font-bold mt-1">No images added for this variant</p>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveVariantImageEditId(null)}
              className="h-9 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

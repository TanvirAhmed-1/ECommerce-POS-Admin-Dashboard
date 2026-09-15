import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  RotateCcw,
  Package,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  variantItem: any | null;
  onConfirm: (payload: {
    variantItem: any;
    mode: "add" | "deduct" | "set";
    quantity: number;
    resultingStock: number;
    reason: string;
    note: string;
  }) => Promise<void>;
  isUpdating: boolean;
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  variantItem,
  onConfirm,
  isUpdating,
}: StockAdjustmentModalProps) {
  const [mode, setMode] = useState<"add" | "deduct" | "set">("add");
  const [amount, setAmount] = useState<number | "">(10);
  const [reason, setReason] = useState("Supplier Restock");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode("add");
      setAmount(10);
      setReason("Supplier Restock");
      setNote("");
    }
  }, [isOpen, variantItem]);

  if (!isOpen || !variantItem) return null;

  const currentStock = Number(variantItem.stock) || 0;
  const numAmount = typeof amount === "number" ? amount : 0;

  let resultingStock = currentStock;
  if (mode === "add") {
    resultingStock = currentStock + numAmount;
  } else if (mode === "deduct") {
    resultingStock = Math.max(0, currentStock - numAmount);
  } else if (mode === "set") {
    resultingStock = Math.max(0, numAmount);
  }

  const delta = resultingStock - currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === "" || numAmount < 0) return;

    await onConfirm({
      variantItem,
      mode,
      quantity: numAmount,
      resultingStock,
      reason,
      note,
    });
  };

  const attributeEntries = Object.entries(variantItem.attributes || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-5 bg-card/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-foreground">
                Stock Adjustment
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Update stock level variation-wise with real-time audit logging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Variant Summary Card */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center shrink-0 border border-border overflow-hidden">
            {variantItem.productImage ? (
              <img
                src={variantItem.productImage}
                alt={variantItem.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src =
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                }}
              />
            ) : (
              <Package size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-primary tracking-wider truncate">
              {variantItem.productName}
            </p>
            <h4 className="text-xs font-bold text-foreground truncate mt-0.5">
              {variantItem.variantName}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border border-border text-foreground font-semibold">
                SKU: {variantItem.sku || "N/A"}
              </span>
              {attributeEntries.map(([k, v]) => (
                <Badge
                  key={k}
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 bg-muted/60 font-medium text-muted-foreground border-border"
                >
                  {k}: {String(v)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("add");
                  setReason("Supplier Restock");
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  mode === "add"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Plus size={16} />
                <span>Restock (+ Add)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("deduct");
                  setReason("Damaged / Defective");
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  mode === "deduct"
                    ? "border-rose-500 bg-rose-500/10 text-rose-500 ring-2 ring-rose-500/20"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Minus size={16} />
                <span>Deduct (- Loss)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("set");
                  setReason("Physical Audit Count");
                  setAmount(currentStock);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  mode === "set"
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <RotateCcw size={16} />
                <span>Set Exact (= Count)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                {mode === "set" ? "New Total Count" : "Quantity Units"}
              </label>
              <div className="flex gap-1">
                {[5, 10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="text-[10px] font-bold px-2 py-0.5 bg-muted/60 hover:bg-muted text-foreground rounded border border-border cursor-pointer transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value !== "" ? Number(e.target.value) : "")
              }
              placeholder="Enter quantity..."
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Stock Preview Calculation Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-muted/50 to-muted/20 border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Current Stock
              </p>
              <p className="text-base font-bold font-heading text-foreground">
                {currentStock} units
              </p>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <ArrowRight size={18} />
            </div>

            <div className="space-y-0.5 text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Calculated New Stock
              </p>
              <div className="flex items-center justify-end gap-2">
                <span
                  className={`text-base font-black font-heading ${
                    resultingStock === 0
                      ? "text-rose-500"
                      : resultingStock < 10
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {resultingStock} units
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    delta > 0
                      ? "text-emerald-500 bg-emerald-500/10"
                      : delta < 0
                      ? "text-rose-500 bg-rose-500/10"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Reason / Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none focus:border-primary transition-all"
              >
                <option value="Supplier Restock">Supplier Restock (Inflow)</option>
                <option value="Physical Audit Count">Physical Audit Count</option>
                <option value="Customer Return">Customer Return</option>
                <option value="Damaged / Defective">Damaged / Defective</option>
                <option value="Inventory Loss / Waste">Inventory Loss / Waste</option>
                <option value="Manual Adjustment">Manual Adjustment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Note / Reference (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. PO #10492 or shelf count"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || amount === ""}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-primary/25 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Spinner className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Stock...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Stock Change</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

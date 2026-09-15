"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Tag,
  Wallet,
  Calendar,
  FileText,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { useCreateTransactionMutation } from "@/redux/features/accounting/accountingApi";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
  "Marketing & Advertising",
  "COGS / Inventory Purchase",
  "Shipping & Courier Payouts",
  "Office Rent & Utilities",
  "Salaries & Payroll",
  "Packaging & Supplies",
  "Software & Hosting",
  "Returns & Loss",
  "Other Expense",
];

const INCOME_CATEGORIES = [
  "E-Commerce Sales",
  "POS Walk-in Sales",
  "Delivery Fee Collected",
  "Supplier Refund",
  "Investment / Capital",
  "Other Income",
];

const ACCOUNT_WALLETS = [
  "Cash in Hand",
  "bKash Merchant",
  "Nagad Merchant",
  "Bank Account (BRAC)",
  "Bank Account (City)",
  "Payment Gateway (SSL)",
  "Courier Receivables (Steadfast)",
];

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number | "">("");
  const [account, setAccount] = useState(ACCOUNT_WALLETS[0]);
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [createTransaction, { isLoading: isSubmitting }] = useCreateTransactionMutation();

  const handleTypeChange = (newType: "expense" | "income") => {
    setType(newType);
    setCategory(newType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a transaction title!");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    const payload = {
      title,
      type,
      category,
      amount: Number(amount),
      account,
      reference,
      date: new Date(date),
      notes,
    };

    try {
      await createTransaction(payload).unwrap();
      toast.success(
        `${type === "expense" ? "Expense" : "Income"} entry created successfully!`
      );
      // Reset form
      setTitle("");
      setAmount("");
      setReference("");
      setNotes("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to create transaction entry");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                type === "expense"
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {type === "expense" ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-foreground uppercase tracking-wider">
                {type === "expense" ? "Add Expense (ব্যয় লিপিবদ্ধ)" : "Add Manual Income (আয় লিপিবদ্ধ)"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Record general expenses, payouts, or outside income into ledger.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === "expense"
                  ? "bg-rose-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingDown size={14} /> Expense (খরচ)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp size={14} /> Income (আয়)
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground">
              Title / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Facebook Ads Campaign, Office Electricity, Courier Payout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Amount (৳) *</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                {(type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">
                Payment Account / Wallet *
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                {ACCOUNT_WALLETS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference # / Receipt ID */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground">
              Reference / Invoice # / Trx ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. REC-8491, TRX-94821, FB-BILL-99"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground">Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="Add optional notes or supplier details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-3.5 h-3.5 text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Save Transaction Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

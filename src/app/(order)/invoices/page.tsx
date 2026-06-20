"use client";

import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetAllInvoicesQuery } from "@/redux/features/invoice/invoiceApi";
import Loader from "@/components/shared/Loader";
import {
  Receipt, Search, Eye, X, Package, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle,
} from "lucide-react";
import InvoiceSlideOver from "@/components/ui/commerce/invoices/InvoiceSlideOver";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PAYMENT_METHODS = ["all", "bkash", "nagad", "cod", "online_payment"];
const PAYMENT_STATUSES = ["all", "paid", "pending", "failed", "cancelled"];
const LIMITS = [10, 20, 50];

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 on filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, paymentStatus, paymentMethod, limit]);

  const queryParams = useMemo(() => ({
    page,
    limit,
    ...(paymentStatus !== "all" && { paymentStatus }),
    ...(paymentMethod !== "all" && { paymentMethod }),
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [page, limit, paymentStatus, paymentMethod, debouncedSearch]);

  const { data: invoicesRes, isLoading, isFetching } = useGetAllInvoicesQuery(queryParams);

  const invoices: any[] = invoicesRes?.data || [];
  const meta = invoicesRes?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const formatMethod = (m: string) => {
    const map: Record<string, string> = { bkash: "bKash", nagad: "Nagad", cod: "Cash on Delivery", online_payment: "Online Card" };
    return map[m] || m;
  };

  const methodDot = (m: string) => {
    const map: Record<string, string> = { bkash: "bg-pink-500", nagad: "bg-orange-500", cod: "bg-sky-500", online_payment: "bg-violet-500" };
    return map[m] || "bg-zinc-400";
  };

  const statusBadge = (s: string) => {
    const cfg: Record<string, { cls: string; icon: React.ReactNode }> = {
      paid:      { cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15", icon: <CheckCircle2 size={10} /> },
      pending:   { cls: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15",       icon: <Clock size={10} /> },
      failed:    { cls: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/15",           icon: <XCircle size={10} /> },
      cancelled: { cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/15",           icon: <AlertCircle size={10} /> },
    };
    const c = cfg[s] || cfg.pending;
    return (
      <Badge variant="outline" className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase border-none ${c.cls}`}>
        {c.icon} {s}
      </Badge>
    );
  };

  const totalStart = (meta.page - 1) * meta.limit + 1;
  const totalEnd = Math.min(meta.page * meta.limit, meta.total);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] w-full items-center justify-center"><Loader size={50} /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position:absolute; inset:0; padding:40px; background:white; color:black; }
          .no-print { display:none!important; }
        }
      ` }} />

      <div className="no-print space-y-6 animate-fade-in max-w-[1600px] mx-auto p-2 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              Commerce <span className="opacity-40">/</span> <span className="text-foreground">Invoices</span>
            </p>
            <h1 className="text-2xl font-black font-heading tracking-tight text-foreground flex items-center gap-2 mt-1">
              <Receipt className="text-primary" size={22} /> Billing & Invoices
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              All payment transactions, receipts, and billing records from the store.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground shrink-0">
            <Package size={14} className="text-primary" />
            <span><strong className="text-foreground">{meta.total}</strong> total invoices</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Invoices", value: meta.total, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "Paid", value: "-", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Pending", value: "-", color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Failed / Cancelled", value: "-", color: "text-rose-500", bg: "bg-rose-500/10" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <Receipt size={16} className={s.color} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black ${s.color}`}>{i === 0 ? meta.total : "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex flex-1 items-center h-10 max-w-sm rounded-lg px-3 gap-2 border border-border bg-card focus-within:border-primary/50 transition-all">
            <Search className="text-muted-foreground shrink-0" size={14} />
            <input
              type="text"
              placeholder="Search invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground text-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status:</span>
            <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border gap-0.5">
              {PAYMENT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setPaymentStatus(s)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md capitalize cursor-pointer transition-all ${
                    paymentStatus === s ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m === "all" ? "All Methods" : formatMethod(m)}</option>
            ))}
          </select>

          {/* Per-page selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            {LIMITS.map((l) => <option key={l} value={l}>{l} per page</option>)}
          </select>
        </div>

        {/* Table Card */}
        <div className={`glass-card border border-border rounded-2xl bg-card overflow-hidden transition-opacity ${isFetching ? "opacity-70" : "opacity-100"}`}>
          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs border-collapse">
              <TableHeader>
                <TableRow className="border-b border-border/80 bg-muted/40 hover:bg-transparent">
                  {["Invoice #", "Customer", "Date", "Method", "Amount", "Breakdown", "Status", ""].map((h) => (
                    <TableHead key={h} className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40 font-medium">
                {invoices.length > 0 ? invoices.map((inv: any) => (
                  <TableRow key={inv._id} className="hover:bg-muted/20 transition-colors group">
                    <TableCell className="p-4">
                      <span className="font-mono font-bold text-foreground text-[11px]">{inv.invoiceNumber}</span>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-col min-w-[120px]">
                        <span className="font-bold text-foreground truncate max-w-[160px]">{inv.user?.name || "—"}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{inv.user?.email || ""}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                      {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground whitespace-nowrap">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${methodDot(inv.paymentMethod)}`} />
                        {formatMethod(inv.paymentMethod)}
                      </span>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="font-black text-foreground text-sm">${inv.totalAmount?.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground whitespace-nowrap">
                        <span>Sub: <strong className="text-foreground">${inv.subtotal?.toFixed(2)}</strong></span>
                        {inv.discount > 0 && <span>Disc: <strong className="text-rose-500">-${inv.discount?.toFixed(2)}</strong></span>}
                        {inv.vat > 0 && <span>VAT: <strong className="text-foreground">${inv.vat?.toFixed(2)}</strong></span>}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">{statusBadge(inv.paymentStatus)}</TableCell>
                    <TableCell className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-20 text-center">
                      <Receipt className="mx-auto mb-3 text-muted/30" size={36} />
                      <p className="text-xs font-bold text-muted-foreground">No invoices found</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Try adjusting your search or filter</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 px-5 py-3 bg-muted/10">
              <p className="text-[11px] text-muted-foreground font-medium">
                Showing <strong className="text-foreground">{totalStart}–{totalEnd}</strong> of <strong className="text-foreground">{meta.total}</strong> invoices
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-card disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const p = meta.totalPages <= 5 ? i + 1 : Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        p === page
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-card disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Slide-Over */}
      <InvoiceSlideOver
        selectedInvoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        formatMethod={formatMethod}
        statusBadge={statusBadge}
      />
    </DashboardLayout>
  );
}

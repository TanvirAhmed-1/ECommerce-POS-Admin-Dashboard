"use client";

import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetAllInvoicesQuery } from "@/redux/features/invoice/invoiceApi";
import Loader from "@/components/shared/Loader";
import {
  Receipt, Search, Eye, X, Package, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle,
  Calendar, Filter, RotateCcw, RefreshCw,
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

type DatePreset = "all" | "today" | "yesterday" | "week" | "month" | "last_month" | "year" | "custom";

const formatDateToInput = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPresetDates = (preset: DatePreset) => {
  const now = new Date();
  switch (preset) {
    case "today": {
      const todayStr = formatDateToInput(now);
      return { start: todayStr, end: todayStr };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = formatDateToInput(y);
      return { start: yStr, end: yStr };
    }
    case "week": {
      const w = new Date(now);
      w.setDate(w.getDate() - 6);
      return { start: formatDateToInput(w), end: formatDateToInput(now) };
    }
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: formatDateToInput(first), end: formatDateToInput(now) };
    }
    case "last_month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: formatDateToInput(first), end: formatDateToInput(last) };
    }
    case "year": {
      const first = new Date(now.getFullYear(), 0, 1);
      return { start: formatDateToInput(first), end: formatDateToInput(now) };
    }
    default:
      return { start: "", end: "" };
  }
};

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

  // Date Filtering States
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handlePresetSelect = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset !== "custom") {
      const { start, end } = getPresetDates(preset);
      setStartDate(start);
      setEndDate(end);
    }
    setPage(1);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setDatePreset("custom");
    setStartDate(start);
    setEndDate(end);
    setPage(1);
  };

  const handleClearDateFilter = () => {
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 on filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, paymentStatus, paymentMethod, limit, startDate, endDate]);

  const queryParams = useMemo(() => ({
    page,
    limit,
    ...(paymentStatus !== "all" && { paymentStatus }),
    ...(paymentMethod !== "all" && { paymentMethod }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }), [page, limit, paymentStatus, paymentMethod, debouncedSearch, startDate, endDate]);

  const { data: invoicesRes, isLoading, isFetching } = useGetAllInvoicesQuery(queryParams);

  const invoices: any[] = invoicesRes?.data || [];
  const meta = invoicesRes?.meta || { total: 0, page: 1, limit: 20, totalPages: 1, stats: undefined };

  const stats = meta.stats || {
    totalInvoices: meta.total || invoices.length,
    paidCount: invoices.filter((i) => i.paymentStatus === "paid").length,
    pendingCount: invoices.filter((i) => i.paymentStatus === "pending").length,
    failedCount: invoices.filter((i) => i.paymentStatus === "failed" || i.paymentStatus === "cancelled").length,
  };

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
            { label: "Total Invoices", value: stats.totalInvoices, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "Paid", value: stats.paidCount, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Pending", value: stats.pendingCount, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Failed / Cancelled", value: stats.failedCount, color: "text-rose-500", bg: "bg-rose-500/10" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-xs">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <Receipt size={16} className={s.color} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Date Filter & Control Bar */}
        <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calendar size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Date Range Filter</span>
                {isFetching && (
                  <RefreshCw size={12} className="animate-spin text-primary" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(startDate || endDate || datePreset !== "all") && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 flex items-center gap-1">
                    <Filter size={11} />
                    <span>
                      {startDate && endDate
                        ? `${startDate} ~ ${endDate}`
                        : startDate
                        ? `From ${startDate}`
                        : `Until ${endDate}`}
                    </span>
                    <span className="opacity-75 font-normal">({meta.total} records)</span>
                  </span>
                  <button
                    onClick={handleClearDateFilter}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    title="Reset date filter"
                  >
                    <RotateCcw size={11} />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0 max-w-full">
              {[
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "week", label: "Last 7 Days" },
                { id: "month", label: "This Month" },
                { id: "last_month", label: "Last Month" },
                { id: "year", label: "This Year" },
                { id: "custom", label: "Custom Range" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id as DatePreset)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    datePreset === preset.id
                      ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Range Inputs */}
            {(datePreset === "custom" || startDate || endDate) && (
              <div className="flex items-center gap-2 shrink-0 animate-fade-in self-start md:self-auto">
                <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
                    className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-bold">~</span>
                <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
                    className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
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
                    <TableCell className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                          <span>
                            {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {(() => {
                            const dateVal = inv.invoiceDate || inv.createdAt;
                            if (!dateVal) return null;
                            const d = new Date(dateVal);
                            const today = new Date();
                            if (d.toDateString() === today.toDateString()) {
                              return (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/15 text-primary border border-primary/20">
                                  Today
                                </span>
                              );
                            }
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            if (d.toDateString() === yesterday.toDateString()) {
                              return (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Yesterday
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(inv.invoiceDate || inv.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
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

"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAccountingSummaryQuery,
  useGetAllTransactionsQuery,
} from "@/redux/features/accounting/accountingApi";
import Loader from "@/components/shared/Loader";
import {
  DollarSign,
  Plus,
  Printer,
  Calendar,
  Layers,
  Receipt,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import AccountingMetricCards from "@/components/ui/commerce/accounting/AccountingMetricCards";
import AccountWalletsRow from "@/components/ui/commerce/accounting/AccountWalletsRow";
import CashFlowCharts from "@/components/ui/commerce/accounting/CashFlowCharts";
import TransactionsLedgerTable from "@/components/ui/commerce/accounting/TransactionsLedgerTable";
import AddTransactionModal from "@/components/ui/commerce/accounting/AddTransactionModal";
import { Badge } from "@/components/ui/badge";

type DatePreset =
  | "all"
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export default function AccountingPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Date Range States
  const [datePreset, setDatePreset] = useState<DatePreset>("this_month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Initialize initial date preset (this_month)
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStr = now.toISOString().slice(0, 10);
    setStartDate(startOfMonth.toISOString().slice(0, 10));
    setEndDate(todayStr);
  }, []);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().slice(0, 10);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (preset === "this_week") {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(d.setDate(diff));
      setStartDate(startOfWeek.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(startOfMonth.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "last_month") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(startOfLastMonth.toISOString().slice(0, 10));
      setEndDate(endOfLastMonth.toISOString().slice(0, 10));
    } else if (preset === "this_year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(startOfYear.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate]);

  // Queries
  const {
    data: summaryRes,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetAccountingSummaryQuery(queryParams);

  const {
    data: transactionsRes,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetAllTransactionsQuery({
    page,
    limit,
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const summary = summaryRes?.data;
  const transactions = transactionsRes?.data || [];
  const meta = transactionsRes?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const handlePrintReport = () => {
    window.print();
  };

  const getPresetLabel = (p: DatePreset) => {
    const map: Record<DatePreset, string> = {
      all: "All Time (সকল সময়)",
      today: "Today (আজকের)",
      yesterday: "Yesterday (গতকালের)",
      this_week: "This Week (এই সপ্তাহের)",
      this_month: "This Month (এই মাসের)",
      last_month: "Last Month (গত মাসের)",
      this_year: "This Year (এই বছরের)",
      custom: "Custom Range (নির্দিষ্ট তারিখ)",
    };
    return map[p];
  };

  if (isSummaryLoading && !summary) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        {/* Printable CSS styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            #printable-accounting-area, #printable-accounting-area * { visibility: visible; }
            #printable-accounting-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}} />

        <div id="printable-accounting-area" className="space-y-6">
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Dashboard</span>
                <span className="opacity-50">/</span>
                <span className="text-foreground">Finance</span>
                <span className="opacity-50">/</span>
                <span className="text-primary font-black">Accounting</span>
              </div>
              <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
                <DollarSign className="text-primary" size={24} />
                E-Commerce Accounting & Finance
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Date-wise Profit & Loss calculation, Cash & Bank reconciliation, and Expense Ledger.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto no-print">
              <button
                onClick={handlePrintReport}
                className="h-10 px-3.5 bg-card hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer size={15} />
                <span>Print Statement</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="h-10 px-4 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>Add Expense / Income</span>
              </button>
            </div>
          </div>

          {/* Date Range Selector Toolbar */}
          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-sm space-y-3 no-print">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-1 shrink-0">
                  <Calendar size={14} className="text-primary" /> Period:
                </span>
                {(
                  [
                    "this_month",
                    "today",
                    "yesterday",
                    "this_week",
                    "last_month",
                    "this_year",
                    "all",
                    "custom",
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetChange(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      datePreset === preset
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {preset === "this_month"
                      ? "This Month"
                      : preset === "today"
                      ? "Today"
                      : preset === "yesterday"
                      ? "Yesterday"
                      : preset === "this_week"
                      ? "This Week"
                      : preset === "last_month"
                      ? "Last Month"
                      : preset === "this_year"
                      ? "This Year"
                      : preset === "all"
                      ? "All Time"
                      : "Custom Range"}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers & Active Range Tag */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDatePreset("custom");
                    }}
                    className="px-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-muted-foreground font-bold">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDatePreset("custom");
                    }}
                    className="px-2.5 py-1.5 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold py-1 px-2.5"
                >
                  {datePreset === "all"
                    ? "Lifetime Financial Summary"
                    : `${startDate || "Start"} → ${endDate || "End"}`}
                </Badge>
              </div>
            </div>
          </div>

          {/* 1. Key Metrics Cards */}
          <AccountingMetricCards overview={summary?.overview} />

          {/* 2. Account Wallets & Cash Flow Row */}
          <AccountWalletsRow wallets={summary?.wallets} />

          {/* 3. Cash Flow Analytics & Expense Breakdown */}
          <CashFlowCharts
            monthlyFlow={summary?.monthlyFlow}
            expenseCategories={summary?.expenseCategories}
          />

          {/* 4. Transaction Ledger Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-primary" />
                <h3 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">
                  Financial Journal & Ledger Entries
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">
                Showing {transactions.length} of {meta.total} records
              </span>
            </div>

            <TransactionsLedgerTable
              transactions={transactions}
              isLoading={isTransactionsLoading}
              totalCount={meta.total}
              page={page}
              setPage={setPage}
              limit={limit}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              refetch={() => {
                refetchTransactions();
                refetchSummary();
              }}
            />
          </div>
        </div>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            refetchSummary();
            refetchTransactions();
          }}
        />
      </div>
    </DashboardLayout>
  );
}

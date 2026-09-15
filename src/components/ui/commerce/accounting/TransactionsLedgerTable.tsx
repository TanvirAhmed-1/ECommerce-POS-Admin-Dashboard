"use client";

import React, { useState } from "react";
import {
  Search,
  Sliders,
  TrendingDown,
  TrendingUp,
  Trash2,
  Calendar,
  Wallet,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteTransactionMutation } from "@/redux/features/accounting/accountingApi";
import { toast } from "react-hot-toast";

interface TransactionsLedgerTableProps {
  transactions: any[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  setPage: (p: number) => void;
  limit: number;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  refetch: () => void;
}

export default function TransactionsLedgerTable({
  transactions,
  isLoading,
  totalCount,
  page,
  setPage,
  limit,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  searchTerm,
  setSearchTerm,
  refetch,
}: TransactionsLedgerTableProps) {
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accounting ledger record?")) return;
    try {
      await deleteTransaction(id).unwrap();
      toast.success("Transaction deleted successfully");
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to delete transaction");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by title, reference, account..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">All Types (আয় ও ব্যয়)</option>
            <option value="expense">Expenses Only (খরচ)</option>
            <option value="income">Income Only (আয়)</option>
          </select>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl text-[10px]">
            {["all", "expense", "income"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  typeFilter === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Date & Reference
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Description / Title
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Account / Wallet
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                Amount
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex justify-center">
                    <Spinner className="w-6 h-6 text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  No accounting transaction records found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const isExpense = tx.type === "expense";

                return (
                  <TableRow key={tx._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">
                          {new Date(tx.date || tx.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        {tx.reference && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {tx.reference}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isExpense
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {isExpense ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{tx.title}</p>
                          {tx.notes && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold bg-muted/40 border-border"
                      >
                        {tx.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {tx.account}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <span
                        className={`font-mono font-black text-xs ${
                          isExpense ? "text-rose-500" : "text-emerald-500"
                        }`}
                      >
                        {isExpense ? "-" : "+"}৳{tx.amount.toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <span>
            Total <strong>{totalCount}</strong> transactions
          </span>
          <div className="flex items-center gap-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

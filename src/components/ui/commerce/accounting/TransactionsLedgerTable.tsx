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
  Store,
  Globe,
  UserCheck,
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
  const [channelFilter, setChannelFilter] = useState<"all" | "web" | "pos" | "expense">("all");

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

  // Helper to determine channel for transaction
  const getTransactionChannel = (tx: any): "pos" | "web" | "expense" => {
    if (tx.type === "expense") return "expense";
    if (
      tx.source === "pos" ||
      tx.channel === "pos" ||
      tx.reference?.toLowerCase().includes("pos") ||
      tx.category?.toLowerCase().includes("pos") ||
      tx.title?.toLowerCase().includes("pos")
    ) {
      return "pos";
    }
    return "web";
  };

  // Client-side channel filtering if user selects channel tab
  const filteredTransactions = transactions.filter((tx) => {
    if (channelFilter === "all") return true;
    if (channelFilter === "expense") return tx.type === "expense";
    const channel = getTransactionChannel(tx);
    return channel === channelFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search, Channel Tabs & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        {/* Left: Search & Channel Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by title, reference, account, cashier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          {/* Quick Channel Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl text-[11px] overflow-x-auto">
            <button
              onClick={() => setChannelFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                channelFilter === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setChannelFilter("pos")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                channelFilter === "pos"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-emerald-500"
              }`}
            >
              <Store size={12} />
              <span>POS Sales</span>
            </button>
            <button
              onClick={() => setChannelFilter("web")}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                channelFilter === "web"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-blue-500"
              }`}
            >
              <Globe size={12} />
              <span>Web E-Commerce</span>
            </button>
            <button
              onClick={() => setChannelFilter("expense")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                channelFilter === "expense"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-rose-500"
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        {/* Right: Type Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
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
                Channel / Origin
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
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex justify-center">
                    <Spinner className="w-6 h-6 text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  No accounting transaction records match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === "expense";
                const channel = getTransactionChannel(tx);
                const cashierName = tx.cashierName || tx.createdBy?.name || tx.staffName;

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
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            {tx.reference}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Channel / Origin Badge */}
                    <TableCell className="py-3">
                      {isExpense ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold bg-rose-500/10 text-rose-500 border-rose-500/20 py-0.5 px-2"
                        >
                          💸 Expense
                        </Badge>
                      ) : channel === "pos" ? (
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 py-0.5 px-2 flex items-center gap-1 w-fit"
                          >
                            <Store size={10} />
                            <span>POS In-Store</span>
                          </Badge>
                          {cashierName && (
                            <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                              <UserCheck size={9} className="text-emerald-500" />
                              {cashierName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 py-0.5 px-2 flex items-center gap-1 w-fit"
                        >
                          <Globe size={10} />
                          <span>Web Store</span>
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isExpense
                              ? "bg-rose-500/10 text-rose-500"
                              : channel === "pos"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {isExpense ? (
                            <TrendingDown size={14} />
                          ) : (
                            <TrendingUp size={14} />
                          )}
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
            Showing <strong>{filteredTransactions.length}</strong> of <strong>{totalCount}</strong> transactions
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

"use client";

import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllPaymentsQuery,
  useGetSinglePaymentQuery,
  useUpdatePaymentStatusMutation,
  useDeletePaymentMutation,
} from "@/redux/features/payment/paymentApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Search,
  Sliders,
  Eye,
  Trash2,
  ChevronDown,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  XCircle,
  TrendingUp,
  Receipt,
  Shield,
  FileCode,
} from "lucide-react";

// Mock payments fallback in case database is empty
const mockPayments = [
  {
    _id: "mock-p1",
    transactionId: "TXN-BK94A2B1",
    gatewayTrxId: "8K28D918S",
    order: {
      _id: "mock-o1",
      id: "ORD-94A2B1",
      orderStatus: "processing",
      totalAmount: 210,
      payment: { method: "bkash", status: "paid" },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    user: {
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
      phone: "+8801712345678",
    },
    amount: 210,
    currency: "BDT",
    paymentGateway: "BKASH",
    status: "SUCCESS",
    paymentData: {
      paymentID: "payment_bkash_94A2B1",
      payerReference: "customer_1",
      agreementID: "agreement_bkash_772",
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "mock-p2",
    transactionId: "TXN-NG83C1F4",
    gatewayTrxId: "NGD-8429103B",
    order: {
      _id: "mock-o3",
      id: "ORD-71A9D3",
      orderStatus: "delivered",
      totalAmount: 150,
      payment: { method: "nagad", status: "paid" },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    user: {
      name: "Aisha Siddika",
      email: "aisha@example.com",
      phone: "+8801999888777",
    },
    amount: 150,
    currency: "BDT",
    paymentGateway: "NAGAD",
    status: "SUCCESS",
    paymentData: {
      paymentID: "payment_nagad_83C1F4",
      payerReference: "customer_3",
      paymentTrx: "trx_nagad_7312",
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "mock-p3",
    transactionId: "TXN-BK83D1F9",
    order: {
      _id: "mock-o2",
      id: "ORD-83C1F4",
      orderStatus: "pending",
      totalAmount: 89,
      payment: { method: "bkash", status: "pending" },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    user: {
      name: "Sajid Khan",
      email: "sajid@example.com",
      phone: "+8801811223344",
    },
    amount: 89,
    currency: "BDT",
    paymentGateway: "BKASH",
    status: "PENDING",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "mock-p4",
    transactionId: "TXN-SSL62F8E2",
    gatewayTrxId: "SSL-9938218X",
    order: {
      _id: "mock-o4",
      id: "ORD-62F8E2",
      orderStatus: "cancelled",
      totalAmount: 60,
      payment: { method: "online_payment", status: "cancelled" },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    user: {
      name: "Rahul Barua",
      email: "rahul@example.com",
      phone: "+8801555666777",
    },
    amount: 60,
    currency: "BDT",
    paymentGateway: "SSL",
    status: "FAILED",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Success" | "Failed" | "Cancelled">("All");
  const [selectedGateway, setSelectedGateway] = useState<"All" | "BKASH" | "NAGAD" | "SSL">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; trxId: string } | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedGateway, debouncedSearchQuery]);

  // Backend paginated query
  const { data: paymentsRes, isLoading, refetch } = useGetAllPaymentsQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: debouncedSearchQuery,
    status: activeTab === "All" ? "" : activeTab.toUpperCase(),
    gateway: selectedGateway === "All" ? "" : selectedGateway,
  });

  const [updatePaymentStatus, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation();
  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();

  // Determine if using mock payments
  const isMock = useMemo(() => {
    return !paymentsRes?.data;
  }, [paymentsRes]);

  // Parse payments list
  const payments = useMemo(() => {
    const apiPayments = paymentsRes?.data?.data || paymentsRes?.data || [];
    if (Array.isArray(apiPayments) && apiPayments.length > 0) {
      return apiPayments;
    }
    return [];
  }, [paymentsRes]);

  // Filtered and paginated payments to display
  const displayedPayments = useMemo(() => {
    if (!isMock) {
      return payments;
    }

    // Client-side filtering for mock payments fallback
    const filtered = mockPayments.filter((pay: any) => {
      const matchesTab =
        activeTab === "All" ||
        pay.status?.toUpperCase() === activeTab.toUpperCase();

      const matchesGateway =
        selectedGateway === "All" ||
        pay.paymentGateway?.toUpperCase() === selectedGateway.toUpperCase();

      const userName = pay.user?.name || "";
      const userEmail = pay.user?.email || "";
      const userPhone = pay.user?.phone || "";
      const transactionId = pay.transactionId || "";
      const gatewayTrxId = pay.gatewayTrxId || "";

      const matchesSearch =
        transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gatewayTrxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userPhone.includes(searchQuery);

      return matchesTab && matchesGateway && matchesSearch;
    });

    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [payments, isMock, activeTab, selectedGateway, searchQuery, currentPage, itemsPerPage]);

  // Statistics aggregated
  const stats = useMemo(() => {
    if (!isMock && paymentsRes?.data?.meta?.stats) {
      const s = paymentsRes.data.meta.stats;
      return {
        total: s.totalPayments || 0,
        success: s.successfulPayments || 0,
        pending: s.pendingPayments || 0,
        revenue: s.totalAmountCollected || 0,
      };
    }

    // Fallback stats calculations from mockPayments
    const total = mockPayments.length;
    const success = mockPayments.filter((p) => p.status === "SUCCESS").length;
    const pending = mockPayments.filter((p) => p.status === "PENDING").length;
    const revenue = mockPayments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, success, pending, revenue };
  }, [paymentsRes, isMock]);

  // Pagination meta data
  const totalPages = useMemo(() => {
    if (!isMock && paymentsRes?.data?.meta?.totalPage !== undefined) {
      return paymentsRes.data.meta.totalPage;
    }

    // Fallback pagination calculations
    const filteredCount = mockPayments.filter((pay: any) => {
      const matchesTab = activeTab === "All" || pay.status?.toUpperCase() === activeTab.toUpperCase();
      const matchesGateway = selectedGateway === "All" || pay.paymentGateway?.toUpperCase() === selectedGateway.toUpperCase();
      const userName = pay.user?.name || "";
      const matchesSearch = pay.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesGateway && matchesSearch;
    }).length;

    return Math.max(1, Math.ceil(filteredCount / itemsPerPage));
  }, [paymentsRes, isMock, activeTab, selectedGateway, searchQuery, itemsPerPage]);

  const totalEntries = useMemo(() => {
    if (!isMock && paymentsRes?.data?.meta?.total !== undefined) {
      return paymentsRes.data.meta.total;
    }

    // Fallback entries calculations
    return mockPayments.filter((pay: any) => {
      const matchesTab = activeTab === "All" || pay.status?.toUpperCase() === activeTab.toUpperCase();
      const matchesGateway = selectedGateway === "All" || pay.paymentGateway?.toUpperCase() === selectedGateway.toUpperCase();
      const userName = pay.user?.name || "";
      const matchesSearch = pay.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesGateway && matchesSearch;
    }).length;
  }, [paymentsRes, isMock, activeTab, selectedGateway, searchQuery]);

  // Page Numbers Array
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisible + 1;
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  // Status badge mapper
  const getStatusBadge = (status: string) => {
    const normalized = status?.toUpperCase();
    switch (normalized) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20">
            <Clock size={12} className="animate-pulse" />
            Pending
          </span>
        );
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={12} />
            Success
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20">
            <XCircle size={12} />
            Failed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-muted-foreground border border-border">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  // Payment Gateway Badge
  const getGatewayBadge = (gateway: string) => {
    const normalized = gateway?.toUpperCase();
    switch (normalized) {
      case "BKASH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-pink-500/10 text-pink-600 border border-pink-500/10">
            bKash
          </span>
        );
      case "NAGAD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-500/10 text-orange-600 border border-orange-500/10">
            Nagad
          </span>
        );
      case "SSL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 border border-indigo-500/10">
            SSLCommerz
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-muted-foreground border border-border uppercase">
            {gateway}
          </span>
        );
    }
  };

  // Update Status handler
  const handleStatusChange = async (status: string) => {
    if (!selectedPayment) return;
    const isMockData = selectedPayment._id.startsWith("mock");

    const toastId = toast.loading("Updating payment status...");
    try {
      if (isMockData) {
        const updated = { ...selectedPayment, status };
        setSelectedPayment(updated);
        toast.success(`Mock status updated to ${status}`, { id: toastId });
        return;
      }

      await updatePaymentStatus({ id: selectedPayment._id, status }).unwrap();
      setSelectedPayment((prev: any) => (prev ? { ...prev, status } : null));
      toast.success(`Payment status updated to ${status}!`, { id: toastId });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update payment status.", { id: toastId });
    }
  };

  // Delete Click handler
  const handleDeleteClick = (id: string, trxId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, trxId });
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, trxId } = deleteTarget;
    const isMockData = id.startsWith("mock");

    const toastId = toast.loading(`Deleting payment record "${trxId}"...`);
    try {
      if (isMockData) {
        toast.error("Cannot delete mock data.", { id: toastId });
        setDeleteTarget(null);
        return;
      }

      await deletePayment(id).unwrap();
      toast.success(`Payment transaction ${trxId} deleted successfully!`, { id: toastId });
      setDeleteTarget(null);
      if (selectedPayment?._id === id) {
        setSelectedPayment(null);
      }
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to delete payment.", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[75vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        
        {/* Breadcrumb & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Payments</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="text-primary" size={24} />
            Payments Ledger
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            Audit online checkout transactions, track gateway references, verify payouts, edit transaction logs, and manage payment disputes.
          </p>
        </div>

        {/* Stats Blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Transactions</p>
              <h3 className="text-lg font-black text-foreground">{stats.total}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Successful</p>
              <h3 className="text-lg font-black text-foreground">{stats.success}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pending</p>
              <h3 className="text-lg font-black text-foreground">{stats.pending}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Volume</p>
              <h3 className="text-lg font-black text-foreground">BDT {stats.revenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection, Gateway Filter & Search bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border overflow-x-auto max-w-full">
              {(["All", "Pending", "Success", "Failed", "Cancelled"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all shrink-0 ${
                    activeTab === tab
                      ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Gateway Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs bg-muted/40 border border-border px-3 py-1.5 rounded-lg">
              <span className="text-muted-foreground font-semibold">Gateway:</span>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value as any)}
                className="bg-transparent border-none text-foreground font-bold outline-none cursor-pointer"
              >
                <option value="All">All Gateways</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="SSL">SSLCommerz</option>
              </select>
            </div>
          </div>

          <div className="flex items-center h-10 w-full xl:max-w-md rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
            <Search className="text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search Transaction ID, customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border bg-card">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-12 text-center">SL</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-36">Transaction ID</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-32">Gateway Trx ID</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Customer</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-24 text-center">Order Reference</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Gateway</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Date</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider text-right">Amount</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Status</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayedPayments.length > 0 ? (
                  displayedPayments.map((pay: any, idx: number) => {
                    const fullName = pay.user?.name || "Guest Customer";
                    const email = pay.user?.email || "N/A";
                    const phone = pay.user?.phone || "N/A";

                    const formattedDate = pay.createdAt
                      ? new Date(pay.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";

                    const slIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    const orderIdVisual = pay.order?.id || (pay.order?._id ? `ORD-${pay.order._id.slice(-6).toUpperCase()}` : "N/A");

                    return (
                      <tr
                        key={pay._id}
                        onClick={() => setSelectedPayment(pay)}
                        className={`hover:bg-muted/30 transition-colors group cursor-pointer ${
                          selectedPayment?._id === pay._id ? "bg-primary/5 dark:bg-primary/10" : ""
                        }`}
                      >
                        {/* SL */}
                        <td className="p-4 text-center font-bold text-muted-foreground w-12">{slIndex}</td>

                        {/* Transaction ID */}
                        <td className="p-4 font-mono font-bold text-foreground">{pay.transactionId}</td>

                        {/* Gateway Transaction ID */}
                        <td className="p-4 font-mono font-medium text-muted-foreground">{pay.gatewayTrxId || "N/A"}</td>

                        {/* Customer Info */}
                        <td className="p-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">{fullName}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{email}</span>
                            <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">{phone}</span>
                          </div>
                        </td>

                        {/* Order Reference */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary font-mono">
                            {orderIdVisual}
                          </span>
                        </td>

                        {/* Gateway */}
                        <td className="p-4">{getGatewayBadge(pay.paymentGateway)}</td>

                        {/* Date Created */}
                        <td className="p-4 text-muted-foreground font-medium">{formattedDate}</td>

                        {/* Amount */}
                        <td className="p-4 text-right font-black text-foreground">
                          {pay.currency} {Number(pay.amount || 0).toFixed(2)}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">{getStatusBadge(pay.status || "PENDING")}</td>

                        {/* Actions */}
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedPayment(pay)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
                              title="View Transaction details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(pay._id, pay.transactionId, e)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
                              title="Delete Transaction Log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-muted-foreground space-y-2">
                      <CreditCard className="mx-auto text-muted/30" size={36} />
                      <p className="text-xs font-bold">No payments found</p>
                      <p className="text-[10px]">No transaction matching the active filters was found in ledger logs.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalEntries > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/10 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground font-medium">
                <div>
                  Showing{" "}
                  <span className="text-foreground font-bold">
                    {totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-foreground font-bold">
                    {Math.min(currentPage * itemsPerPage, totalEntries)}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground font-bold">{totalEntries}</span>{" "}
                  entries
                </div>

                <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 px-2 py-0.5 rounded-lg border border-border bg-card text-foreground font-bold text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-700 cursor-pointer"
                  >
                    {[10, 20, 50, 100].map((val) => (
                      <option key={val} value={val}>
                        {val} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>

                  {/* Page Number Buttons */}
                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-primary text-white shadow-sm shadow-primary/20"
                          : "border border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slide-over Drawer: Payment Details */}
        {selectedPayment && (
          <div className="fixed inset-0 z-40 overflow-hidden flex justify-end animate-fade-in">
            {/* Drawer Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setSelectedPayment(null)}
            />

            {/* Slide-over Card panel */}
            <div className="relative w-full max-w-lg bg-background border-l border-border h-full flex flex-col shadow-2xl z-10 animate-slide-in">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">{selectedPayment.transactionId}</span>
                    {getStatusBadge(selectedPayment.status || "PENDING")}
                  </div>
                  <h3 className="font-heading text-lg font-black text-foreground">Transaction Details</h3>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
                
                {/* Status Update Block */}
                <div className="p-4 rounded-xl border border-primary/15 bg-primary/5 dark:bg-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders size={12} />
                      Transaction Status
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedPayment.status?.toUpperCase() || "PENDING"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdating}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-normal">
                    Manages gateway validation overrides. Ensure you match updates with the gateway provider ledger.
                  </p>
                </div>

                {/* Customer Contact Card */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
                    <User size={14} className="text-primary" />
                    Customer Details
                  </h4>
                  <div className="glass-card rounded-xl border border-border p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
                        {(selectedPayment.user?.name || "GC").substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-foreground text-sm">
                          {selectedPayment.user?.name || "Guest Customer"}
                        </h5>
                        <p className="text-[10px] text-muted-foreground">Payer Account</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate">{selectedPayment.user?.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{selectedPayment.user?.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary & Associated details */}
                {selectedPayment.order && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
                      <Receipt size={14} className="text-primary" />
                      Associated Order Details
                    </h4>
                    <div className="glass-card rounded-xl border border-border p-4 bg-muted/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-bold">Order ID:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedPayment.order.id || `ORD-${selectedPayment.order._id?.slice(-6).toUpperCase()}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-bold">Order Status:</span>
                        <span className="font-bold text-foreground uppercase text-[10px]">
                          {selectedPayment.order.orderStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-bold">Order Amount:</span>
                        <span className="font-black text-foreground">
                          BDT {Number(selectedPayment.order.totalAmount || selectedPayment.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gateways specifics & Data */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
                    <Shield size={14} className="text-primary" />
                    Gateway & Audit Trail
                  </h4>
                  <div className="glass-card rounded-xl border border-border p-4 bg-muted/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider block">Payment Gateway</span>
                        <span className="font-black text-foreground text-xs uppercase block">
                          {selectedPayment.paymentGateway}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider block">Gateway Trx ID</span>
                        <span className="font-mono font-bold text-foreground block">
                          {selectedPayment.gatewayTrxId || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/40 font-medium text-muted-foreground">
                      <div className="flex justify-between items-center text-foreground font-black text-sm pt-1.5">
                        <span>Total Transaction Amount</span>
                        <span>{selectedPayment.currency} {Number(selectedPayment.amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible raw json paymentData info */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="w-full flex items-center justify-between p-2 rounded bg-muted/40 border border-border font-bold text-[10px] text-foreground hover:bg-muted/80 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileCode size={12} className="text-muted-foreground" />
                      View Raw Gateway JSON Metadata
                    </span>
                    <ChevronDown size={14} className={`transform transition-transform ${showRawJson ? "rotate-180" : ""}`} />
                  </button>
                  {showRawJson && (
                    <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[9px] rounded-lg border border-zinc-800 overflow-x-auto custom-scrollbar max-h-48 whitespace-pre-wrap">
                      {JSON.stringify(selectedPayment.paymentData || { info: "No gateway payload stored for this transaction record" }, null, 2)}
                    </pre>
                  )}
                </div>

              </div>

              {/* Drawer Footer controls */}
              <div className="p-4 border-t border-border flex items-center gap-3 bg-muted/20">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 h-10 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Close Drawer
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(selectedPayment._id, selectedPayment.transactionId, e)}
                  className="px-4 h-10 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  title="Permanently Delete payment logs"
                >
                  <Trash2 size={14} />
                  <span>Delete Record</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="glass-card w-full max-w-[400px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-destructive" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                  <Trash2 size={22} />
                </div>

                <div className="text-center space-y-1.5">
                  <h4 className="font-heading text-base font-bold text-foreground">Delete Transaction Log?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to permanently delete transaction record <span className="text-foreground font-bold">"{deleteTarget.trxId}"</span>? This will wipe the payment audit logs and cannot be undone.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                    className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-destructive/15 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Spinner className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from "@/redux/features/order/orderApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Search,
  Sliders,
  Eye,
  Trash2,
  ChevronDown,
  ShoppingBag,
  Clock,
  CheckCircle,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  XCircle,
  Truck,
  Package,
  Receipt,
  Calendar,
  Filter,
  RotateCcw,
  RefreshCw,
  Store,
  Globe,
  Tag,
  Pencil,
  PhoneCall,
} from "lucide-react";
import { TbCurrencyTaka } from "react-icons/tb";
import OrderDetailsModal from "@/components/ui/commerce/orders/OrderDetailsModal";
import CreateOrderModal from "@/components/ui/commerce/orders/CreateOrderModal";
import EditOrderModal from "@/components/ui/commerce/orders/EditOrderModal";
import InvoiceSlideOver from "@/components/ui/commerce/invoices/InvoiceSlideOver";

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


// Mock orders fallback in case database is empty
const mockOrders = [
  {
    _id: "mock-o1",
    id: "ORD-94A2B1",
    user: {
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
      phone: "+8801712345678",
      role: "reseller",
    },
    shippingAddress: {
      fullName: "Tanvir Ahmed",
      phone: "+8801712345678",
      address: "House 45, Road 12, Banani",
      city: "Dhaka",
    },
    items: [
      {
        product: {
          name: "Premium Leather Wallet",
          slug: "leather-wallet",
          thumbnail: "https://images.unsplash.com/photo-1627124712836-31c19b0b467e?q=80&w=200"
        },
        variant: { color: "Brown", size: "Standard" },
        quantity: 2,
        price: 45,
      },
      {
        product: {
          name: "Minimalist Watch",
          slug: "minimalist-watch",
          thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200"
        },
        variant: { color: "Black", size: "42mm" },
        quantity: 1,
        price: 120,
      },
    ],
    totalAmount: 210,
    payment: {
      method: "bkash",
      status: "paid",
      transactionId: "TRX-BK948291",
      date: new Date().toISOString(),
    },
    deliveryType: "home_delivery",
    orderStatus: "processing",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "mock-o2",
    id: "ORD-83C1F4",
    user: {
      name: "Sajid Khan",
      email: "sajid@example.com",
      phone: "+8801811223344",
      role: "customer",
    },
    shippingAddress: {
      fullName: "Sajid Khan",
      phone: "+8801811223344",
      address: "Flat 4A, Green Road",
      city: "Dhaka",
    },
    items: [
      {
        product: {
          name: "Wireless Earbuds Pro",
          slug: "wireless-earbuds-pro",
          thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=200"
        },
        variant: { color: "White" },
        quantity: 1,
        price: 89,
      },
    ],
    totalAmount: 89,
    payment: {
      method: "cod",
      status: "pending",
      date: new Date().toISOString(),
    },
    deliveryType: "home_delivery",
    orderStatus: "pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "mock-o3",
    id: "ORD-71A9D3",
    user: {
      name: "Aisha Siddika",
      email: "aisha@example.com",
      phone: "+8801999888777",
      role: "customer",
    },
    shippingAddress: {
      fullName: "Aisha Siddika",
      phone: "+8801999888777",
      address: "Sector 4, Uttara",
      city: "Dhaka",
    },
    items: [
      {
        product: {
          name: "Mechanical Keyboard",
          slug: "mechanical-keyboard",
          thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=200"
        },
        variant: { color: "RGB Blue Switches" },
        quantity: 1,
        price: 150,
      },
    ],
    totalAmount: 150,
    payment: {
      method: "nagad",
      status: "paid",
      transactionId: "TRX-NG773918",
      date: new Date().toISOString(),
    },
    deliveryType: "pickup",
    orderStatus: "delivered",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "mock-o4",
    id: "ORD-62F8E2",
    user: {
      name: "Rahul Barua",
      email: "rahul@example.com",
      phone: "+8801555666777",
      role: "customer",
    },
    shippingAddress: {
      fullName: "Rahul Barua",
      phone: "+8801555666777",
      address: "Chittagong Port Area",
      city: "Chittagong",
    },
    items: [
      {
        product: {
          name: "Gaming Mouse Pad",
          slug: "gaming-mouse-pad",
          thumbnail: "https://images.unsplash.com/photo-1616499389997-4818867a6590?q=80&w=200"
        },
        variant: { color: "Red Dragon" },
        quantity: 3,
        price: 20,
      },
    ],
    totalAmount: 60,
    payment: {
      method: "cod",
      status: "cancelled",
      date: new Date().toISOString(),
    },
    deliveryType: "home_delivery",
    orderStatus: "cancelled",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled">("All");
  const [channelFilter, setChannelFilter] = useState<"all" | "web" | "pos">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [confirmModalOrder, setConfirmModalOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; orderNumber: string } | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [activeInvoiceForPreview, setActiveInvoiceForPreview] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default to 20 items per page

  // Date Filter States
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
    setCurrentPage(1);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setDatePreset("custom");
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const handleClearDateFilter = () => {
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Debounce search query to prevent backend request spamming
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when tab, channel, debounced search query, or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, channelFilter, debouncedSearchQuery, startDate, endDate]);

  // Backend paginated query with date filtering
  const { data: ordersRes, isLoading, isFetching, refetch } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: debouncedSearchQuery,
    status: activeTab === "All" ? "" : activeTab.toLowerCase(),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  // Determine if using mock orders (e.g. backend data not populated)
  const isMock = useMemo(() => {
    return !ordersRes?.data;
  }, [ordersRes]);

  // Parse Orders list from backend or mock
  const orders = useMemo(() => {
    const apiOrders = ordersRes?.data?.data || ordersRes?.data || [];

    if (Array.isArray(apiOrders) && apiOrders.length > 0) {
      return apiOrders.map((ord: any, idx: number) => {
        const id = ord._id ? `ORD-${ord._id.slice(-6).toUpperCase()}` : `ORD-${8000 + idx}`;
        return {
          ...ord,
          id, // Visual order number
        };
      });
    }
    return [];
  }, [ordersRes]);

  // Final filtered & paginated orders to display
  const displayedOrders = useMemo(() => {
    const baseList = isMock
      ? mockOrders.map((ord: any, idx: number) => ({
          ...ord,
          id: ord.id || `ORD-${ord._id.slice(-6).toUpperCase()}`
        }))
      : orders;

    const filtered = baseList.filter((ord: any) => {
      // Channel Filter (POS vs Web)
      const isPos = ord.source === "pos" || ord.channel === "pos";
      if (channelFilter === "pos" && !isPos) return false;
      if (channelFilter === "web" && isPos) return false;

      // Status Tab Filter
      const matchesTab =
        activeTab === "All" ||
        ord.orderStatus?.toLowerCase() === activeTab.toLowerCase();

      // Search Query
      const userName = ord.shippingAddress?.fullName || ord.customerInfo?.fullName || ord.user?.name || "";
      const userEmail = ord.user?.email || ord.customerInfo?.email || "";
      const userPhone = ord.shippingAddress?.phone || ord.customerInfo?.phone || ord.user?.phone || "";
      const visualId = ord.id || "";
      const cashier = ord.createdBy?.name || ord.cashierName || "";

      const matchesSearch =
        visualId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userPhone.includes(searchQuery);

      // Date Range
      let matchesDate = true;
      if (startDate || endDate) {
        const ordTime = new Date(ord.createdAt).getTime();
        if (startDate) {
          const sTime = new Date(`${startDate}T00:00:00`).getTime();
          if (ordTime < sTime) matchesDate = false;
        }
        if (endDate) {
          const eTime = new Date(`${endDate}T23:59:59.999`).getTime();
          if (ordTime > eTime) matchesDate = false;
        }
      }

      return matchesTab && matchesSearch && matchesDate;
    });

    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [orders, isMock, activeTab, channelFilter, searchQuery, startDate, endDate, currentPage, itemsPerPage]);

  // Global Statistics with Channel Breakdown
  const stats = useMemo(() => {
    const baseList = isMock ? mockOrders : orders;

    const filteredForStats = baseList.filter((ord: any) => {
      if (startDate || endDate) {
        const ordTime = new Date(ord.createdAt).getTime();
        if (startDate && ordTime < new Date(`${startDate}T00:00:00`).getTime()) return false;
        if (endDate && ordTime > new Date(`${endDate}T23:59:59.999`).getTime()) return false;
      }
      return true;
    });

    const total = filteredForStats.length;
    const pending = filteredForStats.filter((o: any) => o.orderStatus === "pending").length;
    const processing = filteredForStats.filter((o: any) => o.orderStatus === "processing").length;
    const completed = filteredForStats.filter((o: any) => o.orderStatus === "delivered").length;
    const revenue = filteredForStats
      .filter((o: any) => o.orderStatus === "delivered" || o.payment?.status === "paid" || o.paymentStatus === "paid")
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    const posOrders = filteredForStats.filter((o: any) => o.source === "pos" || o.channel === "pos");
    const webOrders = filteredForStats.filter((o: any) => o.source !== "pos" && o.channel !== "pos");
    const posRevenue = posOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const webRevenue = webOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return {
      total,
      pending,
      processing,
      completed,
      revenue,
      posCount: posOrders.length,
      webCount: webOrders.length,
      posRevenue,
      webRevenue,
    };
  }, [orders, isMock, startDate, endDate]);

  // Pagination totals
  const totalPages = useMemo(() => {
    if (!isMock && ordersRes?.data?.meta?.totalPage !== undefined) {
      return ordersRes.data.meta.totalPage;
    }

    // For mock data
    const filteredCount = mockOrders.filter((ord: any) => {
      const matchesTab = activeTab === "All" || ord.orderStatus?.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.shippingAddress?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
      let matchesDate = true;
      if (startDate || endDate) {
        const ordTime = new Date(ord.createdAt).getTime();
        if (startDate && ordTime < new Date(`${startDate}T00:00:00`).getTime()) matchesDate = false;
        if (endDate && ordTime > new Date(`${endDate}T23:59:59.999`).getTime()) matchesDate = false;
      }
      return matchesTab && matchesSearch && matchesDate;
    }).length;

    return Math.max(1, Math.ceil(filteredCount / itemsPerPage));
  }, [ordersRes, isMock, activeTab, searchQuery, startDate, endDate, itemsPerPage]);

  const totalEntries = useMemo(() => {
    if (!isMock && ordersRes?.data?.meta?.total !== undefined) {
      return ordersRes.data.meta.total;
    }

    // For mock data
    return mockOrders.filter((ord: any) => {
      const matchesTab = activeTab === "All" || ord.orderStatus?.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.shippingAddress?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
      let matchesDate = true;
      if (startDate || endDate) {
        const ordTime = new Date(ord.createdAt).getTime();
        if (startDate && ordTime < new Date(`${startDate}T00:00:00`).getTime()) matchesDate = false;
        if (endDate && ordTime > new Date(`${endDate}T23:59:59.999`).getTime()) matchesDate = false;
      }
      return matchesTab && matchesSearch && matchesDate;
    }).length;
  }, [ordersRes, isMock, activeTab, searchQuery, startDate, endDate]);

  // Visible page button selector range
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



  // Status Color Mapper
  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20">
            <Clock size={12} className="animate-pulse" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-500/20">
            <Package size={12} />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/20">
            <Truck size={12} />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={12} />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20">
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

  // Payment Status Badge
  const getPaymentBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
            PAID
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/10">
            PENDING
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/10">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-muted-foreground border border-border">
            {status?.toUpperCase()}
          </span>
        );
    }
  };

  // Direct modal order status change
  const handleModalStatusChange = async (orderId: string, status: string) => {
    const isMock = orderId.startsWith("mock");
    const toastId = toast.loading(`Updating order status to ${status}...`);
    try {
      if (isMock) {
        setConfirmModalOrder((prev: any) => (prev ? { ...prev, orderStatus: status } : null));
        toast.success(`Mock status updated to ${status}`, { id: toastId });
        return;
      }

      await updateOrderStatus({ id: orderId, status }).unwrap();
      setConfirmModalOrder((prev: any) => (prev ? { ...prev, orderStatus: status } : null));
      toast.success(`Order successfully marked as ${status}!`, { id: toastId });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update status.", { id: toastId });
    }
  };

  // Payment method Badge
  const getPaymentMethodBadge = (method: string) => {
    const normalized = method?.toLowerCase();
    switch (normalized) {
      case "bkash":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-pink-600 dark:text-pink-400">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 block" />
            bKash
          </span>
        );
      case "nagad":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-orange-600 dark:text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block" />
            Nagad
          </span>
        );
      case "cod":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 block" />
            Cash On Delivery
          </span>
        );
      case "online_payment":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block" />
            Online Card
          </span>
        );
      default:
        return <span className="text-[10px] font-bold text-muted-foreground uppercase">{method || "N/A"}</span>;
    }
  };

  // Delete Click handler
  const handleDeleteClick = (id: string, orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, orderNumber });
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, orderNumber } = deleteTarget;
    const isMock = id.startsWith("mock");

    const toastId = toast.loading(`Deleting order "${orderNumber}"...`);
    try {
      if (isMock) {
        toast.error("Cannot delete mock data.", { id: toastId });
        setDeleteTarget(null);
        return;
      }

      await deleteOrder(id).unwrap();
      toast.success(`Order ${orderNumber} deleted successfully!`, { id: toastId });
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to delete order.", { id: toastId });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Orders</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
              <ShoppingBag className="text-primary" size={24} />
              Orders Management
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Track shipment stages, review detailed invoices, examine customer contact details, modify status pipelines, and manage transactions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href="/pos"
              className="h-10 px-4.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
            >
              <Store size={16} className="text-white/90" />
              <span>Open POS Terminal</span>
            </Link>
          </div>
        </div>


        {/* Stats Blocks with Channel breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Orders</p>
              <h3 className="text-lg font-black text-foreground">{stats.total}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Web Store Sales</p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-lg font-black text-foreground">৳{stats.webRevenue.toLocaleString()}</h3>
                <span className="text-[10px] text-muted-foreground font-semibold">({stats.webCount} ord)</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Store size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">POS Counter Sales</p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-lg font-black text-foreground">৳{stats.posRevenue.toLocaleString()}</h3>
                <span className="text-[10px] text-muted-foreground font-semibold">({stats.posCount} ord)</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
              <TbCurrencyTaka size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Revenue</p>
              <h3 className="text-lg font-black text-foreground">৳{stats.revenue.toLocaleString()}</h3>
            </div>
          </div>
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
                    <span className="opacity-75 font-normal">({totalEntries} records)</span>
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

        {/* Tab Selection, Channel Filter & Search bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start overflow-x-auto max-w-full">
              {(["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all shrink-0 ${activeTab === tab
                    ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Channel Filter (Web vs POS) */}
            <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start overflow-x-auto">
              {[
                { key: "all", label: "All Channels", icon: <Tag size={11} /> },
                { key: "web", label: `🌐 Web Store (${stats.webCount})`, icon: <Globe size={11} /> },
                { key: "pos", label: `🏪 POS Sales (${stats.posCount})`, icon: <Store size={11} /> },
              ].map((ch) => (
                <button
                  key={ch.key}
                  onClick={() => setChannelFilter(ch.key as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
                    channelFilter === ch.key
                      ? "bg-primary text-white shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center h-10 w-full lg:max-w-md rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
            <Search className="text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by ID, customer, cashier, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Order Main Workspace */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border bg-card">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-12 text-center">SL</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-16 text-center">Image</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-24">Order ID</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Customer</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Primary Item</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Payment</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Date</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider text-right">Total</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Status</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayedOrders.length > 0 ? (
                  displayedOrders.map((ord: any, idx: number) => {
                    const fullName = ord.shippingAddress?.fullName || ord.user?.name || "Guest Customer";
                    const email = ord.user?.email || "N/A";
                    const phone = ord.shippingAddress?.phone || ord.user?.phone || "N/A";
                    const initial = fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

                    const primaryItemName = ord.items?.[0]?.product?.name || "Product Item";
                    const itemCount = ord.items?.length || 0;

                    const formattedDate = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "N/A";

                    const slIndex = (currentPage - 1) * itemsPerPage + idx + 1;

                    return (
                      <tr
                        key={ord._id || ord.id}
                        onClick={() => setConfirmModalOrder(ord)}
                        className={`hover:bg-muted/30 transition-colors group cursor-pointer ${
                          confirmModalOrder?._id === ord._id ? "bg-primary/5 dark:bg-primary/10" : ""
                        }`}
                      >
                        {/* SL */}
                        <td className="p-4 text-center font-bold text-muted-foreground w-12">{slIndex}</td>

                        {/* Product Image */}
                        <td className="p-4 text-center w-16">
                          <div className="w-10 h-10 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center mx-auto shrink-0 shadow-xs">
                            {ord.items?.[0]?.product?.thumbnail ? (
                              <img
                                src={ord.items[0].product.thumbnail}
                                alt={primaryItemName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as any).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200";
                                }}
                              />
                            ) : (
                              <Package size={16} className="text-muted-foreground/50" />
                            )}
                          </div>
                        </td>

                        {/* Visual ID */}
                        <td className="p-4 font-bold text-foreground">{ord.id}</td>

                        {/* Customer Info & Origin */}
                        <td className="p-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">{fullName}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{email}</span>
                            <a
                              href={`tel:${phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-primary hover:underline font-mono font-bold mt-0.5 flex items-center gap-1 w-fit"
                              title="Click to dial customer"
                            >
                              <PhoneCall size={9} className="text-emerald-500" />
                              {phone}
                            </a>

                            {/* Creator / Channel & Call Status Badges */}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {ord.source === "pos" || ord.channel === "pos" ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <Store size={9} /> POS Sale
                                  <span className="opacity-70 font-normal">
                                    • {ord.createdBy?.name || ord.cashierName || "Staff"}
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                  <Globe size={9} /> Web Store
                                </span>
                              )}

                              {/* Call Confirmation Status Pill */}
                              {ord.callStatus && (
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${
                                    ord.callStatus === "confirmed"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : ord.callStatus === "no_answer"
                                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                                      : ord.callStatus === "call_later"
                                      ? "bg-orange-500/15 text-orange-600 border border-orange-500/20"
                                      : ord.callStatus === "cancelled"
                                      ? "bg-rose-500/15 text-rose-600 border border-rose-500/20"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {ord.callStatus === "confirmed"
                                    ? "✓ Confirmed"
                                    : ord.callStatus === "no_answer"
                                    ? "No Ans"
                                    : ord.callStatus === "call_later"
                                    ? "Call Later"
                                    : ord.callStatus === "cancelled"
                                    ? "Cancelled"
                                    : ord.callStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Purchased Items details */}
                        <td className="p-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground truncate max-w-[200px]">
                              {primaryItemName}
                            </span>
                            {itemCount > 1 && (
                              <span className="text-[9px] text-primary font-semibold">
                                + {itemCount - 1} other item{itemCount > 2 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Payment Details */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {getPaymentMethodBadge(ord.payment?.method)}
                            <div>{getPaymentBadge(ord.payment?.status || "pending")}</div>
                          </div>
                        </td>

                        {/* Date Created */}
                        <td className="p-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                              <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
                              {(() => {
                                if (!ord.createdAt) return null;
                                const d = new Date(ord.createdAt);
                                const today = new Date();
                                const isToday = d.toDateString() === today.toDateString();
                                if (isToday) {
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
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                        </td>

                        {/* Total Bill */}
                        <td className="p-4 text-right font-black text-foreground">
                          ৳{Number(ord.totalAmount || 0).toFixed(2)}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">{getStatusBadge(ord.orderStatus || "pending")}</td>

                        {/* Actions */}
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit & Modify Order (Customer Call Confirmation & Variant/Address Change) */}
                            <button
                              onClick={() => setEditingOrder(ord)}
                              className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer border border-indigo-500/20 hover:scale-105 active:scale-95 shadow-xs"
                              title="Edit / Modify Order (Call Confirmation & Address/Variant Change)"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Stock Inspection & Order Details */}
                            <button
                              onClick={() => setConfirmModalOrder(ord)}
                              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-primary/20 hover:scale-105 active:scale-95 shadow-xs"
                              title="Inspect Variant Stock & Order Details"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Delete Order */}
                            <button
                              onClick={(e) => handleDeleteClick(ord._id, ord.id, e)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-rose-500/20 hover:scale-105 active:scale-95 shadow-xs"
                              title="Delete Order"
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
                    <td colSpan={11} className="p-12 text-center text-muted-foreground space-y-2">
                      <ShoppingBag className="mx-auto text-muted/30" size={36} />
                      <p className="text-xs font-bold">No orders found</p>
                      <p className="text-[10px]">No orders matching the active tab filters were found in records.</p>
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
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
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
                  <h4 className="font-heading text-base font-bold text-foreground">Permanently Delete Order?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to permanently delete order <span className="text-foreground font-bold">"{deleteTarget.orderNumber}"</span>? This will wipe the order transaction record and cannot be undone.
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

        {/* Order Details & Stock Verification Modal */}
        <OrderDetailsModal
          order={confirmModalOrder}
          onClose={() => setConfirmModalOrder(null)}
          onUpdateStatus={handleModalStatusChange}
          isUpdatingStatus={isUpdating}
          onOpenEdit={(ord) => {
            setConfirmModalOrder(null);
            setEditingOrder(ord);
          }}
        />

        {/* Edit & Modify Order Modal (Customer Phone Confirmation) */}
        <EditOrderModal
          isOpen={!!editingOrder}
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={(updated) => {
            refetch();
            setEditingOrder(null);
          }}
        />

        {/* Create POS Order / Quick Sale Modal */}
        <CreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
          onOrderCreated={(newOrder, invoice) => {
            refetch();
            if (invoice) {
              setActiveInvoiceForPreview(invoice);
            } else if (newOrder) {
              setConfirmModalOrder(newOrder);
            }
          }}
        />

        {/* Instant Invoice SlideOver Preview */}
        {activeInvoiceForPreview && (
          <InvoiceSlideOver
            selectedInvoice={activeInvoiceForPreview}
            onClose={() => setActiveInvoiceForPreview(null)}
            formatMethod={(m: string) => {
              const map: Record<string, string> = {
                bkash: "bKash",
                nagad: "Nagad",
                cod: "Cash on Delivery",
                online_payment: "Online Card",
                cash: "Cash / POS",
                card: "Credit/Debit Card",
                pos: "POS Terminal",
                bank_transfer: "Bank Transfer",
              };
              return map[m?.toLowerCase()] || m || "Cash";
            }}
            statusBadge={(s: string) => getPaymentBadge(s)}
          />
        )}

      </div>
    </DashboardLayout>
  );
}


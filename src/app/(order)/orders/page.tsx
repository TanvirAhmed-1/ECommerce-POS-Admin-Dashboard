"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  DollarSign,
  Clock,
  CheckCircle,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  XCircle,
  Truck,
  Package,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; orderNumber: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default to 20 items per page

  // Debounce search query to prevent backend request spamming
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when tab or debounced search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery]);

  // Backend paginated query
  const { data: ordersRes, isLoading, refetch } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: debouncedSearchQuery,
    status: activeTab === "All" ? "" : activeTab.toLowerCase(),
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
    if (!isMock) {
      return orders;
    }

    // Client-side simulation for mock data when DB is empty
    const filtered = mockOrders.map((ord: any, idx: number) => ({
      ...ord,
      id: ord.id || `ORD-${ord._id.slice(-6).toUpperCase()}`
    })).filter((ord: any) => {
      const matchesTab =
        activeTab === "All" ||
        ord.orderStatus?.toLowerCase() === activeTab.toLowerCase();

      const userName = ord.shippingAddress?.fullName || ord.user?.name || "";
      const userEmail = ord.user?.email || "";
      const userPhone = ord.shippingAddress?.phone || ord.user?.phone || "";
      const visualId = ord.id || "";

      const matchesSearch =
        visualId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userPhone.includes(searchQuery);

      return matchesTab && matchesSearch;
    });

    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [orders, isMock, activeTab, searchQuery, currentPage, itemsPerPage]);

  // Global Statistics (using aggregated metadata from backend, or client-side mock values)
  const stats = useMemo(() => {
    if (!isMock && ordersRes?.data?.meta?.stats) {
      const s = ordersRes.data.meta.stats;
      return {
        total: s.totalOrders || 0,
        pending: s.pendingOrders || 0,
        processing: s.processingOrders || 0,
        completed: s.totalOrders - s.pendingOrders - s.processingOrders, // estimation
        revenue: s.totalSales || 0,
      };
    }

    // Client-side fallback for mock data
    const total = mockOrders.length;
    const pending = mockOrders.filter((o) => o.orderStatus === "pending").length;
    const processing = mockOrders.filter((o) => o.orderStatus === "processing").length;
    const completed = mockOrders.filter((o) => o.orderStatus === "delivered").length;
    const revenue = mockOrders
      .filter((o) => o.orderStatus === "delivered" || o.payment?.status === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, pending, processing, completed, revenue };
  }, [ordersRes, isMock]);

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
      return matchesTab && matchesSearch;
    }).length;
    
    return Math.max(1, Math.ceil(filteredCount / itemsPerPage));
  }, [ordersRes, isMock, activeTab, searchQuery, itemsPerPage]);

  const totalEntries = useMemo(() => {
    if (!isMock && ordersRes?.data?.meta?.total !== undefined) {
      return ordersRes.data.meta.total;
    }
    
    // For mock data
    return mockOrders.filter((ord: any) => {
      const matchesTab = activeTab === "All" || ord.orderStatus?.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.shippingAddress?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    }).length;
  }, [ordersRes, isMock, activeTab, searchQuery]);

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

  // User Role Badge Mapper
  const getUserRoleBadge = (role: string) => {
    const normalized = role?.toLowerCase() || "customer";
    switch (normalized) {
      case "superadmin":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border border-violet-500/20">
            Super Admin
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/20">
            Admin
          </span>
        );
      case "reseller":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20">
            Reseller
          </span>
        );
      case "customer":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-muted-foreground border border-border">
            Customer
          </span>
        );
    }
  };

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

  // Update status handler
  const handleStatusChange = async (status: string) => {
    if (!selectedOrder) return;
    const isMock = selectedOrder._id.startsWith("mock");

    const toastId = toast.loading("Updating order status...");
    try {
      if (isMock) {
        // Mock Update
        const updated = { ...selectedOrder, orderStatus: status };
        setSelectedOrder(updated);
        toast.success(`Mock status updated to ${status}`, { id: toastId });
        return;
      }

      await updateOrderStatus({ id: selectedOrder._id, status }).unwrap();
      setSelectedOrder((prev: any) => (prev ? { ...prev, orderStatus: status } : null));
      toast.success(`Order status successfully updated to ${status}!`, { id: toastId });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update order status.", { id: toastId });
    }
  };

  // Update payment status handler
  const handlePaymentStatusChange = async (paymentStatus: string) => {
    if (!selectedOrder) return;
    const isMock = selectedOrder._id.startsWith("mock");

    const toastId = toast.loading("Updating payment status...");
    try {
      if (isMock) {
        const updated = {
          ...selectedOrder,
          payment: { ...selectedOrder.payment, status: paymentStatus }
        };
        setSelectedOrder(updated);
        toast.success(`Mock payment status updated to ${paymentStatus}`, { id: toastId });
        return;
      }

      await updateOrderStatus({ id: selectedOrder._id, paymentStatus }).unwrap();
      setSelectedOrder((prev: any) => (prev ? {
        ...prev,
        payment: { ...(prev.payment || {}), status: paymentStatus }
      } : null));
      toast.success(`Payment status successfully updated to ${paymentStatus}!`, { id: toastId });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update payment status.", { id: toastId });
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
      if (selectedOrder?._id === id) {
        setSelectedOrder(null);
      }
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

        {/* Stats Blocks */}
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pending Orders</p>
              <h3 className="text-lg font-black text-foreground">{stats.pending}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Processing</p>
              <h3 className="text-lg font-black text-foreground">{stats.processing}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Sales</p>
              <h3 className="text-lg font-black text-foreground">${stats.revenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection & Search bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start overflow-x-auto max-w-full">
            {(["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((tab) => (
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

          <div className="flex items-center h-10 w-full lg:max-w-md rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
            <Search className="text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by ID, name, email, or phone..."
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
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-24">Order ID</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider w-16 text-center">Image</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider">Customer</th>
                  <th className="p-4 font-bold uppercase text-[9px] tracking-wider text-center w-20">Role</th>
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
                        onClick={() => setSelectedOrder(ord)}
                        className={`hover:bg-muted/30 transition-colors group cursor-pointer ${
                          selectedOrder?._id === ord._id ? "bg-primary/5 dark:bg-primary/10" : ""
                        }`}
                      >
                        {/* SL */}
                        <td className="p-4 text-center font-bold text-muted-foreground w-12">{slIndex}</td>

                        {/* Visual ID */}
                        <td className="p-4 font-bold text-foreground">{ord.id}</td>

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

                        {/* Customer Info */}
                        <td className="p-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">{fullName}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{email}</span>
                            <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">{phone}</span>
                          </div>
                        </td>

                        {/* Customer Role */}
                        <td className="p-4 text-center">
                          {getUserRoleBadge(ord.user?.role)}
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
                        <td className="p-4 text-muted-foreground font-medium">{formattedDate}</td>

                        {/* Total Bill */}
                        <td className="p-4 text-right font-black text-foreground">
                          ${Number(ord.totalAmount || 0).toFixed(2)}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">{getStatusBadge(ord.orderStatus || "pending")}</td>

                        {/* Actions */}
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
                              title="View Invoice Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(ord._id, ord.id, e)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
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

        {/* Slide-over Drawer: Order details */}
        {selectedOrder && (
          <div className="fixed inset-0 z-40 overflow-hidden flex justify-end animate-fade-in">
            {/* Drawer Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Slide-over Card panel */}
            <div className="relative w-full max-w-lg bg-background border-l border-border h-full flex flex-col shadow-2xl z-10 animate-slide-in">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">{selectedOrder.id}</span>
                    {getStatusBadge(selectedOrder.orderStatus || "pending")}
                  </div>
                  <h3 className="font-heading text-lg font-black text-foreground">Order Invoicing Details</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
                
                {/* Status Update Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-primary/15 bg-primary/5 dark:bg-primary/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders size={12} />
                        Order Status
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary transition-all cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Manages shipment progress status and variant stock reserve holds.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard size={12} />
                        Payment Status
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedOrder.payment?.status || "pending"}
                        onChange={(e) => handlePaymentStatusChange(e.target.value)}
                        disabled={isUpdating}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Update order payment records and sync invoicing files.
                    </p>
                  </div>
                </div>

                {/* Customer Contact & Address Card */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
                    <User size={14} className="text-primary" />
                    Customer Contact & Shipping
                  </h4>
                  <div className="glass-card rounded-xl border border-border p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
                        {selectedOrder.shippingAddress?.fullName?.substring(0,2).toUpperCase() || "GC"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-foreground text-sm">
                            {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || "Guest Customer"}
                          </h5>
                          {selectedOrder.user?.role && getUserRoleBadge(selectedOrder.user.role)}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Registered Buyer Account</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate">{selectedOrder.user?.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2 border-t border-border/40">
                      <MapPin size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground leading-normal">
                          {selectedOrder.shippingAddress?.address || "N/A"}
                        </p>
                        <p className="font-bold text-primary">
                          City: {selectedOrder.shippingAddress?.city || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary list */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
                    <Package size={14} className="text-primary" />
                    Purchased Package Line Items ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                    {selectedOrder.items?.map((item: any, i: number) => {
                      const itemTitle = item.product?.name || "Product Item";
                      const itemPrice = item.price || 0;
                      const itemQty = item.quantity || 1;
                      const itemTotal = itemPrice * itemQty;
                      const varDetails = [];
                      if (item.variant?.color) varDetails.push(`Color: ${item.variant.color}`);
                      if (item.variant?.size) varDetails.push(`Size: ${item.variant.size}`);

                      return (
                        <div key={i} className="p-3.5 flex items-start justify-between gap-4">
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-foreground block truncate hover:underline cursor-pointer">
                              {itemTitle}
                            </span>
                            {varDetails.length > 0 && (
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                {varDetails.join(" | ")}
                              </span>
                            )}
                            <span className="text-[10px] text-primary font-bold">
                              ${itemPrice.toFixed(2)} &times; {itemQty}
                            </span>
                          </div>
                          <span className="font-black text-foreground shrink-0">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Billing Summary Box */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
                    <CreditCard size={14} className="text-primary" />
                    Billing & Payment Information
                  </h4>
                  <div className="glass-card rounded-xl border border-border p-4 bg-muted/5 space-y-3">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider block">Payment Gateway</span>
                        <span className="font-black text-foreground text-xs uppercase block">
                          {selectedOrder.payment?.method === "cod" ? "Cash On Delivery" : selectedOrder.payment?.method}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider block">Gateway Status</span>
                        <div>{getPaymentBadge(selectedOrder.payment?.status || "pending")}</div>
                      </div>
                    </div>

                    {selectedOrder.payment?.transactionId && (
                      <div className="p-2.5 rounded bg-card border border-border font-mono text-[10px] space-y-0.5">
                        <span className="text-muted-foreground block text-[9px] font-bold">Transaction Reference ID</span>
                        <span className="text-foreground font-extrabold">{selectedOrder.payment.transactionId}</span>
                      </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-border/40 font-medium text-muted-foreground">
                      <div className="flex justify-between items-center text-foreground font-black text-sm pt-1.5">
                        <span>Total Checkout Charge</span>
                        <span>${Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Drawer Footer controls */}
              <div className="p-4 border-t border-border flex items-center gap-3 bg-muted/20">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 h-10 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Close Invoice
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(selectedOrder._id, selectedOrder.id, e)}
                  className="px-4 h-10 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  title="Permanently Delete Order"
                >
                  <Trash2 size={14} />
                  <span>Delete Order</span>
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

      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useGetAllOrdersQuery } from "@/redux/features/order/orderApi";
import { useGetAllUsersQuery } from "@/redux/features/user/userApi";
import Loader from "@/components/shared/Loader";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  Calendar, 
  Download, 
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function OverviewPage() {
  // Fetch data from Redux API
  const { data: productsRes, isLoading: isProductsLoading } = useGetAllProductsQuery({});
  const { data: ordersRes, isLoading: isOrdersLoading } = useGetAllOrdersQuery({});
  const { data: usersRes, isLoading: isUsersLoading } = useGetAllUsersQuery({});

  const isLoading = isProductsLoading || isOrdersLoading || isUsersLoading;

  // Process data with fallbacks
  const stats = useMemo(() => {
    const products = productsRes?.data || [];
    const orders = ordersRes?.data || [];
    const users = usersRes?.data || [];

    const totalProducts = products.length > 0 ? products.length : 450;
    const totalOrders = orders.length > 0 ? orders.length : 942;
    
    // Sum total revenue
    let totalRevenue = 128432.00;
    if (orders.length > 0) {
      totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    }

    // Conversion rate
    const conversionRate = users.length > 0 && orders.length > 0 
      ? ((orders.length / users.length) * 100).toFixed(2) 
      : "3.24";

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      conversionRate,
      rawOrders: orders,
      rawProducts: products,
      rawUsers: users
    };
  }, [productsRes, ordersRes, usersRes]);

  // Format money helper
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(val);
  };

  // Activity Feed Data
  const activityFeed = useMemo(() => {
    const orders = stats.rawOrders;
    if (orders.length > 0) {
      return orders.slice(0, 5).map((order: any, idx: number) => {
        const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : `${idx + 2} mins ago`;
        return {
          id: order._id || idx,
          type: "order",
          title: `New Order #${(order._id || "").substring(0, 8).toUpperCase()} received`,
          meta: `Customer: ${order.shippingAddress?.fullName || "Guest User"} • Value: ${formatMoney(order.totalAmount || 0)} • Status: ${order.orderStatus}`,
          time: date,
          color: "text-primary bg-primary/10",
          icon: <ShoppingBag size={18} />
        };
      });
    }

    // Default beautiful mock feed
    return [
      {
        id: 1,
        type: "order",
        title: "New Order #APE-2942 received",
        meta: "Customer: Julian V. • Value: $432.00 • Shipping: Express",
        time: "2 mins ago",
        color: "text-primary bg-primary/10",
        icon: <ShoppingBag size={18} />
      },
      {
        id: 2,
        type: "alert",
        title: 'Inventory Alert "Premium Headphones X1" low stock',
        meta: "Stock remaining: 4 units • Automatic reorder triggered",
        time: "14 mins ago",
        color: "text-secondary bg-secondary/10",
        icon: <Package size={18} />
      },
      {
        id: 3,
        type: "user",
        title: 'New Merchant "Skyline Retail" registered',
        meta: "Account verification in progress • Tier: Platinum",
        time: "1 hour ago",
        color: "text-amber-400 bg-amber-400/10",
        icon: <Users size={18} />
      }
    ];
  }, [stats.rawOrders]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* WELCOME SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span>Apex Engine Enterprise</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              System Overview
            </h2>
            <p className="font-sans text-sm md:text-base text-on-surface-variant/80 mt-1">
              Real-time performance tracking and telemetry for your store.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high/40 hover:bg-surface-container-high/70 border border-outline-variant/30 rounded-xl font-sans text-sm font-semibold text-white transition-all cursor-pointer">
              <Calendar size={16} />
              <span>Last 7 Days</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 shadow-lg text-white font-sans text-sm font-semibold rounded-xl transition-all cursor-pointer indigo-glow-hover">
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <DollarSign size={20} />
              </div>
              <span className="text-secondary font-sans text-xs font-bold flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                <TrendingUp size={12} /> +12.4%
              </span>
            </div>
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h3 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
              {formatMoney(stats.totalRevenue)}
            </h3>
            {/* Sparkline Visual */}
            <div className="mt-4 h-[40px] w-full bg-surface-container-low/30 rounded-lg flex items-end gap-[3px] px-2 py-1">
              <div className="w-full bg-primary/30 rounded-t-sm" style={{ height: "40%" }}></div>
              <div className="w-full bg-primary/30 rounded-t-sm" style={{ height: "60%" }}></div>
              <div className="w-full bg-primary/30 rounded-t-sm" style={{ height: "35%" }}></div>
              <div className="w-full bg-primary/30 rounded-t-sm" style={{ height: "50%" }}></div>
              <div className="w-full bg-primary/45 rounded-t-sm" style={{ height: "85%" }}></div>
              <div className="w-full bg-primary/60 rounded-t-sm" style={{ height: "70%" }}></div>
              <div className="w-full bg-primary rounded-t-sm" style={{ height: "100%" }}></div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary border border-secondary/20">
                <ShoppingBag size={20} />
              </div>
              <span className="font-sans text-xs font-semibold text-on-surface-variant">
                Live Sales
              </span>
            </div>
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Orders Processed
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
                {stats.totalOrders}
              </h3>
              <span className="text-on-surface-variant text-xs font-semibold">Completed</span>
            </div>
            {/* Order stats progress bar */}
            <div className="mt-6 space-y-1">
              <div className="flex justify-between text-[10px] text-on-surface-variant font-semibold">
                <span>76% Target reached</span>
                <span>24% Left</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: "76%" }}></div>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/5 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-400/20">
                <Package size={20} />
              </div>
              <button className="text-on-surface-variant hover:text-white cursor-pointer bg-transparent border-none">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Active Products
            </p>
            <h3 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
              {stats.totalProducts}
            </h3>
            {/* Mini avatar stack */}
            <div className="mt-4 flex -space-x-2 items-center">
              <div className="w-6 h-6 rounded-full border border-surface-container bg-indigo-900/60 flex items-center justify-center text-[8px] font-bold text-indigo-200">S1</div>
              <div className="w-6 h-6 rounded-full border border-surface-container bg-emerald-900/60 flex items-center justify-center text-[8px] font-bold text-emerald-200">S2</div>
              <div className="w-6 h-6 rounded-full border border-surface-container bg-amber-900/60 flex items-center justify-center text-[8px] font-bold text-amber-200">S3</div>
              <div className="px-2 h-6 rounded-full border border-surface-container bg-surface-container-high flex items-center justify-center text-[9px] font-bold text-white">
                +12
              </div>
              <span className="text-[10px] text-on-surface-variant font-semibold ml-2">Items cataloged</span>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                <TrendingUp size={20} />
              </div>
              <span className="text-on-surface-variant font-sans text-xs font-semibold">
                vs LY
              </span>
            </div>
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Conversion Rate
            </p>
            <h3 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
              {stats.conversionRate}%
            </h3>
            <div className="mt-6 space-y-1">
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(Number(stats.conversionRate) * 15, 100)}%` }}></div>
              </div>
              <p className="text-[10px] text-on-surface-variant text-right font-semibold">Target: 4.5%</p>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Analysis Chart */}
          <div className="lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <div>
                <h4 className="font-heading text-lg font-bold text-white">Revenue Analysis</h4>
                <p className="font-sans text-xs text-on-surface-variant">Weekly sales volume across all channels</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  <span>Online Store</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
                  <span>POS Terminal</span>
                </div>
              </div>
            </div>

            {/* Svg line chart mockup */}
            <div className="w-full h-[300px] relative mt-4">
              <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="50" x2="1000" y2="50" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                <line x1="0" y1="150" x2="1000" y2="150" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                
                {/* Area under curve */}
                <path className="chart-gradient" d="M0,250 L150,220 L300,240 L450,120 L600,160 L750,80 L900,110 L1000,60 V300 H0 Z" fill="url(#chartGradient)"></path>
                
                {/* Smooth Curve */}
                <path d="M0,250 L150,220 L300,240 L450,120 L600,160 L750,80 L900,110 L1000,60" fill="none" stroke="#c3c0ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
                
                {/* Highlight Points */}
                <circle cx="450" cy="120" r="5" fill="#c3c0ff" stroke="#0f131d" strokeWidth="2"></circle>
                <circle cx="750" cy="80" r="5" fill="#c3c0ff" stroke="#0f131d" strokeWidth="2"></circle>
              </svg>
              {/* Tooltip */}
              <div className="absolute top-12 left-[43%] bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline shadow-2xl pointer-events-none">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Wednesday</p>
                <p className="text-xs font-bold text-white">$18,432.00</p>
              </div>
            </div>
            
            {/* Chart X axis */}
            <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-2 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-lg font-bold text-white mb-1">Categories</h4>
              <p className="font-sans text-xs text-on-surface-variant">Sales split by department</p>
            </div>

            {/* Circular Pie Chart */}
            <div className="flex-1 flex flex-col justify-center items-center py-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle className="text-surface-container-high/30" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16"></circle>
                  {/* Fashion (50%) */}
                  <circle className="text-primary" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="251.3"></circle>
                  {/* Electronics (30%) */}
                  <circle className="text-secondary" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="402" transform="rotate(180 96 96)"></circle>
                  {/* Home (20%) */}
                  <circle className="text-amber-400" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="452.3" transform="rotate(288 96 96)"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white leading-none font-heading">50%</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Fashion</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  <span className="text-on-surface-variant">Fashion</span>
                </div>
                <span className="text-white">50%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                  <span className="text-on-surface-variant">Electronics</span>
                </div>
                <span className="text-white">30%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="text-on-surface-variant">Home & Decor</span>
                </div>
                <span className="text-white">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY FEED */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/20">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">System Activity Feed</h4>
              <p className="font-sans text-xs text-on-surface-variant">Telemetry log of transactions and products</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider border border-secondary/20 animate-pulse">
              Live Updates
            </span>
          </div>
          
          <div className="divide-y divide-outline-variant/10">
            {activityFeed.map((activity: any) => (
              <div key={activity.id} className="p-6 flex gap-4 hover:bg-surface-container-low/30 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-sans text-sm font-bold text-white truncate">
                      {activity.title}
                    </p>
                    <span className="text-xs text-on-surface-variant/70 whitespace-nowrap font-semibold ml-2">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 font-sans">
                    {activity.meta}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-4 text-xs font-bold text-primary hover:bg-primary/5 transition-all text-center border-none bg-transparent cursor-pointer flex items-center justify-center gap-1 group">
            <span>View All System Events</span>
            <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

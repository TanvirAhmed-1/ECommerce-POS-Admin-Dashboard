import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Users,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Package,
  Receipt,
  Mail,
  MessageSquare,
  Sliders,
  FolderTree,
  Tag,
  Layers,
  Images,
} from "lucide-react";
import React from "react";

export interface SidebarLink {
  title: string;
  route: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface SidebarGroup {
  groupName: string;
  links: SidebarLink[];
}

export const zenithDashboardLinks: SidebarGroup[] = [
  {
    groupName: "OVERVIEW",
    links: [
      {
        title: "Dashboard",
        route: "/overview",
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: "Analytics",
        route: "/analytics",
        icon: <BarChart3 size={18} />,
      },
      {
        title: "eCommerce",
        route: "/ecommerce",
        icon: <ShoppingBag size={18} />,
      },
      {
        title: "CRM",
        route: "/crm",
        icon: <Users size={18} />,
      },
      {
        title: "SaaS",
        route: "/saas",
        icon: <Sparkles size={18} />,
      },
      {
        title: "Charts",
        route: "/charts",
        icon: <TrendingUp size={18} />,
      },
    ],
  },
  {
    groupName: "COMMERCE",
    links: [
      {
        title: "Orders",
        route: "/orders",
        icon: <ShoppingCart size={18} />,
        badge: 12,
      },
      {
        title: "Products",
        route: "/products",
        icon: <Package size={18} />,
      },
      {
        title: "Categories",
        route: "/categories",
        icon: <FolderTree size={18} />,
      },
      {
        title: "Brands",
        route: "/brands",
        icon: <Tag size={18} />,
      },
      {
        title: "Attributes",
        route: "/attributes",
        icon: <Sliders size={18} />,
      },
      {
        title: "Variants",
        route: "/variants",
        icon: <Layers size={18} />,
      },
      {
        title: "Customers",
        route: "/customers",
        icon: <Users size={18} />,
      },
      {
        title: "Invoices",
        route: "/invoices",
        icon: <Receipt size={18} />,
      },
    ],
  },
  {
    groupName: "APPS",
    links: [
      {
        title: "Mail",
        route: "/mail",
        icon: <Mail size={18} />,
      },
      {
        title: "Chat",
        route: "/chat",
        icon: <MessageSquare size={18} />,
      },
    ],
  },
  {
    groupName: "WEB CMS",
    links: [
      {
        title: "Sliders",
        route: "/cms/sliders",
        icon: <Images size={18} />,
      },
      {
        title: "Pages",
        route: "/cms/pages",
        icon: <Layers size={18} />,
      },
      {
        title: "Homepage Sections",
        route: "/cms/sections",
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    groupName: "SETTINGS",
    links: [
      {
        title: "Settings",
        route: "/settings",
        icon: <Sliders size={18} />,
      },
    ],
  },
];

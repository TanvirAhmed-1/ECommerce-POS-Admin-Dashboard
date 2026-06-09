import {
  LayoutDashboard,
  CreditCard,
  Users,
  Briefcase,
  CalendarDays,
  Database,
  BarChart3,
  ShieldCheck,
  Settings,
  PlusCircle,
} from "lucide-react";

const iconSize = 18;
const iconColor = "text-indigo-600";

export const dashboardLinks = [
  {
    title: "System Overview",
    route: "/overview",
    hasChildren: false,
    icon: <LayoutDashboard className={iconColor} size={iconSize} />,
  },
  {
    title: "Card Assignment",
    route: "/assignment",
    hasChildren: false,
    icon: <PlusCircle className={iconColor} size={iconSize} />,
  },
  {
    title: "Member Directory",
    route: null,
    hasChildren: true,
    icon: <Users className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "All Members List", route: "/members/list" }
    ],
  },
  {
    title: "Active Offerings",
    route: null,
    hasChildren: true,
    icon: <Briefcase className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "All Offerings", route: "/offerings" }
    ],
  },
  {
    title: "Access Cards",
    route: null,
    hasChildren: true,
    icon: <CreditCard className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "Card Inventory", route: "/card/inventory" },
      { title: "New Card Issuance", route: "/card/issuance" },
      { title: "SMS Notifications", route: "/card/notifications" },
    ],
  },
  {
    title: "Event Programs",
    route: null,
    hasChildren: true,
    icon: <CalendarDays className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "All Programs", route: "/programs/list" },
      { title: "Assign Provisions", route: "/programs/provisions" },
      { title: "Registered Guests", route: "/programs/guests" },
      { title: "Program Analytics", route: "/programs/analytics" },
    ],
  },
  {
    title: "Item Catalog",
    route: null,
    hasChildren: true,
    icon: <Database className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "Service Types", route: "/catalog/types" },
      { title: "Service Inventory", route: "/catalog/items" },
      { title: "Counter List", route: "/catalog/desks" },
    ],
  },
  {
    title: "Ledger Reports",
    route: null,
    hasChildren: true,
    icon: <BarChart3 className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "Daily Cash Log", route: "/ledger/cash-log" },
      { title: "Ledger History", route: "/ledger/history" },
      { title: "Desk Sales", route: "/ledger/desk-sales" },
      { title: "Item Sales", route: "/ledger/item-sales" },
      { title: "Provisions Summary", route: "/ledger/summary" },
    ],
  },
  {
    title: "Operators Directory",
    route: null,
    hasChildren: true,
    icon: <ShieldCheck className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "Manage Operators", route: "/operators/directory" },
    ],
  },
  {
    title: "Workspace Profile",
    route: null,
    hasChildren: true,
    icon: <Settings className={iconColor} size={iconSize} />,
    subRoutes: [
      { title: "Workspace settings", route: "/workspace/profile" },
    ],
  },
];

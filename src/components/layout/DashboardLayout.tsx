"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { removeTokenCookie } from "@/server/storeCookies";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sliders,
  User,
} from "lucide-react";
import { zenithDashboardLinks } from "@/constants/dashboardLinks";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);
  const getInitials = (nameStr: string | null) => {
    if (!nameStr) return "AS";
    const initials = nameStr
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return initials || "AS";
  };

  // Redirect to login if token is missing/expired
  useEffect(() => {
    if (!user.token) {
      router.push("/login");
    }
  }, [user.token, router]);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light";
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const rootClass = window.document.documentElement.classList;
        if (rootClass.contains("light")) {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      }
    }
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Initialize and apply custom dashboard primary accent color on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColorHex = localStorage.getItem("dashboardColorHex");
      if (savedColorHex) {
        document.documentElement.style.setProperty("--primary", savedColorHex);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await removeTokenCookie();
    } catch (error) {
      console.error("Failed to remove token cookie:", error);
    }
    dispatch(logout());
    router.push("/login");
  };

  const renderSidebarContent = (isMobile = false) => (
    <div
      className={`flex flex-col h-full transition-colors duration-300 ${
        theme === "light"
          ? "bg-white border-zinc-200 text-zinc-800"
          : "bg-black border-zinc-800 text-zinc-300"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-inherit">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-md transform rotate-6">
          <Sparkles size={16} />
        </div>
        {(!isCollapsed || isMobile) && (
          <div className="flex flex-col animate-fade-in">
            <span className="text-sm font-extrabold tracking-tight leading-tight text-foreground">
              Zenith
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              DASHBOARD
            </span>
          </div>
        )}
      </div>

      {/* Sidebar Links */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {zenithDashboardLinks.map((group) => (
          <div key={group.groupName} className="space-y-1.5">
            {(!isCollapsed || isMobile) ? (
              <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {group.groupName}
              </h3>
            ) : (
              <div className="w-full border-t border-muted/50 my-2" />
            )}

            <div className="space-y-0.5">
              {group.links.map((link) => {
                const isActive = pathname === link.route;
                return (
                  <Link
                    key={link.title}
                    href={link.route}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-zinc-100/50 hover:text-foreground dark:hover:bg-zinc-800/40"
                    }`}
                    title={link.title}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`transition-colors shrink-0 ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {link.icon}
                      </div>
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate">{link.title}</span>
                      )}
                    </div>

                    {link.badge !== undefined && (!isCollapsed || isMobile) && (
                      <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-primary/10 text-primary rounded-full shrink-0">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Profile */}
      <div className="p-3 border-t border-inherit mt-auto bg-inherit">
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            theme === "light" ? "bg-zinc-50" : "bg-zinc-900/40"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User Avatar"}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 font-extrabold text-sm border border-border">
                {getInitials(user.name)}
              </div>
            )}
            {(!isCollapsed || isMobile) && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <span className="text-xs font-bold leading-none text-foreground truncate">
                  {user.name || "Aigars S."}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase">
                  {user.role?.replace("_", " ") || "Admin"}
                </span>
              </div>
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`h-screen flex flex-row overflow-hidden relative transition-colors duration-300 ${
        theme === "light" ? "bg-zinc-50" : "bg-black"
      }`}
    >
      {/* Left Sidebar (Desktop) */}
      <div
        className={`hidden md:flex flex-col h-full border-r z-40 relative transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? "w-20" : "w-60"
        } ${theme === "light" ? "border-zinc-200" : "border-zinc-800"}`}
      >
        {renderSidebarContent(false)}

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center z-50 cursor-pointer shadow-sm hover:scale-105 transition-all ${
            theme === "light"
              ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          }`}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Right Content Section */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Sticky Topbar */}
        <header
          className={`h-16 border-b flex flex-row justify-between items-center px-4 md:px-6 z-30 transition-colors duration-300 ${
            theme === "light"
              ? "bg-white/80 backdrop-blur-md border-zinc-200"
              : "bg-black/80 backdrop-blur-md border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                    <Menu size={20} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r">
                  {renderSidebarContent(true)}
                </SheetContent>
              </Sheet>
            </div>

            {/* Search Input */}
            <div
              className={`flex items-center h-10 w-40 sm:w-64 md:w-72 rounded-lg px-3 gap-2 border transition-all ${
                theme === "light"
                  ? "bg-zinc-50 border-zinc-200 focus-within:border-zinc-400 focus-within:bg-white"
                  : "bg-zinc-900/60 border-zinc-800 focus-within:border-zinc-700 focus-within:bg-zinc-900"
              }`}
            >
              <Search className="text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search anything..."
                className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground w-full"
              />
              <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground border border-muted/30 px-1 rounded">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-3.5">
            {/* New Order Button */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:opacity-90 font-bold text-xs rounded-lg cursor-pointer transition-all shadow-sm shadow-primary/20">
              <Plus size={14} />
              New Order
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                  : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-yellow-400"
              }`}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Customize Panel Icon */}
            <button
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                  : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
              aria-label="Customize Layout"
            >
              <Sliders size={16} />
            </button>

            {/* Notification Badge */}
            <button
              className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                  : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </button>

            <div className="w-[1px] h-6 bg-border mx-0.5" />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer outline-none border-none bg-transparent">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User Avatar"}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-xs border border-border">
                      {getInitials(user.name)}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-48 mt-1.5 p-1 rounded-xl border shadow-xl ${
                  theme === "light"
                    ? "bg-white border-zinc-200"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <div className="px-2 py-1.5 border-b border-border mb-1">
                  <p className="text-xs font-bold truncate">
                    {user.name || "Aigars S."}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email || "aigars@example.com"}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
                >
                  <User size={14} />
                  <span className="text-xs font-bold">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span className="text-xs font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar w-full relative">
          <div className="max-w-[1600px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

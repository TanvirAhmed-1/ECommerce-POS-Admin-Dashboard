"use client";

import { dashboardLinks } from "@/constants/dashboardLinks";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSearch, FaBars } from "react-icons/fa";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { removeTokenCookie } from "@/server/storeCookies";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Sun, Moon, Sparkles } from "lucide-react";

//sidebar Link
const SidebarContent = ({
  openSection,
  toggleSection,
  pathname,
  theme,
}: {
  openSection: string | null;
  toggleSection: (title: string) => void;
  pathname: string;
  theme: "dark" | "light";
}) => (
  <div className={`flex flex-col h-full backdrop-blur-xl border-r transition-all duration-300 ${theme === "light"
      ? "bg-white/60 border-slate-200/80 text-slate-700"
      : "bg-slate-950/40 border-white/10 text-slate-300"
    }`}>
    <div className={`h-16 flex items-center gap-3 px-4 border-b bg-transparent transition-all duration-300 ${theme === "light" ? "border-slate-200/80" : "border-white/10"
      }`}>
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
        <Sparkles size={16} />
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-extrabold tracking-tight leading-tight ${theme === "light" ? "text-slate-800" : "text-white"}`}>
          Apex Engine
        </span>
        <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-bold">
          Enterprise Admin
        </span>
      </div>
    </div>

    <div className="flex-1 px-4 pt-5 pb-16 space-y-1.5 overflow-y-auto scrollbar-hide">
      {dashboardLinks.map((item) => {
        const isActive = item.route === pathname;
        const isOpen = openSection === item.title;

        return item.hasChildren ? (
          <div key={item.title} className="group">
            <button
              onClick={() => toggleSection(item.title)}
              className={`flex cursor-pointer w-full justify-between items-center text-sm gap-1 transition-all duration-300 ease-in-out p-2.5 rounded-lg font-semibold ${isOpen
                  ? theme === "light"
                    ? "bg-slate-100/80 text-slate-900 border border-slate-200/60"
                    : "bg-white/5 text-white border border-white/10"
                  : theme === "light"
                    ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-[0.98]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white hover:scale-[0.98]"
                }`}
            >
              <div className="flex flex-row items-center gap-2.5 mr-1">
                {React.cloneElement(item.icon as React.ReactElement<any>, {
                  className: isOpen ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500"
                })}
                <span>{item.title}</span>
              </div>
              {isOpen ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>

            {isOpen && (
              <div className={`ml-4 mt-1 space-y-1 border-l-2 pl-2 transition-all duration-300 ${theme === "light" ? "border-slate-200" : "border-white/10"
                }`}>
                {item.subRoutes?.map((sub) => {
                  const isSubActive = pathname === sub.route;
                  return (
                    <Link
                      href={sub.route}
                      key={sub.title}
                      className={`text-sm font-semibold px-3 py-2 rounded-lg flex flex-row items-center gap-2 transition-all duration-200 hover:scale-[0.98] ${isSubActive
                          ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                          : theme === "light"
                            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      {sub.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Link
            href={item.route || "/"}
            key={item.title}
            className={`flex flex-row items-center text-sm gap-2.5 transition-all duration-300 ease-in-out p-2.5 rounded-lg font-semibold hover:scale-[0.98] ${isActive
                ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                : theme === "light"
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
          >
            {React.cloneElement(item.icon as React.ReactElement<any>, {
              className: isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
            })}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>

    <div className={`py-4 text-center text-slate-500 text-xs font-semibold border-t ${theme === "light" ? "border-slate-200/80" : "border-white/5"
      }`}>
      © 2026 Apex Engine Enterprise
    </div>
  </div>
);

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const activeParent = dashboardLinks.find(item =>
      item.subRoutes?.some(sub => sub.route === pathname)
    );
    return activeParent ? activeParent.title : null;
  });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
    const activeParent = dashboardLinks.find(item =>
      item.subRoutes?.some(sub => sub.route === pathname)
    );
    if (activeParent) {
      setOpenSection(activeParent.title);
    }
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const handleLogout = async () => {
    try {
      await removeTokenCookie();
    } catch (error) {
      console.error("Failed to remove token cookie:", error);
    }
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className={`h-screen flex flex-row overflow-hidden relative transition-colors duration-300 ${theme === "light"
        ? "bg-linear-to-b from-slate-50 via-indigo-50/20 to-purple-50/15"
        : "bg-linear-to-b from-gray-950 via-slate-900 to-indigo-950"
      }`}>
      {/* 🌌 Animated Background Glowing Blobs */}
      <div className={`absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-300 ${theme === "light" ? "bg-indigo-400/5" : "bg-indigo-600/10"
        }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-300 ${theme === "light" ? "bg-purple-400/5" : "bg-purple-600/10"
        }`} />

      {/* 💻 Desktop Sidebar */}
      <div className={`hidden md:flex w-64 border-r shadow-2xl bg-transparent relative z-20 transition-colors duration-300 ${theme === "light" ? "border-slate-200/80" : "border-white/10"
        }`}>
        <SidebarContent
          openSection={openSection}
          toggleSection={toggleSection}
          pathname={pathname}
          theme={theme}
        />
      </div>

      {/* Right section */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative z-10">
        {/* Top bar */}
        <div className={`h-16 border-b flex flex-row justify-between items-center px-4 md:px-6 shadow-md z-20 w-full transition-colors duration-300 ${theme === "light"
            ? "bg-white/60 backdrop-blur-xl border-slate-200/80"
            : "bg-slate-950/45 backdrop-blur-xl border-white/10"
          }`}>
          <div className="flex items-center gap-3 md:gap-0">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <button className={`p-2 transition-colors focus:outline-none bg-transparent border-none ${theme === "light" ? "text-slate-600 hover:text-indigo-600" : "text-slate-300 hover:text-indigo-400"
                    }`}>
                    <FaBars className="text-xl" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className={`p-0 w-64 border-r ${theme === "light" ? "bg-white/95 border-slate-200/80" : "bg-slate-950 border-white/10"
                    }`}
                >
                  <SidebarContent
                    openSection={openSection}
                    toggleSection={toggleSection}
                    pathname={pathname}
                    theme={theme}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Search Box */}
            <div className={`hidden sm:flex h-10 w-48 md:w-72 rounded-lg flex-row items-center px-3 gap-2 border transition-all duration-300 ${theme === "light"
                ? "bg-slate-100 border-slate-200/80 focus-within:border-indigo-500 focus-within:bg-white"
                : "bg-white/5 border-white/10 focus-within:border-indigo-500 focus-within:bg-white/10"
              }`}>
              <FaSearch className="text-slate-400 text-sm shrink-0" />
              <input
                type="text"
                placeholder="Search anything..."
                className={`flex-1 outline-none text-sm font-semibold bg-transparent w-full border-none! ${theme === "light" ? "text-slate-800 placeholder:text-slate-400" : "text-slate-200 placeholder:text-slate-500"
                  }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${theme === "light"
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:scale-105"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-yellow-400 hover:scale-105"
                }`}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 transition-transform duration-300" />
              ) : (
                <Sun className="w-5 h-5 transition-transform duration-300 text-yellow-400" />
              )}
            </button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex justify-between items-center gap-3 cursor-pointer p-1.5 rounded-lg transition-all group text-left outline-none border-none bg-transparent ${theme === "light" ? "hover:bg-slate-100" : "hover:bg-white/5"
                  }`}>
                  <div className="h-9 w-9 shrink-0 bg-indigo-950/40 rounded-full flex justify-center items-center overflow-hidden border border-white/10 group-hover:border-indigo-500 transition-colors">
                    <Image
                      src="/user_image.jpg"
                      alt="profile"
                      width={50}
                      height={50}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:flex flex-row items-center gap-2">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold leading-tight whitespace-nowrap ${theme === "light" ? "text-slate-800" : "text-slate-200"
                        }`}>
                        {user.name || "John Doe"}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                        {user.role?.replace("_", " ") || "Super Admin"}
                      </span>
                    </div>
                    <FaChevronDown className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors ml-1 shrink-0" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`w-40 mt-2 rounded-xl shadow-2xl p-1.5 border ${theme === "light"
                  ? "border-slate-200/80 bg-white/95 backdrop-blur-md"
                  : "border-white/10 bg-slate-950/90 backdrop-blur-md"
                }`} align="end">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 py-6 px-6 overflow-y-auto w-full relative z-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;

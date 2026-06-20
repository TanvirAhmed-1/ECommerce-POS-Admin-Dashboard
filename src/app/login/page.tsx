"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setToken, setUserInfo } from "@/redux/features/auth/authSlice";
import { setTokenCookie } from "@/server/storeCookies";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { ImageSlider } from "@/components/ui/image-slider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const sliderImages = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop",
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Auto Fill Demo Accounts
  const handleFillDemo = (type: "admin" | "staff") => {
    if (type === "admin") {
      setEmail("superadmin@zenith.com");
      setPassword("superadmin123");
      toast.success("Autofilled Admin credentials!");
    } else {
      setEmail("staff@zenith.com");
      setPassword("staff123");
      toast.success("Autofilled Staff credentials!");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const toastId = toast.loading("Authenticating secure session...");
    console.log(email, password);
    try {
      const res = await login({ email, password }).unwrap();
      const tokenVal = res?.data?.token || res?.token;
      const userVal = res?.data?.user || res?.user;

      if (!tokenVal) {
        throw new Error("No authentication token received from server.");
      }

      // 1. Save Token to server cookies
      await setTokenCookie(tokenVal);

      // 2. Dispatch to Redux Store
      dispatch(setToken(tokenVal));
      dispatch(
        setUserInfo({
          name: userVal?.name || "Zenith Admin",
          email: userVal?.email || email,
          role: userVal?.role || "admin",
          id: userVal?._id || userVal?.id || null,
          avatar: userVal?.avatar || null,
        })
      );

      toast.success(`Welcome back, ${userVal?.name || "Administrator"}!`, {
        id: toastId,
      });

      // 3. Route to Overview page
      router.push("/overview");
    } catch (err: any) {
      console.error("Login failure:", err);
      toast.error(
        err?.data?.message || err?.message || "Invalid credentials. Please try again.",
        { id: toastId }
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black p-4 md:p-8 overflow-hidden select-none">
      
      {/* BACKGROUND EFFECTS: Framer Grid Pattern & Ambient Glowing Orbs */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0%,transparent_60%)] opacity-80" />
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[90px] animate-pulse pointer-events-none" />

      {/* CENTERED LAYOUT CARD: max-w-5xl width */}
      <div className="relative z-10 w-full max-w-5xl h-[650px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl">
        
        {/* LEFT COLUMN: ImageSlider (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:block w-full h-full relative overflow-hidden bg-zinc-950">
          <ImageSlider images={sliderImages} interval={4000} className="w-full h-full" />
          
          {/* Logo overlay on slider */}
          <div className="absolute top-8 left-8 z-20 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-violet-500 text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-black tracking-tight text-white uppercase font-heading">
              Zenith Engine
            </span>
          </div>

          {/* Dynamic Dark Gradient Tint over slider */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Marketing captions on slider */}
          <div className="absolute bottom-16 left-8 right-12 z-20 space-y-2.5">
            <span className="inline-flex text-[8px] font-black tracking-widest text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full uppercase">
              RETAIL ENGINE
            </span>
            <h2 className="text-2xl font-black text-white font-heading tracking-tight leading-tight max-w-md">
              Revolutionize Your Storefront
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
              Connect catalogs, inventory tracking, POS checkout registries, and customer analytics in a unified dashboard.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Custom Premium Login Form */}
        <div className="w-full h-full bg-zinc-950/40 text-card-foreground flex flex-col justify-center p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-zinc-900">
          
          <div className="w-full max-w-sm mx-auto">
            {/* Header section inside card */}
            <div className="mb-6 space-y-1">
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-violet-500 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles size={16} />
                </div>
                <span className="text-xs font-black tracking-tight text-white uppercase font-heading">
                  Zenith Engine
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white font-heading leading-none">
                Welcome Back
              </h1>
              <p className="text-xs text-zinc-400">
                Enter your credentials to access the admin engine
              </p>
            </div>

            {/* Login form fields */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-500">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9.5 pl-9.5 pr-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs font-semibold text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
                    Secret Password
                  </label>
                  <a href="#" className="text-[10px] font-bold text-primary hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-500">
                    <Lock size={14} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9.5 pl-9.5 pr-9.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs font-semibold text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-primary focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-zinc-400">Keep me logged in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Spinner className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Sign In to Engine</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Splitter */}
            <div className="relative flex py-3.5 items-center">
              <div className="flex-grow border-t border-zinc-900"></div>
              <span className="flex-shrink mx-2 text-[8px] font-extrabold text-zinc-600 uppercase tracking-widest">
                Demo Accounts
              </span>
              <div className="flex-grow border-t border-zinc-900"></div>
            </div>

            {/* Autofill Shortcuts */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleFillDemo("admin")}
                type="button"
                className="flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900 text-[10px] font-bold text-zinc-300 transition-all cursor-pointer"
              >
                <ShieldCheck size={13} className="text-primary" />
                <span>Admin Demo</span>
              </button>
              <button
                onClick={() => handleFillDemo("staff")}
                type="button"
                className="flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900 text-[10px] font-bold text-zinc-300 transition-all cursor-pointer"
              >
                <UserCheck size={13} className="text-violet-500" />
                <span>Staff Demo</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

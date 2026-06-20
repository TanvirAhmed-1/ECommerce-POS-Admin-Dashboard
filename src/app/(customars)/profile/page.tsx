"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setUserInfo } from "@/redux/features/auth/authSlice";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/redux/features/user/userApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import Loader from "@/components/shared/Loader";
import {
  User,
  Mail,
  Phone,
  Key,
  UploadCloud,
  Trash2,
  Shield,
  Save,
  Check,
  Building,
  FileText,
  Percent,
} from "lucide-react";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth);

  // Fetch live profile details
  const { data: profileRes, isLoading: isProfileLoading, refetch } = useGetUserProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [uploadSingleImage, { isLoading: isUploading }] = useUploadSingleImageMutation();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Load backend profile data into state
  useEffect(() => {
    const userData = profileRes?.data || profileRes;
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setAvatar(userData.avatar || "");
    } else if (reduxUser) {
      setName(reduxUser.name || "");
      setEmail(reduxUser.email || "");
      setPhone("");
      setAvatar(reduxUser.avatar || "");
    }
  }, [profileRes, reduxUser]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await handleUpload(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size exceeds the 2MB limit!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading avatar image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setAvatar(res.data.url);
        toast.success("Avatar uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to upload avatar.",
        { id: toastId }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required!");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required!");
      return;
    }

    const toastId = toast.loading("Saving profile changes...");
    try {
      const payload: any = {
        name,
        email,
        phone,
        avatar,
      };

      if (password.trim()) {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.", { id: toastId });
          return;
        }
        payload.password = password;
      }

      const res = await updateProfile(payload).unwrap();
      const updatedUser = res?.data || res;

      // Update Redux state
      dispatch(
        setUserInfo({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          id: updatedUser._id || updatedUser.id,
          avatar: updatedUser.avatar,
        })
      );

      toast.success("Profile updated successfully!", { id: toastId });
      setPassword(""); // Reset password input
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to update profile.",
        { id: toastId }
      );
    }
  };

  const userData = profileRes?.data || profileRes || reduxUser;
  const userRole = userData?.role || reduxUser?.role || "admin";

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

  if (isProfileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto p-2 md:p-6 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Profile</span>
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight">
              My Profile
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your personal credentials, contact numbers, passwords, and user avatar.
            </p>
          </div>
        </div>

        {/* Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: User Profile Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card p-6 rounded-2xl border border-border bg-card flex flex-col items-center text-center space-y-4 shadow-sm relative overflow-hidden">
              {/* Top Accent Pattern */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/30 to-violet-500/20 z-0" />
              
              {/* Avatar Photo Frame */}
              <div className="relative z-10 mt-6 group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted flex items-center justify-center shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || "User Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-extrabold text-2xl">
                      {getInitials(name)}
                    </div>
                  )}
                </div>
              </div>

              {/* Identity details */}
              <div className="space-y-1 z-10">
                <h3 className="font-heading text-base font-bold text-foreground truncate max-w-[220px]">
                  {name || "Zenith User"}
                </h3>
                <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {email || "user@zenith.com"}
                </p>
              </div>

              {/* Role Badge (Read-Only) */}
              <div className="pt-2 w-full border-t border-border/60">
                <div className="flex items-center justify-between text-xs py-1.5 font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield size={13} className="text-primary" />
                    System Role
                  </span>
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {userRole?.replace("_", " ")}
                  </span>
                </div>
                {phone && (
                  <div className="flex items-center justify-between text-xs py-1.5 font-semibold text-muted-foreground border-t border-border/40">
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-muted-foreground" />
                      Contact No.
                    </span>
                    <span className="text-foreground">{phone}</span>
                  </div>
                )}
              </div>

              {/* Conditional business details if they have reseller fields */}
              {(userData?.companyName || userData?.tradeLicense) && (
                <div className="w-full pt-3 border-t border-border/60 text-left space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Building size={12} className="text-indigo-500" /> Reseller Information
                  </p>
                  
                  {userData.companyName && (
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Company</span>
                      <span className="text-foreground font-bold">{userData.companyName}</span>
                    </div>
                  )}

                  {userData.tradeLicense && (
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Trade License</span>
                      <span className="text-foreground">{userData.tradeLicense}</span>
                    </div>
                  )}

                  {userData.resellerDiscount !== undefined && (
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Discount Tier</span>
                      <span className="text-emerald-500 font-extrabold">{userData.resellerDiscount}% OFF</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Edit Profile Form Card */}
          <div className="lg:col-span-8">
            <div className="glass-card p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-foreground">Edit Account Details</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Update credentials and customize system preferences.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Avatar Drag-n-Drop / File Upload section */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Profile Avatar Image
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("avatar-file-input")?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isDragging
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                        }`}
                      >
                        <input
                          id="avatar-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {isUploading ? (
                          <div className="flex flex-col items-center justify-center gap-1 py-1">
                            <Spinner className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-[9px] font-bold text-muted-foreground">Uploading avatar...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={18} className="text-muted-foreground/60" />
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-foreground">
                                Drag & drop avatar or click to upload
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="text"
                        required
                        disabled={isUpdating}
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Email address */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="email"
                        required
                        disabled={isUpdating}
                        placeholder="john@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="tel"
                        disabled={isUpdating}
                        placeholder="e.g. 017XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password (Optional change) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      New Password (Optional)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="password"
                        disabled={isUpdating}
                        placeholder="Leave blank to keep current"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-border/40 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating || isUploading}
                    className="h-10 px-6 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <Spinner className="w-4 h-4 mr-1 animate-spin text-white" />
                    ) : (
                      <Save size={14} className="shrink-0" />
                    )}
                    <span>{isUpdating ? "Saving Changes..." : "Save Profile"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

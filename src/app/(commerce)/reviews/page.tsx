"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
} from "@/redux/features/review/reviewApi";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  MessageSquare,
  Search,
  Trash2,
  Star,
  CheckCircle,
  X,
  Eye,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

// Types
interface ReviewUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ReviewProduct {
  _id: string;
  name: string;
  thumbnail: string;
  slug: string;
}

interface ReviewData {
  _id: string;
  user: ReviewUser;
  product: ReviewProduct;
  rating: number;
  message: string;
  images: string[];
  isVerified: boolean;
  status: "active" | "hidden";
  createdAt: string;
}

// Fallback Mock Data in case backend DB has no reviews yet
const mockReviews: ReviewData[] = [
  {
    _id: "mock-r1",
    user: {
      _id: "user-1",
      name: "Alexander V.",
      email: "alexander@gmail.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop",
    },
    product: {
      _id: "prod-1",
      name: "S-Class Liquid Cooler V3",
      thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120&auto=format&fit=crop",
      slug: "s-class-liquid-cooler-v3",
    },
    rating: 5,
    message: "Excellent performance! Running it with high load and thermal controls are keeping it perfectly stable. Absolutely worth the upgrade!",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=600&auto=format&fit=crop",
    ],
    isVerified: true,
    status: "active",
    createdAt: "2026-06-24T12:00:00.000Z",
  },
  {
    _id: "mock-r2",
    user: {
      _id: "user-2",
      name: "Sarah K.",
      email: "sarah.k@gmail.com",
    },
    product: {
      _id: "prod-2",
      name: "Titanium Chassis Core",
      thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=120&auto=format&fit=crop",
      slug: "titanium-chassis-core",
    },
    rating: 4,
    message: "Matches the spec completely. The S-Class variant looks incredible and runs super clean. Shipping was fast as well.",
    images: [],
    isVerified: true,
    status: "active",
    createdAt: "2026-06-23T14:30:00.000Z",
  },
  {
    _id: "mock-r3",
    user: {
      _id: "user-3",
      name: "Tanvir Ahmed",
      email: "tanvir@gmail.com",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=80&auto=format&fit=crop",
    },
    product: {
      _id: "prod-1",
      name: "S-Class Liquid Cooler V3",
      thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120&auto=format&fit=crop",
      slug: "s-class-liquid-cooler-v3",
    },
    rating: 1,
    message: "Faulty cooling pipes. Had leak issues on arrival, had to return it. Disappointed.",
    images: [],
    isVerified: false,
    status: "hidden",
    createdAt: "2026-06-22T09:15:00.000Z",
  },
  {
    _id: "mock-r4",
    user: {
      _id: "user-4",
      name: "Aigars S.",
      email: "aigars@gmail.com",
    },
    product: {
      _id: "prod-3",
      name: "Quantum Link Processor V2",
      thumbnail: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=120&auto=format&fit=crop",
      slug: "quantum-link-processor",
    },
    rating: 5,
    message: "Extremely fast clock rate burst speeds! Highly recommended for machine learning loads.",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop",
    ],
    isVerified: true,
    status: "active",
    createdAt: "2026-06-21T18:45:00.000Z",
  },
  {
    _id: "mock-r5",
    user: {
      _id: "user-5",
      name: "Emily Watson",
      email: "emily@gmail.com",
    },
    product: {
      _id: "prod-2",
      name: "Titanium Chassis Core",
      thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=120&auto=format&fit=crop",
      slug: "titanium-chassis-core",
    },
    rating: 3,
    message: "It is decent, but case spacing is tight. Cable routing was hard.",
    images: [],
    isVerified: false,
    status: "active",
    createdAt: "2026-06-20T10:10:00.000Z",
  },
];

export default function ReviewsPage() {
  const { data: reviewRes, isLoading, refetch } = useGetAllReviewsQuery(undefined);
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [updateReviewStatus] = useUpdateReviewStatusMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "hidden">("all");
  const [activeReview, setActiveReview] = useState<ReviewData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load reviews with mock fallback
  const reviews = useMemo(() => {
    if (reviewRes && Array.isArray(reviewRes.data) && reviewRes.data.length > 0) {
      return reviewRes.data as ReviewData[];
    }
    return mockReviews;
  }, [reviewRes]);

  // Filter and search logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const matchesSearch =
        item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating = selectedRating === "all" || item.rating === selectedRating;
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchQuery, selectedRating, selectedStatus]);

  // Paginated reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReviews, currentPage]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRating, selectedStatus]);

  // Delete review handler
  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Deleting review...");
    try {
      await deleteReview(id).unwrap();
      toast.success("Review deleted successfully", { id: toastId });
      setDeleteTarget(null);
      if (activeReview?._id === id) setActiveReview(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to delete review", {
        id: toastId,
      });
    }
  };

  // Status toggle handler
  const handleStatusChange = async (id: string, currentStatus: "active" | "hidden") => {
    const newStatus = currentStatus === "active" ? "hidden" : "active";
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await updateReviewStatus({ id, status: newStatus }).unwrap();
      toast.success(`Review status updated to ${newStatus}`, { id: toastId });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update review status", {
        id: toastId,
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < rating
                ? "text-amber-500 fill-amber-500"
                : "text-zinc-300 dark:text-zinc-700"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <MessageSquare className="text-primary" /> Product Reviews Moderation
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-1">
              Moderators page: Approve or hide user comments. Default is active.
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-450">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search user email, product, or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
            </div>

            {/* Rating Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1.5 shrink-0 flex items-center gap-1">
                <SlidersHorizontal size={10} /> Rating:
              </span>
              {(["all", 5, 4, 3, 2, 1] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRating(r)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                    selectedRating === r
                      ? "bg-primary text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {r === "all" ? "All Stars" : `${r} Star${r > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e: any) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900 focus:outline-none text-zinc-700 dark:text-zinc-350"
              >
                <option value="all">All statuses</option>
                <option value="active">Active (Showing)</option>
                <option value="hidden">Hidden (Moderated)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Shadcn Table layout */}
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-105 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">No Reviews Match</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-xs">
              No matching client reviews found. Adjust filters to search other conditions.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold tracking-wider text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/40">
                    <th className="px-5 py-4 w-12 text-center">SL</th>
                    <th className="px-5 py-4 w-40">User Image</th>
                    <th className="px-5 py-4 w-52">Product Name</th>
                    <th className="px-5 py-4 w-32">Rating</th>
                    <th className="px-5 py-4 max-w-sm">Comment</th>
                    <th className="px-5 py-4 w-48">Attached Photos</th>
                    <th className="px-5 py-4 w-36 text-center">Status</th>
                    <th className="px-5 py-4 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                  {paginatedReviews.map((item, index) => {
                    const serialNo = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-zinc-55/30 dark:hover:bg-zinc-900/10 transition-colors"
                      >
                        {/* 1. SL */}
                        <td className="px-5 py-4 text-center font-bold text-zinc-400">
                          {serialNo}
                        </td>

                        {/* 2. User Image / Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {item.user?.avatar ? (
                              <img
                                src={item.user.avatar}
                                alt={item.user.name}
                                className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {item.user?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                {item.user?.name || "Anonymous User"}
                              </span>
                              <span className="text-[10px] text-zinc-400 truncate">
                                {item.user?.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Product Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.product?.thumbnail || "/placeholder.png"}
                              alt={item.product?.name}
                              className="w-8 h-8 rounded-lg object-contain bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-250 truncate">
                                {item.product?.name}
                              </span>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                {item.product?.slug || "Product Slug"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Rating */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {renderStars(item.rating)}
                            {item.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-tight">
                                <CheckCircle size={8} /> Verified
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Comment */}
                        <td className="px-5 py-4 max-w-sm">
                          <p className="line-clamp-2 text-zinc-650 dark:text-zinc-350 leading-relaxed">
                            {item.message}
                          </p>
                        </td>

                        {/* 6. Attached Photos */}
                        <td className="px-5 py-4">
                          {item.images && item.images.length > 0 ? (
                            <div className="flex items-center gap-1.5">
                              {item.images.slice(0, 3).map((img, i) => (
                                <div
                                  key={i}
                                  onClick={() => setViewingImage(img)}
                                  className="w-8 h-8 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 cursor-zoom-in bg-zinc-50 dark:bg-zinc-900 hover:scale-95 transition-transform"
                                >
                                  <img
                                    src={img}
                                    alt="attachment-thumb"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {item.images.length > 3 && (
                                <span className="text-[9px] font-black text-zinc-400 ml-1">
                                  +{item.images.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-600 text-[10px] italic">
                              No attachments
                            </span>
                          )}
                        </td>

                        {/* 7. Status Column (Interactive Switcher) */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleStatusChange(item._id, item.status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all hover:scale-98 ${
                              item.status === "active"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                                : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:text-zinc-500 dark:border-zinc-800"
                            }`}
                            title={`Click to set ${item.status === "active" ? "Hidden" : "Active"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "active"
                                  ? "bg-emerald-600 dark:bg-emerald-400 animate-pulse"
                                  : "bg-zinc-400 dark:bg-zinc-600"
                              }`}
                            />
                            {item.status === "active" ? "Active" : "Hidden"}
                          </button>
                        </td>

                        {/* 8. Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveReview(item)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                              title="Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item._id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/40 dark:bg-zinc-900/10 text-zinc-500 dark:text-zinc-450">
                <span className="text-[10px] font-bold">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of{" "}
                  {filteredReviews.length} reviews
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNo = i + 1;
                    return (
                      <button
                        key={pageNo}
                        onClick={() => setCurrentPage(pageNo)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                          currentPage === pageNo
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        }`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Review Details */}
        {activeReview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
              <div className="px-6 py-4 border-b border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                  Moderator Review View
                </h3>
                <button
                  onClick={() => setActiveReview(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Users and Product Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Customer Info
                    </span>
                    <div className="flex items-center gap-3">
                      {activeReview.user?.avatar ? (
                        <img
                          src={activeReview.user.avatar}
                          alt={activeReview.user.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                          {activeReview.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-zinc-900 dark:text-white truncate">
                          {activeReview.user?.name || "Anonymous User"}
                        </span>
                        <span className="text-[10px] text-zinc-550 dark:text-zinc-450 truncate">
                          {activeReview.user?.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Product Info
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={activeReview.product?.thumbnail || "/placeholder.png"}
                        alt={activeReview.product?.name}
                        className="w-10 h-10 rounded-lg object-contain bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-zinc-900 dark:text-white truncate">
                          {activeReview.product?.name}
                        </span>
                        <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-mono">
                          ID: {activeReview.product?._id || "Mock ID"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating & Message */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(activeReview.rating)}
                      <span className="font-bold text-zinc-900 dark:text-white text-xs">
                        {activeReview.rating} / 5
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeReview.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/35 rounded-lg uppercase tracking-wider">
                          Verified Purchase
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black border rounded-lg uppercase tracking-wider ${
                          activeReview.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                            : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-500 dark:border-zinc-800"
                        }`}
                      >
                        Status: {activeReview.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-900/10 min-h-[80px]">
                    <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">
                      {activeReview.message}
                    </p>
                  </div>
                </div>

                {/* Review Images */}
                {activeReview.images && activeReview.images.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-primary" /> Attached Images
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {activeReview.images.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setViewingImage(img)}
                          className="group relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900/30 cursor-zoom-in transition-all hover:scale-98"
                        >
                          <img
                            src={img}
                            alt={`review-attachment-${i}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
                <button
                  onClick={() => handleStatusChange(activeReview._id, activeReview.status)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border font-bold uppercase tracking-wider text-[9px] ${
                    activeReview.status === "active"
                      ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                  }`}
                >
                  {activeReview.status === "active" ? "Hide Review" : "Approve/Show Review"}
                </button>

                <button
                  onClick={() => setDeleteTarget(activeReview._id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-650 dark:text-red-400 hover:text-red-600 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-red-100 dark:border-red-900/30 font-bold uppercase tracking-wider text-[9px]"
                >
                  <Trash2 size={12} /> Delete Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto mb-2">
                <Trash2 size={20} />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Delete Review</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed">
                Are you sure you want to permanently delete this customer review? This action cannot be undone and will update the product's ratings immediately.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-55 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950 cursor-pointer transition-all active:scale-97"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-550 hover:bg-red-650 dark:bg-red-500 dark:hover:bg-red-650 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-97 flex items-center gap-1.5"
                >
                  {isDeleting ? <Spinner size="sm" className="text-white" /> : null}
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Zoom Modal */}
        {viewingImage && (
          <div
            onClick={() => setViewingImage(null)}
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/40 text-white hover:bg-black/60 rounded-full cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={viewingImage}
              alt="zoom-attachment"
              className="max-w-full max-h-[90vh] object-contain rounded-lg animate-scale-in"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

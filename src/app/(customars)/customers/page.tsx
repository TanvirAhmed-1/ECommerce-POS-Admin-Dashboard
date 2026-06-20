"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppSelector } from "@/redux/hooks";
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/redux/features/user/userApi";
import { toast } from "react-hot-toast";
import {
  Search,
  Plus,
  Users,
  Shield,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  Building,
  FileText,
  Percent,
  Key,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// ─── FALLBACK MOCK CUSTOMERS ───
const MOCK_CUSTOMERS = [
  {
    _id: "cust-1",
    name: "Rahim Islam",
    email: "rahim.islam@gmail.com",
    phone: "01712345678",
    role: "customer",
    status: "active",
    createdAt: "2026-05-10T12:00:00.000Z",
    avatar: "",
  },
  {
    _id: "cust-2",
    name: "Sarah Kabir",
    email: "sarah.kabir@outlook.com",
    phone: "01898765432",
    role: "reseller",
    status: "active",
    companyName: "Kabir Retailers Ltd",
    tradeLicense: "TR-998877",
    resellerDiscount: 15,
    createdAt: "2026-05-15T09:30:00.000Z",
    avatar: "",
  },
  {
    _id: "cust-3",
    name: "Tanvir Ahmed",
    email: "tanvir.pos@admin.com",
    phone: "01911223344",
    role: "superadmin",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    avatar: "",
  },
  {
    _id: "cust-4",
    name: "Kamal Uddin",
    email: "kamal.retail@yahoo.com",
    phone: "01555667788",
    role: "reseller",
    status: "blocked",
    companyName: "Kamal Trade",
    tradeLicense: "TR-554433",
    resellerDiscount: 10,
    createdAt: "2026-06-01T14:20:00.000Z",
    avatar: "",
  },
  {
    _id: "cust-5",
    name: "Anika Rahman",
    email: "anika.rahman@gmail.com",
    phone: "01677889900",
    role: "customer",
    status: "inactive",
    createdAt: "2026-06-11T16:40:00.000Z",
    avatar: "",
  },
  {
    _id: "cust-6",
    name: "Zahid Hasan",
    email: "zahid.hasan@gmail.com",
    phone: "01722334455",
    role: "admin",
    status: "active",
    createdAt: "2026-06-12T11:15:00.000Z",
    avatar: "",
  },
];

export default function CustomersPage() {
  // Select current logged-in role (fallback to superadmin for dev/mock access)
  const { role: currentUserRole } = useAppSelector((state) => state.auth);
  const userRole = currentUserRole || "superadmin";

  // State Management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Local state fallbacks
  const [localUsers, setLocalUsers] = useState<any[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [companyName, setCompanyName] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");
  const [resellerDiscount, setResellerDiscount] = useState<number | "">("");

  // Debouncing search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedRole, selectedStatus]);

  // Load from local storage or set fallbacks if none exist
  useEffect(() => {
    const saved = localStorage.getItem("zenith_users");
    if (saved) {
      setLocalUsers(JSON.parse(saved));
    } else {
      localStorage.setItem("zenith_users", JSON.stringify(MOCK_CUSTOMERS));
      setLocalUsers(MOCK_CUSTOMERS);
    }
  }, []);

  // API mutations & queries
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (debouncedSearchQuery.trim()) {
      params.searchTerm = debouncedSearchQuery.trim();
    }
    return params;
  }, [page, limit, debouncedSearchQuery]);

  const { data: usersRes, isLoading, refetch } = useGetAllUsersQuery(queryParams);
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Determine if using live API or fallback
  const isApiAvailable = usersRes !== undefined && usersRes?.data !== undefined;

  // Process data locally if API isn't present or falls back
  const displayData = useMemo(() => {
    if (isApiAvailable) {
      // Unpack response safely
      const rawUsers = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data?.data || [];

      // Apply client-side filters for role & status since API handles search
      return rawUsers.filter((u: any) => {
        const matchesRole = selectedRole === "All" || u.role === selectedRole;
        const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;
        return matchesRole && matchesStatus;
      });
    }

    // Client-side search + filter for fallback mock data
    return localUsers.filter((u) => {
      const matchesSearch =
        !debouncedSearchQuery.trim() ||
        u.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        u.phone.includes(debouncedSearchQuery);

      const matchesRole = selectedRole === "All" || u.role === selectedRole;
      const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [isApiAvailable, usersRes, localUsers, debouncedSearchQuery, selectedRole, selectedStatus]);

  // Pagination metrics
  const totalItems = useMemo(() => {
    if (isApiAvailable) {
      return usersRes.data?.meta?.total || displayData.length;
    }
    return displayData.length;
  }, [isApiAvailable, usersRes, displayData]);

  const totalPages = useMemo(() => {
    if (isApiAvailable) {
      return usersRes.data?.meta?.totalPage || Math.ceil(totalItems / limit);
    }
    return Math.ceil(totalItems / limit);
  }, [isApiAvailable, usersRes, totalItems, limit]);

  // Paginated display data for offline fallback
  const paginatedDisplayData = useMemo(() => {
    if (isApiAvailable) return displayData;
    const startIndex = (page - 1) * limit;
    return displayData.slice(startIndex, startIndex + limit);
  }, [isApiAvailable, displayData, page, limit]);

  // Action: Toggle Block / Unblock Status
  const handleToggleBlock = async (cust: any) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(cust._id || cust.id);
    const newStatus = cust.status === "blocked" ? "active" : "blocked";
    const toastId = toast.loading(`${newStatus === "blocked" ? "Blocking" : "Activating"} customer...`);

    try {
      if (isApiAvailable && isMongoId) {
        await updateUser({
          id: cust._id || cust.id,
          data: { status: newStatus },
        }).unwrap();
        refetch();
      } else {
        const updated = localUsers.map((u) =>
          u._id === cust._id || u.id === cust.id ? { ...u, status: newStatus } : u
        );
        setLocalUsers(updated);
        localStorage.setItem("zenith_users", JSON.stringify(updated));
      }
      toast.success(`Customer ${newStatus === "blocked" ? "blocked" : "activated"} successfully!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update status.", { id: toastId });
    }
  };

  // Action: Change User Role (Superadmin only check inside dropdown change)
  const handleRoleChange = async (cust: any, newRole: string) => {
    if (userRole !== "superadmin") {
      toast.error("Only Superadmins are allowed to modify user roles.");
      return;
    }
    if (cust.role === "superadmin") {
      toast.error("Superadmin roles cannot be modified.");
      return;
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(cust._id || cust.id);
    const toastId = toast.loading("Updating customer role...");

    try {
      if (isApiAvailable && isMongoId) {
        await updateUser({
          id: cust._id || cust.id,
          data: { role: newRole },
        }).unwrap();
        refetch();
      } else {
        const updated = localUsers.map((u) =>
          u._id === cust._id || u.id === cust.id ? { ...u, role: newRole } : u
        );
        setLocalUsers(updated);
        localStorage.setItem("zenith_users", JSON.stringify(updated));
      }
      toast.success("Role updated successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to update role.", { id: toastId });
    }
  };

  // Action: Delete Customer
  const handleDeleteCustomer = async (cust: any) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(cust._id || cust.id);
    if (!confirm(`Are you sure you want to delete ${cust.name}?`)) return;

    const toastId = toast.loading("Deleting customer...");

    try {
      if (isApiAvailable && isMongoId) {
        await deleteUser(cust._id || cust.id).unwrap();
        refetch();
      } else {
        const updated = localUsers.filter((u) => u._id !== cust._id && u.id !== cust.id);
        setLocalUsers(updated);
        localStorage.setItem("zenith_users", JSON.stringify(updated));
      }
      toast.success("Customer deleted successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to delete customer.", { id: toastId });
    }
  };

  // Action: Add Customer
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      toast.error("All fields with * are required!");
      return;
    }

    const payload: any = {
      name,
      email,
      phone,
      password,
      role,
      status: "active",
    };

    if (role === "reseller") {
      if (companyName) payload.companyName = companyName;
      if (tradeLicense) payload.tradeLicense = tradeLicense;
      if (resellerDiscount !== "") payload.resellerDiscount = Number(resellerDiscount);
    }

    const toastId = toast.loading("Adding customer...");

    try {
      if (isApiAvailable) {
        await createUser(payload).unwrap();
        refetch();
      } else {
        const newCust = {
          _id: `cust-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        };
        const updated = [newCust, ...localUsers];
        setLocalUsers(updated);
        localStorage.setItem("zenith_users", JSON.stringify(updated));
      }

      toast.success("Customer added successfully!", { id: toastId });
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      // Format Zod validations
      if (err?.data?.errorSources) {
        err.data.errorSources.forEach((src: any) => {
          toast.error(`${src.path}: ${src.message}`);
        });
        toast.dismiss(toastId);
      } else {
        toast.error(err?.data?.message || err?.message || "Failed to add customer.", { id: toastId });
      }
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("customer");
    setCompanyName("");
    setTradeLicense("");
    setResellerDiscount("");
  };

  // Render initial initials avatar
  const renderInitials = (nameStr: string) => {
    const initials = nameStr
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
        {initials}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
              <Users className="text-indigo-500" size={24} />
              Customers & Users
            </h1>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">
              Manage accounts, roles, access status, discounts, and customer details.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>

        {/* Filters and search section */}
        <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="flex items-center h-10 rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
              <Search className="text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter by Role */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase whitespace-nowrap">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="customer">Customer</option>
                <option value="reseller">Reseller</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase whitespace-nowrap">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                  <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Customer Info</th>
                  <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Phone</th>
                  <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Role</th>
                  <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Status</th>
                  <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Created Date</th>
                  <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Spinner className="w-8 h-8 text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-wider animate-pulse">Loading Customers...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedDisplayData.length > 0 ? (
                  paginatedDisplayData.map((cust: any) => {
                    const displayStatus = cust.status || "active";
                    const isBlocked = displayStatus === "blocked";

                    return (
                      <tr
                        key={cust._id || cust.id}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {cust.avatar ? (
                              <img
                                src={cust.avatar}
                                alt={cust.name}
                                className="w-9 h-9 rounded-full object-cover shadow-md border border-border"
                              />
                            ) : (
                              renderInitials(cust.name)
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate">{cust.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                                {cust.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground font-semibold">
                          {cust.phone}
                        </td>
                        <td className="p-4">
                          {/* Superadmin role changes trigger handleRoleChange */}
                          {userRole === "superadmin" && cust.role !== "superadmin" ? (
                            <select
                              value={cust.role}
                              onChange={(e) => handleRoleChange(cust, e.target.value)}
                              className="px-2.5 py-1 bg-card border border-border rounded-lg text-[10px] font-bold text-foreground focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="customer">Customer</option>
                              <option value="reseller">Reseller</option>
                              <option value="admin">Admin</option>
                              <option value="superadmin">Superadmin</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                cust.role === "superadmin"
                                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                                  : cust.role === "admin"
                                  ? "bg-purple-500/10 border-purple-500/30 text-purple-500"
                                  : cust.role === "reseller"
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500"
                                  : "bg-zinc-500/10 border-zinc-500/30 text-muted-foreground"
                              }`}
                            >
                              {cust.role}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                              displayStatus === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : displayStatus === "inactive"
                                ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400"
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground font-medium">
                          {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Customer Details */}
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="p-1.5 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/5 rounded cursor-pointer transition-colors"
                              title="View Info"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Toggle block/unblock */}
                            <button
                              onClick={() => handleToggleBlock(cust)}
                              className={`p-1.5 rounded cursor-pointer transition-colors ${
                                isBlocked
                                  ? "text-emerald-500 hover:bg-emerald-500/5 hover:text-emerald-600"
                                  : "text-rose-500 hover:bg-rose-500/5 hover:text-rose-600"
                              }`}
                              title={isBlocked ? "Unblock Customer" : "Block Customer"}
                            >
                              {isBlocked ? <UserCheck size={15} /> : <UserX size={15} />}
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteCustomer(cust)}
                              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded cursor-pointer transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No customers or users found matching the filter query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-4 border-t border-border/60 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-bold cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} items
                  </option>
                ))}
              </select>
              <span>
                of <span className="text-foreground font-bold">{totalItems}</span> users
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isCurrent = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/15"
                          : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD CUSTOMER MODAL ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-border overflow-hidden shadow-2xl animate-slide-up bg-background">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-500" size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Add New Customer</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Key size={10} /> Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:border-zinc-400 cursor-pointer"
                >
                  <option value="customer">Customer</option>
                  <option value="reseller">Reseller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Conditional Reseller Fields */}
              {role === "reseller" && (
                <div className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-4 animate-fade-in">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Building size={12} /> Reseller Company Info
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Trade License
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TR-12345"
                        value={tradeLicense}
                        onChange={(e) => setTradeLicense(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Reseller Discount (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={resellerDiscount}
                        onChange={(e) => setResellerDiscount(e.target.value !== "" ? Number(e.target.value) : "")}
                        className="w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-bold text-foreground cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 cursor-pointer transition-all"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DETAILS MODAL ─── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl animate-slide-up bg-background">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users size={14} /> Customer Profile
              </span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex flex-col items-center text-center space-y-3">
                {selectedCustomer.avatar ? (
                  <img
                    src={selectedCustomer.avatar}
                    alt={selectedCustomer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
                    {selectedCustomer.name
                      .split(" ")
                      .map((n: any) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-black text-foreground">{selectedCustomer.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCustomer.email}</p>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      selectedCustomer.role === "superadmin"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        : selectedCustomer.role === "admin"
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-500"
                        : selectedCustomer.role === "reseller"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500"
                        : "bg-zinc-500/10 border-zinc-500/30 text-muted-foreground"
                    }`}
                  >
                    {selectedCustomer.role}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                      selectedCustomer.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : selectedCustomer.status === "inactive"
                        ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400"
                    }`}
                  >
                    {selectedCustomer.status || "active"}
                  </span>
                </div>
              </div>

              {/* Detailed lists */}
              <div className="border-t border-border/40 pt-4 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground">Phone Number:</span>
                  <span className="font-bold text-foreground">{selectedCustomer.phone}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground">Joined Date:</span>
                  <span className="font-bold text-foreground">
                    {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>

                {/* Reseller conditional detailed items */}
                {selectedCustomer.role === "reseller" && (
                  <div className="bg-muted/10 border border-border/40 p-3 rounded-xl space-y-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Building size={12} /> Reseller Corporate Details
                    </span>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-semibold text-muted-foreground">Company Name:</span>
                      <span className="font-bold text-foreground">{selectedCustomer.companyName || "—"}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Trade License:</span>
                      <span className="font-bold text-foreground">{selectedCustomer.tradeLicense || "—"}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Reseller Discount:</span>
                      <span className="font-extrabold text-emerald-500">
                        {selectedCustomer.resellerDiscount ? `${selectedCustomer.resellerDiscount}%` : "0%"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl border border-border transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

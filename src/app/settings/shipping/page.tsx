"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Truck,
  MapPin,
  Search,
  Plus,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  Edit2,
  Trash2,
  ChevronRight,
  Filter,
  Check,
  Zap,
  Globe,
} from "lucide-react";
import {
  useGetDistrictsQuery,
  useGetUpazilasQuery,
  useGetShippingSettingsQuery,
  useUpdateDistrictMutation,
  useCreateDistrictMutation,
  useDeleteDistrictMutation,
  useCreateUpazilaMutation,
  useUpdateUpazilaMutation,
  useDeleteUpazilaMutation,
  useBulkUpdateChargesMutation,
  useUpdateShippingSettingsMutation,
  useSeedLocationsMutation,
} from "@/redux/features/shipping/shippingApi";
import toast from "react-hot-toast";
import SearchableSelect from "@/components/shared/SearchableSelect";

export default function ShippingLocationsPage() {
  const [activeTab, setActiveTab] = useState<"districts" | "upazilas" | "quick-rates" | "settings">("districts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedDistrictForUpazilas, setSelectedDistrictForUpazilas] = useState("Dhaka");
  const [upazilaSearch, setUpazilaSearch] = useState("");

  // Queries
  const { data: districtsRes, isLoading: isLoadingDistricts, refetch: refetchDistricts } = useGetDistrictsQuery({});
  const { data: upazilasRes, isLoading: isLoadingUpazilas, refetch: refetchUpazilas } = useGetUpazilasQuery({
    district: selectedDistrictForUpazilas,
  });
  const { data: settingsRes, isLoading: isLoadingSettings, refetch: refetchSettings } = useGetShippingSettingsQuery({});

  // Mutations
  const [updateDistrict, { isLoading: isUpdatingDistrict }] = useUpdateDistrictMutation();
  const [createDistrict, { isLoading: isCreatingDistrict }] = useCreateDistrictMutation();
  const [deleteDistrict] = useDeleteDistrictMutation();
  const [createUpazila, { isLoading: isCreatingUpazila }] = useCreateUpazilaMutation();
  const [updateUpazila] = useUpdateUpazilaMutation();
  const [deleteUpazila] = useDeleteUpazilaMutation();
  const [bulkUpdateCharges, { isLoading: isBulkUpdating }] = useBulkUpdateChargesMutation();
  const [updateShippingSettings, { isLoading: isUpdatingSettings }] = useUpdateShippingSettingsMutation();
  const [seedLocations, { isLoading: isSeeding }] = useSeedLocationsMutation();

  // Local state for Quick Rates form
  const [quickRates, setQuickRates] = useState({
    insideDhakaStandard: 70,
    insideDhakaExpress: 120,
    outsideDhakaStandard: 130,
    outsideDhakaExpress: 180,
  });

  // Local state for editing inline district
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [inlineDistrictForm, setInlineDistrictForm] = useState({
    deliveryCharge: 0,
    expressDeliveryCharge: 0,
    estimatedDeliveryDays: "",
  });

  // Modal states
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [newDistrictForm, setNewDistrictForm] = useState({
    name: "",
    bnName: "",
    division: "Dhaka",
    deliveryCharge: 130,
    expressDeliveryCharge: 180,
    estimatedDeliveryDays: "2-4 Days",
    isInsideDhaka: false,
  });

  const [showAddUpazilaModal, setShowAddUpazilaModal] = useState(false);
  const [newUpazilaForm, setNewUpazilaForm] = useState({
    name: "",
    bnName: "",
    district: "Dhaka",
  });

  const [showSeedConfirmModal, setShowSeedConfirmModal] = useState(false);

  const districts: any[] = districtsRes?.data || [];
  const upazilas: any[] = upazilasRes?.data || [];
  const shippingSettings: any = settingsRes?.data || {};

  // Sync quick rates with fetched settings on initial load
  useEffect(() => {
    if (settingsRes?.data) {
      setQuickRates((prev) => {
        const next = {
          insideDhakaStandard: settingsRes.data.insideDhakaDeliveryCharge ?? 70,
          insideDhakaExpress: settingsRes.data.insideDhakaExpressCharge ?? 120,
          outsideDhakaStandard: settingsRes.data.outsideDhakaDeliveryCharge ?? 130,
          outsideDhakaExpress: settingsRes.data.outsideDhakaExpressCharge ?? 180,
        };
        if (
          prev.insideDhakaStandard === next.insideDhakaStandard &&
          prev.insideDhakaExpress === next.insideDhakaExpress &&
          prev.outsideDhakaStandard === next.outsideDhakaStandard &&
          prev.outsideDhakaExpress === next.outsideDhakaExpress
        ) {
          return prev;
        }
        return next;
      });
    }
  }, [
    settingsRes?.data?.insideDhakaDeliveryCharge,
    settingsRes?.data?.insideDhakaExpressCharge,
    settingsRes?.data?.outsideDhakaDeliveryCharge,
    settingsRes?.data?.outsideDhakaExpressCharge,
  ]);

  // Unique divisions from districts
  const divisions = useMemo(() => {
    const set = new Set<string>();
    districts.forEach((d) => {
      if (d.division) set.add(d.division);
    });
    return Array.from(set);
  }, [districts]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const matchesSearch =
        searchQuery === "" ||
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bnName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        selectedDivision === "all" || d.division?.toLowerCase() === selectedDivision.toLowerCase();

      return matchesSearch && matchesDivision;
    });
  }, [districts, searchQuery, selectedDivision]);

  // Filtered upazilas
  const filteredUpazilas = useMemo(() => {
    return upazilas.filter((u) => {
      if (!upazilaSearch) return true;
      return (
        u.name?.toLowerCase().includes(upazilaSearch.toLowerCase()) ||
        u.bnName?.toLowerCase().includes(upazilaSearch.toLowerCase())
      );
    });
  }, [upazilas, upazilaSearch]);

  // Handler: Seed Bangladesh Data
  const handleSeedBangladeshData = async () => {
    const toastId = toast.loading("Seeding Bangladesh divisions, 64 districts & upazilas...");
    try {
      await seedLocations(undefined).unwrap();
      toast.success("All Bangladesh Geo data seeded successfully!", { id: toastId });
      setShowSeedConfirmModal(false);
      refetchDistricts();
      refetchUpazilas();
      refetchSettings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to seed locations.", { id: toastId });
    }
  };

  // Handler: Apply Quick Rates
  const handleApplyQuickRates = async () => {
    const toastId = toast.loading("Updating delivery charges across all districts...");
    try {
      // 1. Update settings
      await updateShippingSettings({
        insideDhakaDeliveryCharge: Number(quickRates.insideDhakaStandard),
        insideDhakaExpressCharge: Number(quickRates.insideDhakaExpress),
        outsideDhakaDeliveryCharge: Number(quickRates.outsideDhakaStandard),
        outsideDhakaExpressCharge: Number(quickRates.outsideDhakaExpress),
      }).unwrap();

      // 2. Bulk update inside dhaka districts
      await bulkUpdateCharges({
        scope: "inside_dhaka",
        deliveryCharge: Number(quickRates.insideDhakaStandard),
        expressDeliveryCharge: Number(quickRates.insideDhakaExpress),
      }).unwrap();

      // 3. Bulk update outside dhaka districts
      await bulkUpdateCharges({
        scope: "outside_dhaka",
        deliveryCharge: Number(quickRates.outsideDhakaStandard),
        expressDeliveryCharge: Number(quickRates.outsideDhakaExpress),
      }).unwrap();

      toast.success("Delivery rates updated successfully across all 64 districts!", { id: toastId });
      refetchDistricts();
      refetchSettings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update rates.", { id: toastId });
    }
  };

  // Handler: Start inline editing district
  const handleStartEditDistrict = (district: any) => {
    setEditingDistrictId(district._id);
    setInlineDistrictForm({
      deliveryCharge: district.deliveryCharge || 0,
      expressDeliveryCharge: district.expressDeliveryCharge || 0,
      estimatedDeliveryDays: district.estimatedDeliveryDays || "2-4 Days",
    });
  };

  // Handler: Save inline edited district
  const handleSaveDistrict = async (id: string) => {
    try {
      await updateDistrict({
        id,
        data: {
          deliveryCharge: Number(inlineDistrictForm.deliveryCharge),
          expressDeliveryCharge: Number(inlineDistrictForm.expressDeliveryCharge),
          estimatedDeliveryDays: inlineDistrictForm.estimatedDeliveryDays,
        },
      }).unwrap();
      toast.success("District delivery charge updated!");
      setEditingDistrictId(null);
      refetchDistricts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update district.");
    }
  };

  // Handler: Toggle district active status
  const handleToggleDistrictStatus = async (district: any) => {
    try {
      await updateDistrict({
        id: district._id,
        data: { isActive: !district.isActive },
      }).unwrap();
      toast.success(`${district.name} ${!district.isActive ? "activated" : "deactivated"}`);
      refetchDistricts();
    } catch (err: any) {
      toast.error("Failed to toggle status");
    }
  };

  // Handler: Create District
  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDistrict(newDistrictForm).unwrap();
      toast.success(`District ${newDistrictForm.name} created successfully!`);
      setShowAddDistrictModal(false);
      setNewDistrictForm({
        name: "",
        bnName: "",
        division: "Dhaka",
        deliveryCharge: 130,
        expressDeliveryCharge: 180,
        estimatedDeliveryDays: "2-4 Days",
        isInsideDhaka: false,
      });
      refetchDistricts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create district.");
    }
  };

  // Handler: Delete District
  const handleDeleteDistrict = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove associated upazilas.`)) return;
    try {
      await deleteDistrict(id).unwrap();
      toast.success(`District ${name} deleted.`);
      refetchDistricts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete district.");
    }
  };

  // Handler: Create Upazila
  const handleCreateUpazila = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUpazila({
        name: newUpazilaForm.name,
        bnName: newUpazilaForm.bnName,
        district: selectedDistrictForUpazilas,
      }).unwrap();
      toast.success(`Upazila ${newUpazilaForm.name} added to ${selectedDistrictForUpazilas}!`);
      setShowAddUpazilaModal(false);
      setNewUpazilaForm({ name: "", bnName: "", district: selectedDistrictForUpazilas });
      refetchUpazilas();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add upazila.");
    }
  };

  // Handler: Delete Upazila
  const handleDeleteUpazila = async (id: string, name: string) => {
    if (!confirm(`Delete upazila/area "${name}"?`)) return;
    try {
      await deleteUpazila(id).unwrap();
      toast.success(`Upazila "${name}" deleted.`);
      refetchUpazilas();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete upazila.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span>Settings</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Shipping & Locations</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Truck size={20} />
              </div>
              Bangladesh Delivery & Location Management
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Manage Bangladesh 64 districts, upazilas/areas, and automatic district-based shipping calculations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowSeedConfirmModal(true)}
              disabled={isSeeding}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSeeding ? "animate-spin" : ""} />
              <span>{isSeeding ? "Seeding BD Data..." : "Re-seed / Reset BD Data"}</span>
            </button>

            <button
              onClick={() => setShowAddDistrictModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              <span>Add District</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Districts</p>
              <h4 className="text-xl font-black text-foreground">{districts.length || "64"} Districts</h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">8 Administrative Divisions</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Building size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Inside Dhaka Rate</p>
              <h4 className="text-xl font-black text-foreground">
                ৳{shippingSettings?.insideDhakaDeliveryCharge || 70}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (Exp: ৳{shippingSettings?.insideDhakaExpressCharge || 120})
                </span>
              </h4>
              <p className="text-[10px] text-muted-foreground">Standard 1-2 Days Delivery</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Outside Dhaka Rate</p>
              <h4 className="text-xl font-black text-foreground">
                ৳{shippingSettings?.outsideDhakaDeliveryCharge || 130}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (Exp: ৳{shippingSettings?.outsideDhakaExpressCharge || 180})
                </span>
              </h4>
              <p className="text-[10px] text-muted-foreground">Standard 2-4 Days Delivery</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Metropolitan & Areas</p>
              <h4 className="text-xl font-black text-foreground">495+ Upazilas</h4>
              <p className="text-[10px] text-muted-foreground">Covering All Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("districts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "districts"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Globe size={15} />
            <span>64 Districts & Delivery Charges</span>
            <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-primary-foreground/20">
              {districts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("quick-rates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "quick-rates"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Zap size={15} />
            <span>Quick Rates Configurator</span>
          </button>

          <button
            onClick={() => setActiveTab("upazilas")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "upazilas"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Layers size={15} />
            <span>Upazila & Area Explorer</span>
          </button>
        </div>

        {/* TAB 1: 64 DISTRICTS MANAGEMENT TABLE */}
        {activeTab === "districts" && (
          <div className="space-y-4">
            {/* Search and Filters Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border">
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
                <div className="relative w-full">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search district by English or Bengali name (e.g. Dhaka, চট্টগ্রাম)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-72">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold shrink-0">
                  <Filter size={14} />
                  <span>Division:</span>
                </div>
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    placeholder="All Divisions"
                    searchPlaceholder="Filter division..."
                    value={selectedDivision}
                    onChange={(val) => setSelectedDivision(val)}
                    triggerClassName="h-9 text-xs"
                    options={[
                      { value: "all", label: `All Divisions (${divisions.length})` },
                      ...divisions.map((div) => ({
                        value: div,
                        label: `${div} Division`,
                      })),
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Districts Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">District Name</th>
                      <th className="py-3 px-4">Division</th>
                      <th className="py-3 px-4">Zone Type</th>
                      <th className="py-3 px-4">Standard Delivery Charge (৳)</th>
                      <th className="py-3 px-4">Express Delivery (৳)</th>
                      <th className="py-3 px-4">Est. Delivery</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {isLoadingDistricts ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p>Loading Bangladesh districts...</p>
                        </td>
                      </tr>
                    ) : filteredDistricts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <p className="font-semibold">No districts found matching your filter.</p>
                          <button
                            onClick={() => setShowSeedConfirmModal(true)}
                            className="mt-3 px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-white cursor-pointer"
                          >
                            Click to Seed All 64 Districts
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredDistricts.map((district) => {
                        const isEditing = editingDistrictId === district._id;

                        return (
                          <tr key={district._id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                  {district.name}
                                  {district.isInsideDhaka && (
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                      Capital
                                    </span>
                                  )}
                                </span>
                                <span className="text-muted-foreground text-[11px]">{district.bnName}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-semibold">
                                {district.division}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  district.isInsideDhaka
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {district.isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"}
                              </span>
                            </td>

                            {/* Standard Delivery Charge Column */}
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground font-bold">৳</span>
                                  <input
                                    type="number"
                                    value={inlineDistrictForm.deliveryCharge}
                                    onChange={(e) =>
                                      setInlineDistrictForm({
                                        ...inlineDistrictForm,
                                        deliveryCharge: Number(e.target.value),
                                      })
                                    }
                                    className="w-20 p-1.5 text-xs rounded-lg border border-primary bg-background font-bold text-foreground focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <span className="font-black text-foreground text-sm">৳{district.deliveryCharge}</span>
                              )}
                            </td>

                            {/* Express Delivery Charge Column */}
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground font-bold">৳</span>
                                  <input
                                    type="number"
                                    value={inlineDistrictForm.expressDeliveryCharge}
                                    onChange={(e) =>
                                      setInlineDistrictForm({
                                        ...inlineDistrictForm,
                                        expressDeliveryCharge: Number(e.target.value),
                                      })
                                    }
                                    className="w-20 p-1.5 text-xs rounded-lg border border-primary bg-background font-bold text-foreground focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <span className="font-bold text-muted-foreground">
                                  ৳{district.expressDeliveryCharge || district.deliveryCharge + 50}
                                </span>
                              )}
                            </td>

                            {/* Estimated Days Column */}
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={inlineDistrictForm.estimatedDeliveryDays}
                                  onChange={(e) =>
                                    setInlineDistrictForm({
                                      ...inlineDistrictForm,
                                      estimatedDeliveryDays: e.target.value,
                                    })
                                  }
                                  className="w-24 p-1.5 text-xs rounded-lg border border-primary bg-background text-foreground focus:outline-none"
                                />
                              ) : (
                                <span className="text-muted-foreground text-[11px]">
                                  {district.estimatedDeliveryDays || "2-4 Days"}
                                </span>
                              )}
                            </td>

                            {/* Active Toggle */}
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleDistrictStatus(district)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                  district.isActive
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                                }`}
                              >
                                {district.isActive ? "Active" : "Disabled"}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDistrict(district._id)}
                                      disabled={isUpdatingDistrict}
                                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                                      title="Save"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingDistrictId(null)}
                                      className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedDistrictForUpazilas(district.name);
                                        setActiveTab("upazilas");
                                      }}
                                      className="p-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer flex items-center gap-1"
                                      title="View Upazilas"
                                    >
                                      <Layers size={13} />
                                      <span className="hidden sm:inline">Upazilas</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleStartEditDistrict(district)}
                                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                                      title="Edit Delivery Charge"
                                    >
                                      <Edit2 size={13} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDistrict(district._id, district.name)}
                                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                      title="Delete District"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUICK RATES CONFIGURATOR */}
        {activeTab === "quick-rates" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-5">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Zap className="text-amber-500" size={20} />
                  Bulk Delivery Charge Configurator
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Instantly set standardized delivery charges for Inside Dhaka and all 63 Outside Dhaka districts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Inside Dhaka Box */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="text-blue-600 dark:text-blue-400" size={16} />
                    <span className="font-bold text-sm text-foreground">Inside Dhaka Delivery</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Standard Rate (BDT ৳)
                    </label>
                    <input
                      type="number"
                      value={quickRates.insideDhakaStandard}
                      onChange={(e) =>
                        setQuickRates({ ...quickRates, insideDhakaStandard: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Express / Same Day Rate (BDT ৳)
                    </label>
                    <input
                      type="number"
                      value={quickRates.insideDhakaExpress}
                      onChange={(e) =>
                        setQuickRates({ ...quickRates, insideDhakaExpress: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Outside Dhaka Box */}
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="text-purple-600 dark:text-purple-400" size={16} />
                    <span className="font-bold text-sm text-foreground">Outside Dhaka (63 Districts)</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Standard Rate (BDT ৳)
                    </label>
                    <input
                      type="number"
                      value={quickRates.outsideDhakaStandard}
                      onChange={(e) =>
                        setQuickRates({ ...quickRates, outsideDhakaStandard: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Express Rate (BDT ৳)
                    </label>
                    <input
                      type="number"
                      value={quickRates.outsideDhakaExpress}
                      onChange={(e) =>
                        setQuickRates({ ...quickRates, outsideDhakaExpress: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyQuickRates}
                  disabled={isBulkUpdating || isUpdatingSettings}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{isBulkUpdating ? "Applying to All 64 Districts..." : "Apply Rates to All Districts"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPAZILA & AREA EXPLORER */}
        {activeTab === "upazilas" && (
          <div className="space-y-4">
            {/* District Selector & Upazila search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                  Select District:
                </span>
                <div className="w-full sm:w-72">
                  <SearchableSelect
                    placeholder="Select District"
                    searchPlaceholder="Search district (e.g. Dhaka, ঢাকা)..."
                    value={selectedDistrictForUpazilas}
                    onChange={(val) => setSelectedDistrictForUpazilas(val)}
                    triggerClassName="h-10 text-xs font-bold bg-muted/30"
                    options={districts.map((d) => ({
                      value: d.name,
                      label: d.name,
                      bnLabel: d.bnName,
                      subLabel: `${d.division} Division`,
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search area in ${selectedDistrictForUpazilas}...`}
                    value={upazilaSearch}
                    onChange={(e) => setUpazilaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUpazilaModal(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Area</span>
                </button>
              </div>
            </div>

            {/* Upazilas Grid */}
            <div className="bg-card p-5 rounded-2xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span>Upazilas & Metropolitan Areas in {selectedDistrictForUpazilas}</span>
                </h4>
                <span className="text-xs text-muted-foreground font-semibold">
                  {filteredUpazilas.length} Areas Listed
                </span>
              </div>

              {isLoadingUpazilas ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p>Loading areas for {selectedDistrictForUpazilas}...</p>
                </div>
              ) : filteredUpazilas.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                  <p className="text-xs">No upazilas/areas recorded for {selectedDistrictForUpazilas} yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddUpazilaModal(true)}
                    className="mt-3 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-primary text-white cursor-pointer"
                  >
                    Add First Area
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredUpazilas.map((upz) => (
                    <div
                      key={upz._id}
                      className="p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">{upz.name}</span>
                        <span className="text-[11px] text-muted-foreground">{upz.bnName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUpazila(upz._id, upz.name)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 1: ADD DISTRICT */}
        {showAddDistrictModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground">Add Custom District</h3>
                <button
                  onClick={() => setShowAddDistrictModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDistrict} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    District Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDistrictForm.name}
                    onChange={(e) => setNewDistrictForm({ ...newDistrictForm, name: e.target.value })}
                    placeholder="e.g. Dhaka"
                    className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    District Name (Bengali) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDistrictForm.bnName}
                    onChange={(e) => setNewDistrictForm({ ...newDistrictForm, bnName: e.target.value })}
                    placeholder="e.g. ঢাকা"
                    className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <SearchableSelect
                    label="Division"
                    placeholder="Select Division"
                    searchPlaceholder="Search division..."
                    value={newDistrictForm.division}
                    onChange={(val) => setNewDistrictForm({ ...newDistrictForm, division: val })}
                    options={divisions.map((d) => ({
                      value: d,
                      label: `${d} Division`,
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Standard Rate (৳)
                    </label>
                    <input
                      type="number"
                      required
                      value={newDistrictForm.deliveryCharge}
                      onChange={(e) =>
                        setNewDistrictForm({ ...newDistrictForm, deliveryCharge: Number(e.target.value) })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Express Rate (৳)
                    </label>
                    <input
                      type="number"
                      required
                      value={newDistrictForm.expressDeliveryCharge}
                      onChange={(e) =>
                        setNewDistrictForm({ ...newDistrictForm, expressDeliveryCharge: Number(e.target.value) })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isInsideDhakaCheck"
                    checked={newDistrictForm.isInsideDhaka}
                    onChange={(e) =>
                      setNewDistrictForm({ ...newDistrictForm, isInsideDhaka: e.target.checked })
                    }
                    className="accent-primary cursor-pointer"
                  />
                  <label htmlFor="isInsideDhakaCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                    Is inside Dhaka Capital Metropolitan zone
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDistrictModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-muted text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingDistrict}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingDistrict ? "Adding..." : "Add District"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD UPAZILA */}
        {showAddUpazilaModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground">
                  Add Area to {selectedDistrictForUpazilas}
                </h3>
                <button
                  onClick={() => setShowAddUpazilaModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUpazila} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Upazila / Area Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUpazilaForm.name}
                    onChange={(e) => setNewUpazilaForm({ ...newUpazilaForm, name: e.target.value })}
                    placeholder="e.g. Gulshan / Savar"
                    className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Upazila / Area Name (Bengali) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUpazilaForm.bnName}
                    onChange={(e) => setNewUpazilaForm({ ...newUpazilaForm, bnName: e.target.value })}
                    placeholder="e.g. গুলশান / সাভার"
                    className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUpazilaModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-muted text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUpazila}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingUpazila ? "Saving..." : "Save Area"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CONFIRM SEED BANGLADESH DATA */}
        {showSeedConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertCircle size={28} />
                <h3 className="font-black text-base text-foreground">Seed Bangladesh Geo Data</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                This operation will automatically populate or restore all <strong>8 Divisions</strong>,{" "}
                <strong>64 Districts</strong>, and <strong>495+ Upazilas/Areas</strong> from the Bangladesh
                GeoJSON repository into MongoDB with standard delivery rates.
              </p>

              <div className="p-3 bg-muted/50 rounded-xl text-[11px] text-muted-foreground space-y-1">
                <p>• Inside Dhaka default: ৳70 Standard / ৳120 Express</p>
                <p>• Outside Dhaka default: ৳130 Standard / ৳180 Express</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSeedConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-muted text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSeedBangladeshData}
                  disabled={isSeeding}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {isSeeding ? "Seeding..." : "Proceed & Seed Data"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { baseApi } from "@/redux/api/baseApi";

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistricts: builder.query({
      query: (params) => ({
        url: "/shipping/districts",
        method: "GET",
        params,
      }),
      providesTags: ["Shipping"],
    }),

    getUpazilas: builder.query({
      query: (params) => ({
        url: "/shipping/upazilas",
        method: "GET",
        params,
      }),
      providesTags: ["Shipping"],
    }),

    getShippingSettings: builder.query({
      query: () => ({
        url: "/shipping/settings",
        method: "GET",
      }),
      providesTags: ["Shipping"],
    }),

    updateDistrict: builder.mutation({
      query: ({ id, data }) => ({
        url: `/shipping/districts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    createDistrict: builder.mutation({
      query: (data) => ({
        url: "/shipping/districts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteDistrict: builder.mutation({
      query: (id) => ({
        url: `/shipping/districts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    createUpazila: builder.mutation({
      query: (data) => ({
        url: "/shipping/upazilas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateUpazila: builder.mutation({
      query: ({ id, data }) => ({
        url: `/shipping/upazilas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteUpazila: builder.mutation({
      query: (id) => ({
        url: `/shipping/upazilas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    bulkUpdateCharges: builder.mutation({
      query: (data) => ({
        url: "/shipping/bulk-charges",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateShippingSettings: builder.mutation({
      query: (data) => ({
        url: "/shipping/settings",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    seedLocations: builder.mutation({
      query: () => ({
        url: "/shipping/seed",
        method: "POST",
      }),
      invalidatesTags: ["Shipping"],
    }),
  }),
});

export const {
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
} = shippingApi;

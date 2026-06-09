import { baseApi } from "@/redux/api/baseApi";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllStaff: builder.query({
      query: (params) => ({
        url: "/staffs",
        params,
      }),
      providesTags: ["Staff"],
    }),
    getSingleStaff: builder.query({
      query: (id) => `/service-types/${id}`,
      providesTags: ["ServiceType"],
    }),
    createStaffs: builder.mutation({
      query: (data) => ({
        url: "/staffs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),
    updateStaff: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-staff/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),
    changePassword: builder.mutation({
      query: ({ id, data }) => ({
        url: `/change-password/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),
    updateStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/staff-status/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/delete-staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetAllStaffQuery,
  useGetSingleStaffQuery,
  useCreateStaffsMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useChangePasswordMutation,
  useUpdateStatusMutation,
} = staffApi;

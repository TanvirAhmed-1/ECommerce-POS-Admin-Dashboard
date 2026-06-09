import { baseApi } from "@/redux/api/baseApi";

export const serviceTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServiceTypes: builder.query({
      query: (params) => ({
        url: "/service-types",
        params,
      }),
      providesTags: ["ServiceType"],
    }),
    createServiceType: builder.mutation({
      query: (data) => ({
        url: "/service-types",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ServiceType"],
    }),
    updateServiceType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-service-type/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ServiceType"],
    }),
    deleteServiceType: builder.mutation({
      query: (id) => ({
        url: `/delete-service-type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceType"],
    }),
  }),
});

export const {
  useGetServiceTypesQuery,
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useDeleteServiceTypeMutation,
} = serviceTypeApi;

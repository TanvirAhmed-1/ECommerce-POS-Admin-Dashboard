import { baseApi } from "@/redux/api/baseApi";

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllServices: builder.query({
      query: (params) => ({
        url: "/services",
        params,
      }),
      providesTags: ["Service"],
    }),
    getSingeService: builder.query({
      query: (id) => `/service/${id}`,
      providesTags: ["Service"],
    }),
    ServiceUsed: builder.mutation({
      query: (data) => ({
        url: "/use-service",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
    createServices: builder.mutation({
      query: (data) => ({
        url: "/services",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
    updateService: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-service/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/delete-service/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});

export const {
  useGetAllServicesQuery,
  useGetSingeServiceQuery,
  useCreateServicesMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useServiceUsedMutation,
} = serviceApi;

import { baseApi } from "@/redux/api/baseApi";

export const counterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCounters: builder.query({
      query: (params) => ({
        url: "/counters",
        params,
      }),
      providesTags: ["Counter"],
    }),
    getSingeCounters: builder.query({
      query: (id) => `/counter/${id}`,
      providesTags: ["Counter"],
    }),
    createCounters: builder.mutation({
      query: (data) => ({
        url: "/counters",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Counter"],
    }),
    updateCounters: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-counter/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Counter"],
    }),
    updateCountersStatus: builder.mutation({
      query: (id) => ({
        url: `/counter-status/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Counter"],
    }),
    deleteCounters: builder.mutation({
      query: (id) => ({
        url: `/delete-counter/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Counter"],
    }),
  }),
});

export const {
  useGetCountersQuery,
  useGetSingeCountersQuery,
  useCreateCountersMutation,
  useUpdateCountersMutation,
  useDeleteCountersMutation,
  useUpdateCountersStatusMutation,
} = counterApi;

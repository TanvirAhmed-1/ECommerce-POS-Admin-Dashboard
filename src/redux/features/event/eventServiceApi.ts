import { baseApi } from "../../api/baseApi";

export const eventServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventServices: builder.query({
      query: (params) => ({
        url: "/event-quotas",
        method: "GET",
        params,
      }),
      providesTags: ["Quotas"],
    }),
    createEventService: builder.mutation({
      query: (data) => ({
        url: "/event-quotas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Quotas"],
    }),
    updateEventService: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-event-quota/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Quotas"],
    }),
    deleteEventService: builder.mutation({
      query: (id) => ({
        url: `/delete-event-quota/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quotas"],
    }),
  }),
});

export const {
  useGetEventServicesQuery,
  useCreateEventServiceMutation,
  useUpdateEventServiceMutation,
  useDeleteEventServiceMutation,
} = eventServiceApi;

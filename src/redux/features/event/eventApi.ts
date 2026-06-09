import { baseApi } from "@/redux/api/baseApi";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: "/events",
        method: "GET",
        params,
      }),
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/events",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    getSingleEventsQuery: builder.query({
      query: (id) => ({
        url: `/event-quotas/${id}`,
        method: "GET",
      }),
      providesTags: ["Events"],
    }),

    getAllEventsUser: builder.query({
      query: (params) => ({
        url: `/all-event-users`,
        method: "GET",
        params,
      }),
      providesTags: ["Events"],
    }),

    getSingleEventsUser: builder.query({
      query: (id) => ({
        url: `/event-users/${id}`,
        method: "GET",
      }),
      providesTags: ["Events"],
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),

    deleteEventUser: builder.mutation({
      query: (data) => ({
        url: `/delete-event-user`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    getEventAnalytics: builder.query({
      query: (params) => ({
        url: `/event-analytics`,
        method: "GET",
        params,
      }),
      providesTags: ["Events"],
    }),
    getSingleEventAnalytics: builder.query({
      query: ({ id, params }) => ({
        url: `/single-event-analytics/${id}`,
        method: "GET",
        params,
      }),
      providesTags: ["Events"],
    }),

    updateEventStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-event-status/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/event/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});
export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useGetSingleEventsQueryQuery,
  useDeleteEventMutation,
  useUpdateEventMutation,
  useGetSingleEventsUserQuery,
  useGetAllEventsUserQuery,
  useDeleteEventUserMutation,
  useGetEventAnalyticsQuery,
  useGetSingleEventAnalyticsQuery,
  useUpdateEventStatusMutation,
} = eventApi;

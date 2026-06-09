import { baseApi } from "@/redux/api/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: (params) => ({
        url: "/overview",
        params,
      }),
      providesTags: ["Transaction", "User", "Card"],
    }),
    getDashboardAnalytics: builder.query({
      query: (params) => ({
        url: "/dashboard/analytics",
        params,
      }),
      providesTags: ["Transaction", "User", "Card"],
    }),
  }),
});

export const { useGetOverviewQuery, useGetDashboardAnalyticsQuery } = dashboardApi;

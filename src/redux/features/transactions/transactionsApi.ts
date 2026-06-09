import { baseApi } from "@/redux/api/baseApi";

export const transaction = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: (params) => ({
        url: "/transactions",
        params,
      }),
      providesTags: ["Transaction"],
    }),
    getCounterWiseSales: builder.query({
      query: (params) => ({
        url: "/counter-wise-sales",
        params,
      }),
      providesTags: ["Transaction"],
    }),

    topUpTransactions: builder.mutation({
      query: (data) => ({
        url: "/topup-transaction",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transaction", "User"],
    }),

    getServiceSalesReport: builder.query({
      query: (params) => ({
        url: "/service-sales-report",
        params,
      }),
      providesTags: ["Transaction"],

    }),

    getDailyWiseSales: builder.query({
      query: (params) => ({
        url: "/daily-ledger",
        params,
      }),
      providesTags: ["Transaction"],
    }),

    getServiceSummaryReport: builder.query({
      query: (params) => ({
        url: "/service-summary-report",
        params,
      }),
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetCounterWiseSalesQuery,
  useGetDailyWiseSalesQuery,
  useTopUpTransactionsMutation,
  useGetServiceSalesReportQuery,
  useGetServiceSummaryReportQuery,
} = transaction;

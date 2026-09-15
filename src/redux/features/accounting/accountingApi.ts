import { baseApi } from "@/redux/api/baseApi";

export const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountingSummary: builder.query({
      query: (params) => ({
        url: "/accounting/summary",
        params,
      }),
      providesTags: ["Accounting", "Transaction", "Payment"],
    }),

    getAllTransactions: builder.query({
      query: (params) => ({
        url: "/accounting/transactions",
        params,
      }),
      providesTags: ["Accounting"],
    }),
    createTransaction: builder.mutation({
      query: (data) => ({
        url: "/accounting/transaction",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Accounting"],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, data }) => ({
        url: `/accounting/transaction/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Accounting"],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/accounting/transaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounting"],
    }),
  }),
});

export const {
  useGetAccountingSummaryQuery,
  useGetAllTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = accountingApi;

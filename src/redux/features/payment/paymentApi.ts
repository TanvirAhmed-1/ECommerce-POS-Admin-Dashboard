import { baseApi } from "@/redux/api/baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayments: builder.query({
      query: (params) => ({
        url: "/payments",
        params,
      }),
      providesTags: ["Payment"],
    }),
    getSinglePayment: builder.query({
      query: (id) => `/payments/${id}`,
      providesTags: ["Payment"],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useGetAllPaymentsQuery,
  useGetSinglePaymentQuery,
  useUpdatePaymentStatusMutation,
  useDeletePaymentMutation,
} = paymentApi;

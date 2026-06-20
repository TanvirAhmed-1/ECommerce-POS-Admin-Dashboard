import { baseApi } from "@/redux/api/baseApi";

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllInvoices: builder.query({
      query: (params) => ({
        url: "/invoice/all-invoices",
        params,
      }),
      providesTags: ["Transaction"],
    }),
    getInvoiceById: builder.query({
      query: (id: string) => `/invoice/${id}`,
      providesTags: ["Transaction"],
    }),
    getInvoiceByOrderId: builder.query({
      query: (orderId: string) => `/invoice/order/${orderId}`,
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetAllInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoiceByOrderIdQuery,
} = invoiceApi;

import { baseApi } from "@/redux/api/baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: (params) => ({
        url: "/all-orders",
        params,
      }),
      providesTags: ["Transaction"],
    }),
    getMyOrders: builder.query({
      query: (params) => ({
        url: "/my-orders",
        params,
      }),
      providesTags: ["Transaction"],
    }),
    getSingleOrder: builder.query({
      query: (id) => `/order/${id}`,
      providesTags: ["Transaction"],
    }),
    checkoutOrder: builder.mutation({
      query: (data) => ({
        url: "/checkout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transaction", "Product", "Variant", "Payment"],
    }),
    createAdminOrder: builder.mutation({
      query: (data) => ({
        url: "/create-admin-order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transaction", "Product", "Variant", "Payment"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status, paymentStatus }) => ({
        url: `/update-status/${id}`,
        method: "PATCH",
        body: { status, paymentStatus },
      }),
      invalidatesTags: ["Transaction", "Product", "Variant", "Payment"],
    }),
    updateAdminOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/update-order/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Transaction", "Product", "Variant", "Payment"],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/delete-order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transaction", "Product", "Variant", "Payment"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetMyOrdersQuery,
  useGetSingleOrderQuery,
  useCheckoutOrderMutation,
  useCreateAdminOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateAdminOrderMutation,
  useDeleteOrderMutation,
} = orderApi;


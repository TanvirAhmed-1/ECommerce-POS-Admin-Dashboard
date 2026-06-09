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
      invalidatesTags: ["Transaction"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/update-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetMyOrdersQuery,
  useGetSingleOrderQuery,
  useCheckoutOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;

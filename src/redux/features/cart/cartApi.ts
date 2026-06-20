import { baseApi } from "@/redux/api/baseApi";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/get-cart",
      providesTags: ["Card"],
    }),
    addToCart: builder.mutation({
      query: (data) => ({
        url: "/add-cart",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Card"],
    }),
    updateCartQuantity: builder.mutation({
      query: (data) => ({
        url: "/update-quantity",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Card"],
    }),
    removeCartItem: builder.mutation({
      query: (variantId) => ({
        url: `/remove-item/${variantId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Card"],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/clear-cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Card"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;

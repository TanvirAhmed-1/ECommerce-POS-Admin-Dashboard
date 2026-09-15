import { baseApi } from "@/redux/api/baseApi";

export const variantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVariants: builder.query({
      query: (params) => ({
        url: "/all-variants",
        params,
      }),
      providesTags: ["Variant", "Product"],
    }),
    getProductVariants: builder.query({
      query: (productId) => `/product/${productId}`,
      providesTags: ["Variant"],
    }),
    updateVariantStock: builder.mutation({
      query: ({ id, stock }) => ({
        url: `/update-variant-stock/${id}`,
        method: "PATCH",
        body: { stock },
      }),
      invalidatesTags: ["Variant", "Product"],
    }),
    updateVariant: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-variant/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Variant", "Product"],
    }),
    createVariant: builder.mutation({
      query: (data) => ({
        url: "/create-variant",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Variant", "Product"],
    }),
    deleteVariant: builder.mutation({
      query: (id) => ({
        url: `/delete-variant/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Variant", "Product"],
    }),
  }),
});

export const {
  useGetAllVariantsQuery,
  useGetProductVariantsQuery,
  useUpdateVariantStockMutation,
  useUpdateVariantMutation,
  useCreateVariantMutation,
  useDeleteVariantMutation,
} = variantApi;

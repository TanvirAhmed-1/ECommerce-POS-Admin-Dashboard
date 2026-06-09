import { baseApi } from "@/redux/api/baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: (params) => ({
        url: "/product",
        params,
      }),
      providesTags: ["Service"], // using Service or we can add Product to tagTypes if needed, but let's stick to existing tags to avoid TS compile issues or we can inject it
    }),
    getSingleProduct: builder.query({
      query: (slug) => `/product/${slug}`,
      providesTags: ["Service"],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/create-product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product-update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/delete-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;

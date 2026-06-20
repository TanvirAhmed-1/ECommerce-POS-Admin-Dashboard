import { baseApi } from "@/redux/api/baseApi";

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBrands: builder.query({
      query: () => "/all-brands",
      providesTags: ["Brand"],
    }),
    createBrand: builder.mutation({
      query: (data) => ({
        url: "/create-brand",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Brand"],
    }),
    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-brand/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Brand"],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/delete-brand/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetAllBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;

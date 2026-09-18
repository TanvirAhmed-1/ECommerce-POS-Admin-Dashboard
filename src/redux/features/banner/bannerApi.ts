import { baseApi } from "@/redux/api/baseApi";

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBanners: builder.query({
      query: () => "/all-banners",
      providesTags: ["Banner"],
    }),
    getActiveBanners: builder.query({
      query: () => "/banners",
      providesTags: ["Banner"],
    }),
    createBanner: builder.mutation({
      query: (data) => ({
        url: "/create-banner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
    updateBanner: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-banner/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/delete-banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banner"],
    }),
    reorderBanners: builder.mutation({
      query: (data) => ({
        url: "/reorder-banners",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useGetActiveBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useReorderBannersMutation,
} = bannerApi;

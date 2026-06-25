import { baseApi } from "@/redux/api/baseApi";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviews: builder.query({
      query: () => ({
        url: "/all-reviews",
        method: "GET",
      }),
      providesTags: ["Review"],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/delete-review/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "Product", "Service"],
    }),
    updateReviewStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/reviews/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Review", "Product", "Service"],
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
} = reviewApi;

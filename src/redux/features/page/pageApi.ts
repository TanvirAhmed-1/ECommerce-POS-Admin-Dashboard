import { baseApi } from "@/redux/api/baseApi";

export const pageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPages: builder.query({
      query: () => "/pages",
      providesTags: ["Product"], // Use Product tag to invalidate/refetch for simplicity
    }),
    createPage: builder.mutation({
      query: (data) => ({
        url: "/pages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updatePage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/pages/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deletePage: builder.mutation({
      query: (id) => ({
        url: `/pages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetAllPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApi;

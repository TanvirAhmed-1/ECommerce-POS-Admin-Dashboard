import { baseApi } from "@/redux/api/baseApi";

export const sectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomeSections: builder.query({
      query: (params) => ({
        url: "/get-home-sections",
        params,
      }),
      providesTags: ["Product"],
    }),
    createSection: builder.mutation({
      query: (data) => ({
        url: "/create-section",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updateSection: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-section/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteSection: builder.mutation({
      query: (id) => ({
        url: `/delete-section/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetHomeSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionApi;

import { baseApi } from "@/redux/api/baseApi";

export const attributeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAttributes: builder.query({
      query: () => "/all-attributes",
      providesTags: ["Attribute"],
    }),
    createAttribute: builder.mutation({
      query: (data) => ({
        url: "/create-attribute",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attribute"],
    }),
    updateAttribute: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-attribute/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attribute"],
    }),
    deleteAttribute: builder.mutation({
      query: (id) => ({
        url: `/delete-attribute/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attribute"],
    }),
  }),
});

export const {
  useGetAllAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} = attributeApi;

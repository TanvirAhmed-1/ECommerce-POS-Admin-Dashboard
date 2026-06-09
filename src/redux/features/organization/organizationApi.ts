import { baseApi } from "@/redux/api/baseApi";

export const organization = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganization: builder.query({
      query: () => "/organizations",
      providesTags: ["Organization"],
    }),
    updateOrganization: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-organization/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    createOrganization: builder.mutation({
      query: (data) => ({
        url: "/organizations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/delete-organization/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),
  }),
});

export const {
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useDeleteOrganizationMutation,
  useUpdateOrganizationMutation,
} = organization;

import { baseApi } from "@/redux/api/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (params) => ({
        url: "/get-all-users",
        params,
      }),
      providesTags: ["User"],
    }),
    getNewIssueUsers: builder.query({
      query: (params) => ({
        url: "/new-card-issued-user",
        params,
      }),
      providesTags: ["User"],
    }),
    getSingleUser: builder.query({
      query: (id) => `/user/${id}`,
      providesTags: ["User"],
    }),
    createUsers: builder.mutation({
      query: (data) => ({
        url: "/create-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    checkoutUsers: builder.mutation({
      query: (data) => ({
        url: "/checkout-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    applyPenaltyUsers: builder.mutation({
      query: (data) => ({
        url: "/apply-penalty",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/update-user/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetNewIssueUsersQuery,
  useGetSingleUserQuery,
  useCreateUsersMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCheckoutUsersMutation,
  useApplyPenaltyUsersMutation,
} = userApi;

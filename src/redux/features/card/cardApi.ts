import { baseApi } from "@/redux/api/baseApi";

export const cardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCards: builder.query({
      query: (params) => ({
        url: "/cards",
        params,
      }),
      providesTags: ["Card"],
    }),
    getVirtualInactive: builder.query({
      query: () => `/virtual-inactive-card`,
      providesTags: ["Card"],
    }),
    getCardDetails: builder.query({
      query: (id) => `/card-details/${id}`,
      providesTags: ["Card"],
    }),
    deleteCard: builder.mutation({
      query: (id) => ({
        url: `/delete-card/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Card"],
    }),
    createCard: builder.mutation({
      query: (data) => ({
        url: "/cards",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Card"],
    }),
  }),
});
export const {
  useGetAllCardsQuery,
  useGetVirtualInactiveQuery,
  useDeleteCardMutation,
  useGetCardDetailsQuery,
  useCreateCardMutation,
} = cardApi;

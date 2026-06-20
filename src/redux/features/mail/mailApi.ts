import { baseApi } from "@/redux/api/baseApi";

export const mailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMails: builder.query({
      query: (params) => ({ url: "/mail/all", params }),
      providesTags: ["Transaction"],
    }),
    getMailById: builder.query({
      query: (id: string) => `/mail/${id}`,
      providesTags: ["Transaction"],
    }),
    sendMail: builder.mutation({
      query: (data) => ({ url: "/mail/send", method: "POST", body: data }),
      invalidatesTags: ["Transaction"],
    }),
    sendToAllCustomers: builder.mutation({
      query: (data) => ({ url: "/mail/send-all", method: "POST", body: data }),
      invalidatesTags: ["Transaction"],
    }),
    deleteMail: builder.mutation({
      query: (id: string) => ({ url: `/mail/${id}`, method: "DELETE" }),
      invalidatesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetAllMailsQuery,
  useGetMailByIdQuery,
  useSendMailMutation,
  useSendToAllCustomersMutation,
  useDeleteMailMutation,
} = mailApi;

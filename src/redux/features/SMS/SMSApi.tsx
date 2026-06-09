import { baseApi } from "@/redux/api/baseApi";

export const SMSApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendSms: builder.mutation({
      query: (data) => ({
        url: "/send-sms",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SMS", "User"],
    }),
    verifyToken: builder.mutation({
      query: (data) => ({
        url: "/verify-token",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SMS"],
    }),
    getAllVirtualCardAccess: builder.query({
      query: (params) => ({
        url: "/virtual-card-access",
        method: "GET",
        params,
      }),
      providesTags: ["SMS"],
    }),
  }),
});

export const { useSendSmsMutation, useVerifyTokenMutation, useGetAllVirtualCardAccessQuery } = SMSApi;

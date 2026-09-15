import { baseApi } from "@/redux/api/baseApi";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompany: builder.query({
      query: () => ({
        url: "/company",
        method: "GET",
      }),
      providesTags: ["Company"],
    }),
    upsertCompany: builder.mutation({
      query: (data) => {
        // If data is FormData, send directly, else JSON
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        return {
          url: "/company",
          method: "POST",
          body: data,
          formData: isFormData,
        };
      },
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useGetCompanyQuery,
  useUpsertCompanyMutation,
} = companyApi;

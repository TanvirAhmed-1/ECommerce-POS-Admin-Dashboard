import { baseApi } from "@/redux/api/baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadSingleImage: builder.mutation({
      query: (formData: FormData) => ({
        url: "/upload/single",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadSingleImageMutation } = uploadApi;

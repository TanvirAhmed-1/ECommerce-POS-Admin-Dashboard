import { baseApi } from "@/redux/api/baseApi";

export const sliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSliders: builder.query({
      query: () => "/all-sliders",
      providesTags: ["Slider"],
    }),
    createSlider: builder.mutation({
      query: (data) => ({
        url: "/create-slider",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Slider"],
    }),
    updateSlider: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update-sliders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Slider"],
    }),
    deleteSlider: builder.mutation({
      query: (id) => ({
        url: `/delete-slider/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slider"],
    }),
  }),
});

export const {
  useGetAllSlidersQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApi;

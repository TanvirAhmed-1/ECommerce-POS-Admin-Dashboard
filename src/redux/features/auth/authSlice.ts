import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TAuthData {
  token: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
}

const initialState: TAuthData = {
  token: null,
  role: null,
  name: null,
  email: null,
};

//  Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUserInfo: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        role: string;
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.name = null;
      state.email = null;
    },
  },
});

// ─── Exports
export const { setToken, setUserInfo, logout } = authSlice.actions;

export default authSlice.reducer;

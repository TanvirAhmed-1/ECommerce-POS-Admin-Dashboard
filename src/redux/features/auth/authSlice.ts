import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TAuthData {
  token: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
  id: string | null;
  avatar: string | null;
}

const initialState: TAuthData = {
  token: null,
  role: null,
  name: null,
  email: null,
  id: null,
  avatar: null,
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
        id?: string | null;
        avatar?: string | null;
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      if (action.payload.id !== undefined) {
        state.id = action.payload.id;
      }
      if (action.payload.avatar !== undefined) {
        state.avatar = action.payload.avatar;
      }
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.name = null;
      state.email = null;
      state.id = null;
      state.avatar = null;
    },
  },
});

// ─── Exports
export const { setToken, setUserInfo, logout } = authSlice.actions;

export default authSlice.reducer;

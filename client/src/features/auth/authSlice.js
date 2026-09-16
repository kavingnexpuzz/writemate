import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import { setStoredToken, getStoredToken } from "../../services/apiClient";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.login(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const registerCustomer = createAsyncThunk(
  "auth/registerCustomer",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.registerCustomer(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const registerWriter = createAsyncThunk(
  "auth/registerWriter",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authService.registerWriter(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.me();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authService.logout().catch(() => {});
  return null;
});

const initialState = {
  user: null,
  status: "idle", // idle | loading | succeeded | failed
  bootstrapped: false, // whether we've checked for an existing session on load
  error: null,
};

function handleAuthSuccess(state, action) {
  state.status = "succeeded";
  state.user = action.payload.user;
  state.error = null;
  setStoredToken(action.payload.accessToken);
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerCustomer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, handleAuthSuccess)
      .addCase(registerCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerWriter.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerWriter.fulfilled, handleAuthSuccess)
      .addCase(registerWriter.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.bootstrapped = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        setStoredToken(null);
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const hasStoredSession = () => Boolean(getStoredToken());

export default authSlice.reducer;

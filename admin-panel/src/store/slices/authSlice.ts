import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import { tokenService } from "@/lib/tokenService";
import { extractError } from "@/lib/axiosClient";
import type { AuthUser, CurrentUser, RequestStatus } from "@/types";

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: string | null;
  bootstrapped: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  bootstrapped: false,
};

const persist = (auth: AuthUser) =>
  tokenService.setTokens(auth.accessToken, auth.refreshToken);

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await authService.adminLogin(email, password);
      persist(data.data!);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/current",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authService.currentUser();
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch {
    /* best effort */
  }
  tokenService.clear();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionRestored: (state) => {
      const hasToken = tokenService.isAuthenticated();
      state.isAuthenticated = hasToken;
      if (!hasToken) state.bootstrapped = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(adminLogin.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(adminLogin.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.isAuthenticated = true;
        s.bootstrapped = true;
        s.user = {
          email: a.payload.email,
          username: a.payload.username,
          role: a.payload.role,
        };
      })
      .addCase(adminLogin.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.user = a.payload;
        s.isAuthenticated = true;
        s.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.bootstrapped = true;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.status = "idle";
      });
  },
});

export const { sessionRestored, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

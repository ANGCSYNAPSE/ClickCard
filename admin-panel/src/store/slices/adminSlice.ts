import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminService } from "@/services/adminService";
import { extractError } from "@/lib/axiosClient";
import type {
  AdminLead,
  AdminStats,
  AdminUser,
  RequestStatus,
  RevenueStats,
} from "@/types";

interface AdminState {
  stats: AdminStats | null;
  revenue: RevenueStats | null;
  users: AdminUser[];
  leads: AdminLead[];
  status: RequestStatus;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  revenue: null,
  users: [],
  leads: [],
  status: "idle",
  error: null,
};

export const fetchStats = createAsyncThunk(
  "admin/stats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminService.stats();
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchRevenue = createAsyncThunk(
  "admin/revenue",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminService.revenue();
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchUsers = createAsyncThunk(
  "admin/users",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminService.users();
      return data.data ?? [];
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const toggleBlockUser = createAsyncThunk(
  "admin/block",
  async (
    { id, isBlocked }: { id: number; isBlocked: boolean },
    { rejectWithValue },
  ) => {
    try {
      await adminService.blockUser(id, isBlocked);
      return { id, isBlocked };
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchLeads = createAsyncThunk(
  "admin/leads",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminService.leads();
      return data.data ?? [];
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchStats.fulfilled, (s, a) => {
      s.stats = a.payload;
    })
      .addCase(fetchRevenue.fulfilled, (s, a) => {
        s.revenue = a.payload;
      })
      .addCase(fetchUsers.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.users = a.payload;
      })
      .addCase(fetchUsers.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(toggleBlockUser.fulfilled, (s, a) => {
        const u = s.users.find((x) => x.id === a.payload.id);
        if (u) u.is_blocked = a.payload.isBlocked;
      })
      .addCase(fetchLeads.fulfilled, (s, a) => {
        s.leads = a.payload;
      });
  },
});

export default adminSlice.reducer;

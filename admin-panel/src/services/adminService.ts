import { apiClient } from "@/lib/axiosClient";
import { ADMIN_ROUTES } from "@/apiRoutes";
import type {
  ApiResponse,
  AdminStats,
  RevenueStats,
  AdminUser,
  AdminLead,
} from "@/types";

export interface UserAnalyticsData {
  totals: {
    profileViews: number;
    linkTaps: number;
    pdfDownloads: number;
    cardShares: number;
    activeLinks: number;
  };
  today: { profileViews: number; linkTaps: number; pdfDownloads: number };
  trend: { date: string; profile_views: number; link_taps: number; pdf_downloads: number }[];
  recent: {
    id: number;
    type: string;
    slug: string | null;
    link_key: string | null;
    device_type: string | null;
    platform: string | null;
    created_at: string;
  }[];
}

export const adminService = {
  stats: () => apiClient.get<ApiResponse<AdminStats>>(ADMIN_ROUTES.stats),
  revenue: () => apiClient.get<ApiResponse<RevenueStats>>(ADMIN_ROUTES.revenue),
  users: () => apiClient.get<ApiResponse<AdminUser[]>>(ADMIN_ROUTES.users),
  userDetails: (id: number) =>
    apiClient.get<ApiResponse<AdminUser>>(ADMIN_ROUTES.userDetails(id)),
  userAnalytics: (id: number) =>
    apiClient.get<ApiResponse<UserAnalyticsData>>(ADMIN_ROUTES.userAnalytics(id)),
  blockUser: (id: number, isBlocked: boolean) =>
    apiClient.patch<ApiResponse<AdminUser>>(ADMIN_ROUTES.blockUser(id), {
      isBlocked,
    }),
  moderateUser: (id: number, status: "approved" | "rejected" | "pending") =>
    apiClient.patch<ApiResponse>(ADMIN_ROUTES.moderateUser(id), { status }),
  leads: () => apiClient.get<ApiResponse<AdminLead[]>>(ADMIN_ROUTES.leads),
  settings: () => apiClient.get<ApiResponse>(ADMIN_ROUTES.settings),
};

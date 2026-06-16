import { apiClient } from "@/lib/axiosClient";
import { AUTH_ROUTES, USER_ROUTES } from "@/apiRoutes";
import type { ApiResponse, AuthUser, CurrentUser } from "@/types";

export const authService = {
  adminLogin: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.adminLogin, {
      email,
      password,
    }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.refreshToken, {
      refreshToken,
    }),

  logout: () => apiClient.post<ApiResponse>(AUTH_ROUTES.logout),

  currentUser: () =>
    apiClient.get<ApiResponse<CurrentUser>>(USER_ROUTES.current),
};

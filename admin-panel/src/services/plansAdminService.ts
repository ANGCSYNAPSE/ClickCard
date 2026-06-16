import { apiClient } from "@/lib/axiosClient";
import { BILLING_ADMIN_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export interface AdminPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number; // paise
  priceYearly: number;
  currency: string;
  limits: Record<string, number>;
  verticals: string[];
  entitlements: string[];
  popular: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export type AdminPlanInput = Partial<AdminPlan> & { id: string };

export const plansAdminService = {
  list: () => apiClient.get<ApiResponse<AdminPlan[]>>(BILLING_ADMIN_ROUTES.list),
  upsert: (input: AdminPlanInput) =>
    apiClient.post<ApiResponse<AdminPlan>>(BILLING_ADMIN_ROUTES.upsert, input),
  remove: (id: string) =>
    apiClient.delete<ApiResponse>(BILLING_ADMIN_ROUTES.remove(id)),
};

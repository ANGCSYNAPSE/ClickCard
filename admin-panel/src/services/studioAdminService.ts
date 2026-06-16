import { apiClient } from "@/lib/axiosClient";
import { STUDIO_ADMIN_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export type StudioCategory = "resume" | "visiting_card" | "qr_poster";

export interface StudioTemplate {
  id: number;
  slug: string;
  name: string;
  category: StudioCategory;
  description: string;
  preview_url: string | null;
  width: number;
  height: number;
  primary_color: string;
  accent_color: string;
  html_template: string | null;
  is_premium: boolean;
  is_published: boolean;
  created_at: string;
}

export type StudioTemplateInput = Partial<Omit<StudioTemplate, "id" | "created_at">> & {
  slug: string;
  name: string;
  category: StudioCategory;
};

export const studioAdminService = {
  list: () =>
    apiClient.get<ApiResponse<StudioTemplate[]>>(STUDIO_ADMIN_ROUTES.list),
  create: (input: StudioTemplateInput) =>
    apiClient.post<ApiResponse<StudioTemplate>>(STUDIO_ADMIN_ROUTES.create, input),
  update: (id: number, input: Partial<StudioTemplateInput>) =>
    apiClient.put<ApiResponse<StudioTemplate>>(STUDIO_ADMIN_ROUTES.update(id), input),
  remove: (id: number) =>
    apiClient.delete<ApiResponse>(STUDIO_ADMIN_ROUTES.remove(id)),
};

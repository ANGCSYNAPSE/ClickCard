/**
 * Admin panel API route registry. Base URL via NEXT_PUBLIC_API_BASE_URL.
 */

export const AUTH_ROUTES = {
  adminLogin: "/api/users/admin/login",
  refreshToken: "/api/users/refresh-token",
  logout: "/api/users/logout",
} as const;

export const USER_ROUTES = {
  current: "/api/users/current",
} as const;

export const NOTIFICATION_ROUTES = {
  list: "/api/notifications",
  unreadCount: "/api/notifications/unread-count",
  read: (id: number | string) => `/api/notifications/${id}/read`,
  readAll: "/api/notifications/read-all",
  announce: "/api/notifications/announce",
} as const;

export const BILLING_ADMIN_ROUTES = {
  list: "/api/billing/admin/plans",
  upsert: "/api/billing/admin/plans",
  remove: (id: string) => `/api/billing/admin/plans/${id}`,
} as const;

export const STUDIO_ADMIN_ROUTES = {
  list: "/api/studio/admin/templates",
  create: "/api/studio/admin/templates",
  update: (id: number | string) => `/api/studio/admin/templates/${id}`,
  remove: (id: number | string) => `/api/studio/admin/templates/${id}`,
} as const;

export const ADMIN_ROUTES = {
  stats: "/api/admin/stats",
  revenue: "/api/admin/revenue",
  users: "/api/admin/users",
  userDetails: (id: number | string) => `/api/admin/users/${id}`,
  userAnalytics: (id: number | string) => `/api/admin/users/${id}/analytics`,
  blockUser: (id: number | string) => `/api/admin/users/${id}/block`,
  moderateUser: (id: number | string) => `/api/admin/users/${id}/moderate`,
  leads: "/api/admin/leads",
  settings: "/api/admin/settings",
} as const;

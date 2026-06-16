import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/hooks";
import { tokenService } from "./tokenService";

/** Redirect already-authenticated admins away from the login screen. */
export function useRequireGuest(redirectTo = "/dashboard") {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  useEffect(() => {
    if ((isAuthenticated || tokenService.isAuthenticated()) && user?.role === "admin") {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, user, redirectTo, router]);
}

/**
 * Role-based gate. Admin pages require a token AND role === 'admin'.
 * Non-admins are bounced to /login?error=forbidden.
 */
export function useRequireAdmin() {
  const router = useRouter();
  const { user, bootstrapped } = useAppSelector((s) => s.auth);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasToken = mounted && tokenService.isAuthenticated();

  useEffect(() => {
    if (!mounted) return;
    if (!hasToken) {
      router.replace("/login");
      return;
    }
    if (bootstrapped && user && user.role !== "admin") {
      tokenService.clear();
      router.replace("/login?error=forbidden");
    }
  }, [mounted, hasToken, bootstrapped, user, router]);

  return {
    ready: mounted && hasToken && bootstrapped && user?.role === "admin",
    isAdmin: user?.role === "admin",
  };
}

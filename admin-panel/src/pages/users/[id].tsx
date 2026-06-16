import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Download,
  Share2,
  Mail,
  Phone,
  Calendar,
  Activity,
  Ban,
  CheckCircle2,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminService, UserAnalyticsData } from "@/services/adminService";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store/hooks";
import type { AdminUser } from "@/types";

export default function AdminUserDetail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const id = Number(router.query.id);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    Promise.all([
      adminService.userDetails(id).then((r) => r.data.data ?? null),
      adminService.userAnalytics(id).then((r) => r.data.data ?? null),
    ])
      .then(([u, a]) => {
        if (!alive) return;
        setUser(u);
        setAnalytics(a);
      })
      .catch(() => alive && dispatch(pushToast("Failed to load user", "error")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, dispatch]);

  const onBlock = async (isBlocked: boolean) => {
    if (!user) return;
    setMutating(true);
    try {
      await adminService.blockUser(user.id, isBlocked);
      setUser({ ...user, is_blocked: isBlocked });
      dispatch(pushToast(isBlocked ? "User blocked" : "User unblocked", isBlocked ? "info" : "success"));
    } catch {
      dispatch(pushToast("Action failed", "error"));
    } finally {
      setMutating(false);
    }
  };

  const stats = analytics
    ? [
        { label: "Profile views", value: analytics.totals.profileViews, today: analytics.today.profileViews, icon: Eye, tint: "from-brand-500 to-candy-cyan" },
        { label: "Link taps", value: analytics.totals.linkTaps, today: analytics.today.linkTaps, icon: MousePointerClick, tint: "from-candy-pink to-brand-500" },
        { label: "Active links", value: analytics.totals.activeLinks, today: 0, icon: Share2, tint: "from-candy-orange to-candy-pink" },
        { label: "PDF downloads", value: analytics.totals.pdfDownloads, today: analytics.today.pdfDownloads, icon: Download, tint: "from-candy-cyan to-brand-600" },
      ]
    : [];

  return (
    <AdminShell title="User detail">
      <Head>
        <title>{user?.username || user?.email || "User"} · ClickCard Admin</title>
      </Head>

      <Link href="/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700">
        <ArrowLeft size={15} /> Back to users
      </Link>

      {loading ? (
        <div className="grid place-items-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        </div>
      ) : !user ? (
        <p className="text-sm text-ink/55">User not found.</p>
      ) : (
        <>
          {/* identity header */}
          <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-2xl font-black text-white">
                  {(user.username || user.email || "U")[0].toUpperCase()}
                </span>
                <div>
                  <h1 className="font-display text-2xl font-black text-ink dark:text-white">
                    {user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed"}
                  </h1>
                  <p className="text-sm text-ink/55 dark:text-white/55">
                    <Mail size={12} className="mr-1 inline" /> {user.email}
                    {user.phone_number && (
                      <>
                        <span className="mx-2">·</span>
                        <Phone size={12} className="mr-1 inline" />
                        {user.phone_number}
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-ink/40">
                    <Calendar size={11} className="mr-1 inline" />
                    Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.role === "admin" ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-white" : "bg-ink/5 text-ink/60 dark:bg-white/5 dark:text-white/60"}`}>
                  {user.role || "user"}
                </span>
                {user.is_blocked ? (
                  <button disabled={mutating} onClick={() => onBlock(false)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10">
                    <CheckCircle2 size={14} /> Unblock
                  </button>
                ) : (
                  <button disabled={mutating} onClick={() => onBlock(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/10">
                    <Ban size={14} /> Block
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* analytics tiles */}
          <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink dark:text-white">Analytics</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-3xl border border-ink/[0.06] bg-white p-5 dark:border-white/[0.06] dark:bg-[#100b26]">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${s.tint} text-white`}>
                  <s.icon size={20} />
                </span>
                <p className="mt-4 font-display text-2xl font-black text-ink dark:text-white">
                  {s.value.toLocaleString()}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink/55 dark:text-white/55">{s.label}</p>
                  {s.today > 0 && (
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">
                      +{s.today} today
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 7-day trend (sparkline-ish bars) */}
          {analytics && analytics.trend.length > 0 && (
            <div className="mt-6 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
              <h3 className="mb-4 font-display text-sm font-bold text-ink dark:text-white">Last 7 days</h3>
              <div className="flex items-end gap-2">
                {analytics.trend.map((d) => {
                  const total = d.profile_views + d.link_taps + d.pdf_downloads;
                  const max = Math.max(...analytics.trend.map((x) => x.profile_views + x.link_taps + x.pdf_downloads), 1);
                  const h = Math.max(8, Math.round((total / max) * 100));
                  return (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                      <div className="w-full max-w-[24px] overflow-hidden rounded-md bg-brand-gradient" style={{ height: `${h}px` }} title={`${d.date}: ${total}`} />
                      <span className="text-[10px] text-ink/40">{d.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* recent events */}
          {analytics && analytics.recent.length > 0 && (
            <div className="mt-6 rounded-3xl border border-ink/[0.06] bg-white dark:border-white/[0.06] dark:bg-[#100b26]">
              <div className="flex items-center gap-2 border-b border-ink/[0.06] p-4 dark:border-white/[0.06]">
                <Activity size={16} className="text-brand-500" />
                <h3 className="font-display text-sm font-bold text-ink dark:text-white">Recent activity</h3>
              </div>
              <ul className="divide-y divide-ink/[0.04] dark:divide-white/[0.04]">
                {analytics.recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <p className="font-bold text-ink dark:text-white">{prettyType(r.type)}</p>
                      <p className="text-xs text-ink/50">
                        {[r.platform, r.device_type, r.link_key, r.slug].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink/40">{new Date(r.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}

function prettyType(t: string) {
  switch (t) {
    case "profile_view":
      return "Profile view";
    case "link_tap":
      return "Link tap";
    case "pdf_download":
      return "PDF download";
    case "card_share":
      return "Card shared";
    default:
      return t;
  }
}

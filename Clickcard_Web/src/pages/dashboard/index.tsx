import { useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  Download,
  Sparkles,
  User,
  CreditCard,
  Share2,
  ArrowRight,
  Plus,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import LiveProfileFeed from "@/components/app/LiveProfileFeed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/profileSlice";
import { fetchShareTotals, fetchShareLinks } from "@/store/slices/shareSlice";
import { fetchDashboardAnalytics } from "@/store/slices/analyticsSlice";

const QUICK = [
  { label: "Edit profile", href: "/profile", icon: User, tint: "from-brand-500 to-candy-pink" },
  { label: "Design a card", href: "/studio", icon: Sparkles, tint: "from-candy-pink to-candy-orange" },
  { label: "Digital card", href: "/card", icon: CreditCard, tint: "from-candy-cyan to-brand-600" },
  { label: "Share & QR", href: "/share", icon: Share2, tint: "from-candy-orange to-candy-yellow" },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { draft, isPublic } = useAppSelector((s) => s.profile);
  const { links } = useAppSelector((s) => s.share);
  const { dashboard } = useAppSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchShareTotals());
    dispatch(fetchShareLinks());
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  const completion = useMemo(() => {
    const checks = [
      draft.personal?.fullName,
      draft.personal?.tagline,
      draft.personal?.profilePicture,
      draft.contact?.email || draft.contact?.phone,
      (draft.social?.length ?? 0) > 0,
      (draft.experience?.length ?? 0) > 0 || (draft.education?.length ?? 0) > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [draft]);

  const totals = dashboard?.totals;
  const today = dashboard?.today;
  const stats = [
    {
      label: "Profile views",
      value: totals?.profileViews ?? 0,
      delta: today?.profileViews ?? 0,
      icon: Eye,
      tint: "from-brand-500 to-candy-cyan",
    },
    {
      label: "Link taps",
      value: totals?.linkTaps ?? 0,
      delta: today?.linkTaps ?? 0,
      icon: MousePointerClick,
      tint: "from-candy-pink to-brand-500",
    },
    {
      label: "Active links",
      value: totals?.activeLinks ?? links.length,
      delta: 0,
      icon: Share2,
      tint: "from-candy-orange to-candy-pink",
    },
    {
      label: "PDF downloads",
      value: totals?.pdfDownloads ?? 0,
      delta: today?.pdfDownloads ?? 0,
      icon: Download,
      tint: "from-candy-cyan to-brand-600",
    },
  ];

  return (
    <AppShell>
      <Head>
        <title>Dashboard · ClickCard</title>
      </Head>

      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow sm:p-8">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">
              {greeting()}, welcome back 👋
            </p>
            <h1 className="mt-1 font-display text-3xl font-black">
              {user?.username ? `@${user.username}` : "Your ClickCard"}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {isPublic ? "Your profile is live & public" : "Your profile is private"} ·{" "}
              clickcard.app/{user?.username ?? "you"}
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-700 shadow-soft transition hover:scale-105"
          >
            <Plus size={18} /> Build my profile
          </Link>
        </div>
      </div>

      {/* completion + live phone preview side-by-side on lg */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#120d2e]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink dark:text-white">
              Profile completion
            </h2>
            <span className="font-display text-2xl font-black text-brand-600">
              {completion}%
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-50 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-ink/55 dark:text-white/55">
            {completion < 100
              ? "Add more details to make your page shine and rank better."
              : "Nice! Your profile looks complete. 🎉"}
          </p>
        </div>

        <LiveProfileFeed profile={draft} username={user?.username} />
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-[#120d2e]"
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${s.tint} text-white`}
            >
              <s.icon size={20} />
            </span>
            <p className="mt-4 font-display text-2xl font-black text-ink dark:text-white">
              {s.value.toLocaleString()}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink/55 dark:text-white/55">{s.label}</p>
              {s.delta > 0 && (
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">
                  +{s.delta} today
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* quick actions */}
      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink dark:text-white">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className="group rounded-3xl border border-ink/5 bg-white p-5 transition hover:-translate-y-1 hover:shadow-card dark:border-white/5 dark:bg-[#120d2e]"
          >
            <span
              className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${q.tint} text-white`}
            >
              <q.icon size={22} />
            </span>
            <p className="mt-4 flex items-center justify-between font-bold text-ink dark:text-white">
              {q.label}
              <ArrowRight
                size={16}
                className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-brand-500"
              />
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

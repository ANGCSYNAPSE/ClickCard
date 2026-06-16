import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Home, LifeBuoy, Users, BarChart3, FileBarChart, Settings } from "lucide-react";

const DESTINATIONS = [
  { label: "Dashboard", href: "/dashboard", description: "KPIs & revenue", icon: BarChart3 },
  { label: "Users", href: "/users", description: "Manage user accounts", icon: Users },
  { label: "Subscriptions", href: "/subscriptions", description: "Revenue & MRR", icon: FileBarChart },
  { label: "Settings", href: "/settings", description: "System configuration", icon: Settings },
];

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Not found · ClickCard Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mist px-4 py-16 dark:bg-[#0a0620]">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-candy-pink/15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-2xl text-center">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-brand-700 shadow-soft backdrop-blur dark:bg-white/10 dark:text-white">
            404 · Admin
          </span>
          <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] text-ink dark:text-white sm:text-6xl">
            Off the admin map
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-ink/60 dark:text-white/60">
            That admin page doesn&apos;t exist. Head back to the dashboard or pick a destination below.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105"
            >
              <Home size={16} /> Go home
            </Link>
            <a
              href="mailto:support@clickcard.app"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-100 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <LifeBuoy size={16} /> Support
            </a>
          </div>

          <div className="mt-12 grid gap-2 sm:grid-cols-2">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-soft ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-card dark:bg-white/5 dark:ring-white/5"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-500 dark:bg-white/5">
                    <d.icon size={16} />
                  </span>
                  <span>
                    <span className="block font-bold text-ink dark:text-white">{d.label}</span>
                    <span className="text-xs text-ink/55 dark:text-white/55">{d.description}</span>
                  </span>
                </span>
                <ArrowRight size={16} className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import Head from "next/head";
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Users, Eye, Inbox, IndianRupee, TrendingUp, BadgeCheck, Globe, Megaphone } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import AnnounceModal from "@/components/admin/AnnounceModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStats, fetchRevenue } from "@/store/slices/adminSlice";

const PIE = ["#7c3aed", "#ff5db1", "#ff9d4d", "#22d3ee", "#a3e635"];

export default function AdminDashboard() {
  const [announce, setAnnounce] = useState(false);
  const dispatch = useAppDispatch();
  const { stats, revenue } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchRevenue());
  }, [dispatch]);

  const cards = [
    { label: "Total users", value: stats?.users.total ?? 0, sub: `+${stats?.users.newToday ?? 0} today`, icon: Users, tint: "from-brand-500 to-candy-cyan" },
    { label: "Profile views", value: stats?.engagement.totalViews ?? 0, sub: `+${stats?.engagement.viewsToday ?? 0} today`, icon: Eye, tint: "from-candy-pink to-brand-500" },
    { label: "MRR", value: revenue?.mrr ?? 0, money: true, sub: `${revenue?.activeSubscriptions ?? 0} active subs`, icon: IndianRupee, tint: "from-emerald-500 to-teal-500" },
    { label: "Leads", value: stats?.leads.total ?? 0, sub: `+${stats?.leads.today ?? 0} today`, icon: Inbox, tint: "from-candy-orange to-candy-pink" },
  ];

  const trend = revenue?.trend?.length
    ? revenue.trend
    : Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (13 - i));
        return { date: d.toISOString().slice(5, 10), revenue: 0 };
      });

  const planData = (revenue?.byPlan ?? []).map((p) => ({ name: p.plan_id, value: p.subscribers }));

  return (
    <AdminShell title="Dashboard">
      <Head><title>Dashboard · ClickCard Admin</title></Head>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/55 dark:text-white/55">
          Platform overview & live activity.
        </p>
        <button
          onClick={() => setAnnounce(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:opacity-95"
        >
          <Megaphone size={16} /> Announce feature
        </button>
      </div>
      {announce && <AnnounceModal onClose={() => setAnnounce(false)} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl border border-ink/[0.06] bg-white p-5 dark:border-white/[0.06] dark:bg-[#100b26]">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${c.tint} text-white`}>
              <c.icon size={20} />
            </span>
            <p className="mt-4 font-display text-2xl font-black text-ink dark:text-white">
              {c.money ? "₹" : ""}{(c.value as number).toLocaleString()}
            </p>
            <p className="text-sm text-ink/55 dark:text-white/55">{c.label}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp size={12} /> {c.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">Revenue (30 days)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 40px -12px rgba(124,58,237,0.35)", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">Plan mix</h2>
          <div className="mt-2 h-48">
            {planData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={3}>
                    {planData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-ink/40">No subscriptions yet</div>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {planData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize text-ink/70 dark:text-white/70">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE[i % PIE.length] }} /> {p.name}
                </span>
                <span className="font-bold text-ink dark:text-white">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <MiniStat icon={BadgeCheck} label="Profiles complete" value={stats?.users.profileComplete ?? 0} total={stats?.users.total ?? 0} />
        <MiniStat icon={Globe} label="Public profiles" value={stats?.users.publicEnabled ?? 0} total={stats?.users.total ?? 0} />
      </div>
    </AdminShell>
  );
}

function MiniStat({ icon: Icon, label, value, total }: { icon: typeof Users; label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-ink dark:text-white"><Icon size={18} className="text-brand-500" /> {label}</span>
        <span className="font-display text-xl font-black text-ink dark:text-white">{value.toLocaleString()}</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/5 dark:bg-white/5">
        <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-ink/45">{pct}% of all users</p>
    </div>
  );
}

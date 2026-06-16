import { useEffect } from "react";
import Head from "next/head";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CreditCard, IndianRupee, Users } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRevenue } from "@/store/slices/adminSlice";

export default function AdminSubscriptions() {
  const dispatch = useAppDispatch();
  const { revenue } = useAppSelector((s) => s.admin);
  useEffect(() => { dispatch(fetchRevenue()); }, [dispatch]);

  const byPlan = revenue?.byPlan ?? [];
  const cards = [
    { label: "Active subscriptions", value: revenue?.activeSubscriptions ?? 0, icon: Users, tint: "from-brand-500 to-candy-cyan" },
    { label: "Monthly recurring revenue", value: revenue?.mrr ?? 0, money: true, icon: IndianRupee, tint: "from-emerald-500 to-teal-500" },
    { label: "Paid plans", value: byPlan.filter((p) => p.plan_id !== "free").length, icon: CreditCard, tint: "from-candy-pink to-brand-500" },
  ];

  return (
    <AdminShell title="Subscriptions & revenue">
      <Head><title>Subscriptions · ClickCard Admin</title></Head>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl border border-ink/[0.06] bg-white p-5 dark:border-white/[0.06] dark:bg-[#100b26]">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${c.tint} text-white`}><c.icon size={20} /></span>
            <p className="mt-4 font-display text-2xl font-black text-ink dark:text-white">{c.money ? "₹" : ""}{c.value.toLocaleString()}</p>
            <p className="text-sm text-ink/55 dark:text-white/55">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">Revenue by plan</h2>
        <div className="mt-4 h-64">
          {byPlan.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlan} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" vertical={false} />
                <XAxis dataKey="plan_id" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink/40">No subscription data yet</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

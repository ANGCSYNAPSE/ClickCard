import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Search, Ban, CheckCircle2, Users as UsersIcon, ChevronRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, toggleBlockUser } from "@/store/slices/adminSlice";
import { pushToast } from "@/store/slices/uiSlice";

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { users, status } = useAppSelector((s) => s.admin);
  const [q, setQ] = useState("");

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const filtered = users.filter((u) =>
    [u.email, u.username, u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const onBlock = async (id: number, isBlocked: boolean) => {
    const res = await dispatch(toggleBlockUser({ id, isBlocked }));
    if (toggleBlockUser.fulfilled.match(res))
      dispatch(pushToast(isBlocked ? "User blocked" : "User unblocked", isBlocked ? "info" : "success"));
  };

  return (
    <AdminShell title="Users">
      <Head><title>Users · ClickCard Admin</title></Head>

      <div className="rounded-3xl border border-ink/[0.06] bg-white dark:border-white/[0.06] dark:bg-[#100b26]">
        <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] p-4 dark:border-white/[0.06]">
          <p className="text-sm font-bold text-ink dark:text-white">{filtered.length} users</p>
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="h-9 w-full rounded-xl border border-ink/[0.07] bg-mist pl-9 pr-3 text-sm outline-none focus:border-brand-300 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white" />
          </div>
        </div>

        {status === "loading" && users.length === 0 ? (
          <div className="grid place-items-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center gap-2 py-16 text-center">
            <UsersIcon className="text-ink/30" />
            <p className="text-sm text-ink/50">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/[0.06] text-left text-xs uppercase tracking-wide text-ink/40 dark:border-white/[0.06]">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Joined</th>
                  <th className="p-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/users/${u.id}`)}
                    className="cursor-pointer border-b border-ink/[0.04] transition last:border-0 hover:bg-mist/60 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-xs font-black text-white">
                          {(u.username || u.email || "U")[0].toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-ink dark:text-white">{u.username || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "—"}</p>
                          <p className="text-xs text-ink/50">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.role === "admin" ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-white" : "bg-ink/5 text-ink/60 dark:bg-white/5 dark:text-white/60"}`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.is_blocked
                        ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-500 dark:bg-rose-500/10">Blocked</span>
                        : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">Active</span>}
                    </td>
                    <td className="p-4 text-ink/55 dark:text-white/55">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        {u.is_blocked ? (
                          <button onClick={() => onBlock(u.id, false)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10">
                            <CheckCircle2 size={14} /> Unblock
                          </button>
                        ) : (
                          <button onClick={() => onBlock(u.id, true)} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-100 dark:bg-rose-500/10">
                            <Ban size={14} /> Block
                          </button>
                        )}
                        <ChevronRight size={16} className="text-ink/30" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

import { useEffect } from "react";
import Head from "next/head";
import { Inbox, Mail, Phone } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLeads } from "@/store/slices/adminSlice";

export default function AdminLeads() {
  const dispatch = useAppDispatch();
  const { leads } = useAppSelector((s) => s.admin);
  useEffect(() => { dispatch(fetchLeads()); }, [dispatch]);

  return (
    <AdminShell title="Leads">
      <Head><title>Leads · ClickCard Admin</title></Head>
      {leads.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-ink/15 py-20 text-center dark:border-white/10">
          <Inbox className="text-ink/30" />
          <p className="text-sm text-ink/50">No leads captured yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {leads.map((l) => (
            <div key={l.id} className="rounded-2xl border border-ink/[0.06] bg-white p-4 dark:border-white/[0.06] dark:bg-[#100b26]">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ink dark:text-white">{l.name || "Anonymous"}</p>
                <span className="text-xs text-ink/40">{l.created_at ? new Date(l.created_at).toLocaleDateString() : ""}</span>
              </div>
              {l.message && <p className="mt-1 text-sm text-ink/60 dark:text-white/60">{l.message}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-brand-600">
                {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1"><Mail size={13} /> {l.email}</a>}
                {l.phone && <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1"><Phone size={13} /> {l.phone}</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

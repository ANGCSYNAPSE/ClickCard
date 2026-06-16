import { useEffect, useState } from "react";
import Head from "next/head";
import { Sliders } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminService } from "@/services/adminService";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    adminService.settings().then((r) => setSettings(r.data?.data as Record<string, unknown>)).catch(() => setSettings({}));
  }, []);
  return (
    <AdminShell title="System settings">
      <Head><title>Settings · ClickCard Admin</title></Head>
      <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-white/5"><Sliders size={20} /></span>
          <div>
            <p className="font-bold text-ink dark:text-white">Global configuration</p>
            <p className="text-sm text-ink/55 dark:text-white/55">Feature flags, categories & platform-wide settings.</p>
          </div>
        </div>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-mist p-4 text-xs text-ink/70 dark:bg-white/[0.03] dark:text-white/70">
{settings ? JSON.stringify(settings, null, 2) : "Loading…"}
        </pre>
      </div>
    </AdminShell>
  );
}

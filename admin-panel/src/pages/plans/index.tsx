import { useEffect, useState } from "react";
import Head from "next/head";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  plansAdminService,
  AdminPlan,
  AdminPlanInput,
} from "@/services/plansAdminService";
import { useAppDispatch } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";

const VERTICAL_IDS = [
  "pro_identity",
  "studio_pro",
  "business_storefront",
  "analytics_growth",
];

const emptyDraft: AdminPlanInput = {
  id: "",
  name: "",
  tagline: "",
  priceMonthly: 0,
  priceYearly: 0,
  currency: "INR",
  limits: { links: 5, cardTemplates: 1 },
  verticals: [],
  entitlements: [],
  popular: false,
  isPublished: true,
  sortOrder: 0,
};

const rupees = (paise = 0) => `₹${Math.round(paise / 100).toLocaleString()}`;

export default function AdminPlans() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<AdminPlanInput>(emptyDraft);

  const refresh = () => {
    setLoading(true);
    plansAdminService
      .list()
      .then((r) => setRows(r.data?.data ?? []))
      .catch(() => dispatch(pushToast("Failed to load plans", "error")))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [dispatch]);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setShowForm(true);
  };
  const openEdit = (p: AdminPlan) => {
    setEditing(p);
    setDraft({ ...p });
    setShowForm(true);
  };

  const submit = async () => {
    try {
      if (!draft.id) {
        dispatch(pushToast("Plan id is required", "error"));
        return;
      }
      await plansAdminService.upsert(draft);
      dispatch(pushToast(editing ? "Plan updated" : "Plan created", "success"));
      setShowForm(false);
      refresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      dispatch(pushToast(err?.response?.data?.message || "Save failed", "error"));
    }
  };

  const togglePublish = async (p: AdminPlan) => {
    try {
      await plansAdminService.upsert({ ...p, isPublished: !p.isPublished });
      refresh();
    } catch {
      dispatch(pushToast("Toggle failed", "error"));
    }
  };

  const remove = async (p: AdminPlan) => {
    if (p.id === "free") {
      dispatch(pushToast("Free plan cannot be deleted", "info"));
      return;
    }
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await plansAdminService.remove(p.id);
      dispatch(pushToast("Plan deleted", "info"));
      refresh();
    } catch {
      dispatch(pushToast("Delete failed", "error"));
    }
  };

  const toggleVertical = (vId: string) => {
    const current = draft.verticals || [];
    const next = current.includes(vId)
      ? current.filter((v) => v !== vId)
      : [...current, vId];
    setDraft({ ...draft, verticals: next });
  };

  return (
    <AdminShell title="Plans">
      <Head>
        <title>Plans · ClickCard Admin</title>
      </Head>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/55 dark:text-white/55">
          Edit pricing, limits, and which premium verticals each plan unlocks. Changes are live immediately.
        </p>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-soft">
          <Plus size={16} /> New plan
        </button>
      </div>

      <div className="rounded-3xl border border-ink/[0.06] bg-white dark:border-white/[0.06] dark:bg-[#100b26]">
        {loading && rows.length === 0 ? (
          <div className="grid place-items-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
          </div>
        ) : rows.length === 0 ? (
          <div className="grid place-items-center py-16 text-sm text-ink/55 dark:text-white/55">
            No plans yet — click "New plan".
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/[0.06] text-left text-xs uppercase tracking-wide text-ink/40 dark:border-white/[0.06]">
                <th className="p-4 font-bold">Plan</th>
                <th className="p-4 font-bold">Monthly</th>
                <th className="p-4 font-bold">Yearly</th>
                <th className="p-4 font-bold">Verticals</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-ink/[0.04] last:border-0 dark:border-white/[0.04]">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink dark:text-white">{p.name}</p>
                      {p.popular && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          <Star size={10} /> Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink/50">{p.id} · {p.tagline}</p>
                  </td>
                  <td className="p-4 text-ink/70 dark:text-white/70">{rupees(p.priceMonthly)}</td>
                  <td className="p-4 text-ink/70 dark:text-white/70">{rupees(p.priceYearly)}</td>
                  <td className="p-4 text-xs text-ink/55 dark:text-white/55">
                    {(p.verticals || []).join(", ") || "—"}
                  </td>
                  <td className="p-4">
                    {p.isPublished ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">Live</span>
                    ) : (
                      <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-ink/60 dark:bg-white/5 dark:text-white/60">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => togglePublish(p)} className="inline-flex items-center gap-1 rounded-lg bg-ink/5 px-2 py-1.5 text-xs font-bold text-ink/70 transition hover:bg-ink/10 dark:bg-white/5 dark:text-white/70">
                        {p.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-white/10 dark:text-white">
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => remove(p)} disabled={p.id === "free"} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-100 disabled:opacity-40 dark:bg-rose-500/10">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-float dark:bg-[#100b26]">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">
              {editing ? `Edit ${editing.name}` : "New plan"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Plan id" disabled={!!editing}>
                <input value={draft.id} disabled={!!editing} onChange={(e) => setDraft({ ...draft, id: e.target.value })} className="input-base" />
              </Field>
              <Field label="Name">
                <input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input-base" />
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                <input value={draft.tagline || ""} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="input-base" />
              </Field>
              <Field label="Monthly price (paise)">
                <input type="number" min={0} value={draft.priceMonthly || 0} onChange={(e) => setDraft({ ...draft, priceMonthly: parseInt(e.target.value) || 0 })} className="input-base" />
              </Field>
              <Field label="Yearly price (paise)">
                <input type="number" min={0} value={draft.priceYearly || 0} onChange={(e) => setDraft({ ...draft, priceYearly: parseInt(e.target.value) || 0 })} className="input-base" />
              </Field>
              <Field label="Currency">
                <select value={draft.currency || "INR"} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} className="input-base">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
              <Field label="Sort order">
                <input type="number" value={draft.sortOrder || 0} onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value) || 0 })} className="input-base" />
              </Field>
              <Field label="Links limit (-1 = unlimited)">
                <input type="number" value={draft.limits?.links ?? 5} onChange={(e) => setDraft({ ...draft, limits: { ...(draft.limits || {}), links: parseInt(e.target.value) } })} className="input-base" />
              </Field>
              <Field label="Card templates limit (-1 = unlimited)">
                <input type="number" value={draft.limits?.cardTemplates ?? 1} onChange={(e) => setDraft({ ...draft, limits: { ...(draft.limits || {}), cardTemplates: parseInt(e.target.value) } })} className="input-base" />
              </Field>
              <Field label="Verticals unlocked" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {VERTICAL_IDS.map((v) => {
                    const active = (draft.verticals || []).includes(v);
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => toggleVertical(v)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          active
                            ? "bg-brand-gradient text-white"
                            : "bg-ink/5 text-ink/60 hover:bg-ink/10 dark:bg-white/5 dark:text-white/60"
                        }`}
                      >
                        {v.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Popular" className="sm:col-span-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink/80 dark:text-white/80">
                  <input type="checkbox" checked={!!draft.popular} onChange={(e) => setDraft({ ...draft, popular: e.target.checked })} className="h-4 w-4 accent-brand-500" />
                  Show "Most popular" badge
                </label>
              </Field>
              <Field label="Published" className="sm:col-span-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink/80 dark:text-white/80">
                  <input type="checkbox" checked={draft.isPublished !== false} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} className="h-4 w-4 accent-brand-500" />
                  Visible to users
                </label>
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-2xl bg-ink/5 px-4 py-2.5 text-sm font-bold text-ink/70 dark:bg-white/5 dark:text-white/70">
                Cancel
              </button>
              <button onClick={submit} className="rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white">
                {editing ? "Save changes" : "Create plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-base {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.07);
          background: #fafaf7;
          padding: 0 12px;
          font-size: 14px;
          color: #1a1138;
          outline: none;
        }
        .input-base:focus { border-color: rgba(110, 43, 255, 0.4); }
        .input-base:disabled { opacity: 0.6; }
        .dark .input-base { background: rgba(255,255,255,0.04); color: #fff; border-color: rgba(255,255,255,0.06); }
      `}</style>
    </AdminShell>
  );
}

function Field({
  label,
  children,
  className,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-ink/50 dark:text-white/50">
        {label}{disabled && " (locked)"}
      </span>
      {children}
    </label>
  );
}

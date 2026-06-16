import { useEffect, useState } from "react";
import Head from "next/head";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  studioAdminService,
  StudioTemplate,
  StudioCategory,
  StudioTemplateInput,
} from "@/services/studioAdminService";
import { useAppDispatch } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";

const CATEGORIES: StudioCategory[] = ["resume", "visiting_card", "qr_poster"];

const emptyDraft: StudioTemplateInput = {
  slug: "",
  name: "",
  category: "resume",
  description: "",
  width: 1200,
  height: 1600,
  primary_color: "#6E2BFF",
  accent_color: "#FF4D8D",
  html_template: "",
  is_premium: false,
  is_published: true,
};

export default function AdminStudio() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<StudioTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<StudioTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<StudioTemplateInput>(emptyDraft);

  const refresh = () => {
    setLoading(true);
    studioAdminService
      .list()
      .then((r) => setRows(r.data?.data ?? []))
      .catch(() => dispatch(pushToast("Failed to load templates", "error")))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [dispatch]);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setShowForm(true);
  };
  const openEdit = (t: StudioTemplate) => {
    setEditing(t);
    setDraft({
      slug: t.slug,
      name: t.name,
      category: t.category,
      description: t.description,
      width: t.width,
      height: t.height,
      primary_color: t.primary_color,
      accent_color: t.accent_color,
      html_template: t.html_template || "",
      is_premium: t.is_premium,
      is_published: t.is_published,
    });
    setShowForm(true);
  };

  const submit = async () => {
    try {
      if (editing) {
        await studioAdminService.update(editing.id, draft);
        dispatch(pushToast("Template updated", "success"));
      } else {
        await studioAdminService.create(draft);
        dispatch(pushToast("Template created", "success"));
      }
      setShowForm(false);
      refresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      dispatch(pushToast(err?.response?.data?.message || "Save failed", "error"));
    }
  };

  const togglePublish = async (t: StudioTemplate) => {
    try {
      await studioAdminService.update(t.id, { is_published: !t.is_published });
      refresh();
    } catch {
      dispatch(pushToast("Toggle failed", "error"));
    }
  };

  const remove = async (t: StudioTemplate) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    try {
      await studioAdminService.remove(t.id);
      dispatch(pushToast("Template deleted", "info"));
      refresh();
    } catch {
      dispatch(pushToast("Delete failed", "error"));
    }
  };

  return (
    <AdminShell title="Studio Templates">
      <Head>
        <title>Studio · ClickCard Admin</title>
      </Head>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/55 dark:text-white/55">
          Templates published here appear in the user-facing Studio.
        </p>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-soft">
          <Plus size={16} /> New template
        </button>
      </div>

      <div className="rounded-3xl border border-ink/[0.06] bg-white dark:border-white/[0.06] dark:bg-[#100b26]">
        {loading && rows.length === 0 ? (
          <div className="grid place-items-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
          </div>
        ) : rows.length === 0 ? (
          <div className="grid place-items-center py-16 text-sm text-ink/55 dark:text-white/55">
            No templates yet — click "New template".
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/[0.06] text-left text-xs uppercase tracking-wide text-ink/40 dark:border-white/[0.06]">
                <th className="p-4 font-bold">Template</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Colours</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-ink/[0.04] last:border-0 dark:border-white/[0.04]">
                  <td className="p-4">
                    <p className="font-bold text-ink dark:text-white">{t.name}</p>
                    <p className="text-xs text-ink/50">{t.slug}</p>
                  </td>
                  <td className="p-4 capitalize text-ink/70 dark:text-white/70">
                    {t.category.replace("_", " ")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded" style={{ background: t.primary_color }} />
                      <span className="h-5 w-5 rounded" style={{ background: t.accent_color }} />
                      {t.is_premium && (
                        <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          Pro
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {t.is_published ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">Live</span>
                    ) : (
                      <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-ink/60 dark:bg-white/5 dark:text-white/60">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => togglePublish(t)} className="inline-flex items-center gap-1 rounded-lg bg-ink/5 px-2 py-1.5 text-xs font-bold text-ink/70 transition hover:bg-ink/10 dark:bg-white/5 dark:text-white/70">
                        {t.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                        {t.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-white/10 dark:text-white">
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => remove(t)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-100 dark:bg-rose-500/10">
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
              {editing ? "Edit template" : "New template"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Slug" disabled={!!editing}>
                <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} disabled={!!editing} className="input-base" />
              </Field>
              <Field label="Name">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input-base" />
              </Field>
              <Field label="Category">
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as StudioCategory })} className="input-base">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </Field>
              <Field label="Premium">
                <select value={String(draft.is_premium)} onChange={(e) => setDraft({ ...draft, is_premium: e.target.value === "true" })} className="input-base">
                  <option value="false">Free</option>
                  <option value="true">Pro</option>
                </select>
              </Field>
              <Field label="Description">
                <input value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="input-base" />
              </Field>
              <Field label="Preview URL">
                <input value={draft.preview_url || ""} onChange={(e) => setDraft({ ...draft, preview_url: e.target.value })} className="input-base" placeholder="https://…" />
              </Field>
              <Field label="Width (px)">
                <input type="number" value={draft.width || 1200} onChange={(e) => setDraft({ ...draft, width: parseInt(e.target.value) })} className="input-base" />
              </Field>
              <Field label="Height (px)">
                <input type="number" value={draft.height || 1600} onChange={(e) => setDraft({ ...draft, height: parseInt(e.target.value) })} className="input-base" />
              </Field>
              <Field label="Primary colour">
                <input type="color" value={draft.primary_color || "#6E2BFF"} onChange={(e) => setDraft({ ...draft, primary_color: e.target.value })} className="h-10 w-full rounded-xl border border-ink/10 bg-white p-1 dark:border-white/10 dark:bg-white/5" />
              </Field>
              <Field label="Accent colour">
                <input type="color" value={draft.accent_color || "#FF4D8D"} onChange={(e) => setDraft({ ...draft, accent_color: e.target.value })} className="h-10 w-full rounded-xl border border-ink/10 bg-white p-1 dark:border-white/10 dark:bg-white/5" />
              </Field>
              <Field label="Published" className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink/80 dark:text-white/80">
                  <input type="checkbox" checked={!!draft.is_published} onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })} className="h-4 w-4 accent-brand-500" />
                  Visible to users in Studio
                </label>
              </Field>
              <Field label="HTML template (optional — uses category default if blank)" className="sm:col-span-2">
                <textarea
                  rows={6}
                  value={draft.html_template || ""}
                  onChange={(e) => setDraft({ ...draft, html_template: e.target.value })}
                  placeholder={"<div>{{fullName}} - {{tagline}}</div>\nVariables: fullName, tagline, bio, email, phone, website, city, bizName, publicUrl, qrUrl, primary, accent, experienceList, educationList, socialList"}
                  className="input-base h-32 font-mono text-xs"
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-2xl bg-ink/5 px-4 py-2.5 text-sm font-bold text-ink/70 dark:bg-white/5 dark:text-white/70">
                Cancel
              </button>
              <button onClick={submit} className="rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white">
                {editing ? "Save changes" : "Create template"}
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
        textarea.input-base { height: auto; padding: 10px 12px; }
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

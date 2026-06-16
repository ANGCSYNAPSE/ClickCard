import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Download,
  Share2,
  Palette,
  Sun,
  Moon,
  Save,
  Check,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import CardPreview from "@/components/app/CardPreview";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, saveProfile } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import {
  profileService,
  CardTemplate,
  CardRenderInput,
} from "@/services/profileService";

const FALLBACK_TEMPLATES: CardTemplate[] = [
  { id: "gradient-classic", name: "Gradient Classic", description: "Bold gradient header with rounded info card." },
  { id: "minimal-mono", name: "Minimal Mono", description: "Single-colour, lots of whitespace, magazine-clean." },
  { id: "split-modern", name: "Split Modern", description: "Two-column split — photo left, details right." },
  { id: "neon-dark", name: "Neon Dark", description: "Dark background, neon accents, futuristic." },
  { id: "corporate-premium", name: "Corporate Premium", description: "Subtle gradient, gold accents, executive." },
  { id: "playful-rounded", name: "Playful Rounded", description: "Soft shapes, candy colours, friendly." },
];

const PALETTES: { name: string; primary: string; accent: string }[] = [
  { name: "Brand", primary: "#6E2BFF", accent: "#FF4D8D" },
  { name: "Sunset", primary: "#FF6A3D", accent: "#FFB400" },
  { name: "Ocean", primary: "#0EA5E9", accent: "#22D3EE" },
  { name: "Forest", primary: "#10B981", accent: "#84CC16" },
  { name: "Royal", primary: "#1E40AF", accent: "#A855F7" },
  { name: "Midnight", primary: "#1F2937", accent: "#F472B6" },
];

export default function CardPage() {
  const guard = useRequireAuth();
  const dispatch = useAppDispatch();
  const { draft, user: profileUser, saving } = useAppSelector((s) => ({
    draft: s.profile.draft,
    user: s.auth.user,
    saving: s.profile.saving,
  }));

  const [templates, setTemplates] = useState<CardTemplate[]>(FALLBACK_TEMPLATES);
  const [templateId, setTemplateId] = useState<string>(
    draft.digitalCard?.templateId || "gradient-classic",
  );
  const [primary, setPrimary] = useState<string>(
    draft.digitalCard?.primaryColor || PALETTES[0].primary,
  );
  const [accent, setAccent] = useState<string>(
    draft.digitalCard?.accentColor || PALETTES[0].accent,
  );
  const [theme, setTheme] = useState<"light" | "dark">(
    (draft.digitalCard?.theme as "light" | "dark") || "light",
  );
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    profileService
      .listCardTemplates()
      .then((r) => {
        if (r.data?.data?.templates?.length) setTemplates(r.data.data.templates);
      })
      .catch(() => {
        /* keep fallback list */
      });
  }, [dispatch]);

  // Sync editor controls with whatever profile finishes loading
  useEffect(() => {
    if (draft.digitalCard?.templateId) setTemplateId(draft.digitalCard.templateId);
    if (draft.digitalCard?.primaryColor) setPrimary(draft.digitalCard.primaryColor);
    if (draft.digitalCard?.accentColor) setAccent(draft.digitalCard.accentColor);
    if (draft.digitalCard?.theme) setTheme(draft.digitalCard.theme as "light" | "dark");
  }, [draft.digitalCard]);

  const renderInput: CardRenderInput = useMemo(
    () => ({ templateId, primary, accent, theme }),
    [templateId, primary, accent, theme],
  );

  const onSave = async () => {
    const next = {
      ...draft,
      digitalCard: {
        templateId,
        primaryColor: primary,
        accentColor: accent,
        theme,
      },
    };
    const res = await dispatch(saveProfile({ profile: next }));
    if (saveProfile.fulfilled.match(res)) {
      dispatch(pushToast("Card design saved", "success"));
    } else {
      dispatch(pushToast("Save failed", "error"));
    }
  };

  const onDownload = async () => {
    setDownloading(true);
    try {
      const res = await profileService.downloadCardPdf(renderInput);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `card-${templateId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(pushToast("PDF downloaded", "success"));
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 503) {
        dispatch(pushToast("Server PDF rendering not configured yet — coming online soon.", "info"));
      } else {
        dispatch(pushToast("PDF download failed", "error"));
      }
    } finally {
      setDownloading(false);
    }
  };

  const onShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/${profileUser?.username || ""}`
        : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "My ClickCard", url });
        dispatch(pushToast("Shared", "success"));
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      dispatch(pushToast("Link copied", "success"));
    } catch {
      dispatch(pushToast(url, "info"));
    }
  };

  if (!guard) return null;

  return (
    <AppShell>
      <Head>
        <title>Digital Card · ClickCard</title>
      </Head>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-ink dark:text-white">Digital Card</h1>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Pick a template, customise colours, then share or download as PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onShare} className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white">
            <Share2 size={16} /> Share
          </button>
          <button onClick={onDownload} disabled={downloading} className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-95 disabled:opacity-60">
            <Download size={16} /> {downloading ? "Rendering…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* live preview */}
        <div className="grid place-items-center rounded-3xl border border-ink/5 bg-mist p-6 dark:border-white/5 dark:bg-white/[0.02]">
          <CardPreview
            templateId={templateId}
            primary={primary}
            accent={accent}
            theme={theme}
            profile={draft}
            username={profileUser?.username}
          />
        </div>

        {/* controls */}
        <div className="space-y-5">
          {/* templates */}
          <section className="rounded-3xl border border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-[#120d2e]">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-black uppercase tracking-wide text-ink/60 dark:text-white/60">
              <Sparkles size={14} className="text-brand-500" /> Template
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`rounded-2xl border p-3 text-left text-xs transition ${
                    templateId === t.id
                      ? "border-brand-400 bg-brand-50 shadow-soft dark:bg-brand-500/10"
                      : "border-ink/10 hover:border-brand-200 hover:bg-brand-50/50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink dark:text-white">{t.name}</span>
                    {templateId === t.id && <Check size={14} className="text-brand-500" />}
                  </div>
                  <p className="mt-1 text-[10px] text-ink/50 dark:text-white/50">{t.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* palettes */}
          <section className="rounded-3xl border border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-[#120d2e]">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-black uppercase tracking-wide text-ink/60 dark:text-white/60">
              <Palette size={14} className="text-brand-500" /> Palette
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PALETTES.map((p) => {
                const active = p.primary === primary && p.accent === accent;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setPrimary(p.primary);
                      setAccent(p.accent);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition ${
                      active ? "border-brand-400 shadow-soft" : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                    }`}
                  >
                    <div className="h-8 w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }} />
                    <span className="text-[10px] font-bold text-ink/70 dark:text-white/70">{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* manual pickers */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ColorPicker label="Primary" value={primary} onChange={setPrimary} />
              <ColorPicker label="Accent" value={accent} onChange={setAccent} />
            </div>
          </section>

          {/* theme */}
          <section className="rounded-3xl border border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-[#120d2e]">
            <h3 className="mb-3 font-display text-sm font-black uppercase tracking-wide text-ink/60 dark:text-white/60">
              Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${
                  theme === "light" ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10" : "border-ink/10 dark:border-white/10"
                }`}
              >
                <Sun size={16} /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${
                  theme === "dark" ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10" : "border-ink/10 dark:border-white/10"
                }`}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </section>

          <button onClick={onSave} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-95 disabled:opacity-60">
            <Save size={16} /> {saving ? "Saving…" : "Save card design"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-ink/10 bg-mist p-2.5 dark:border-white/10 dark:bg-white/[0.04]">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 cursor-pointer rounded-lg border border-ink/10 bg-transparent p-0 dark:border-white/10"
      />
      <span className="flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wide text-ink/50 dark:text-white/50">
          {label}
        </span>
        <span className="block font-mono text-xs font-bold text-ink dark:text-white">{value.toUpperCase()}</span>
      </span>
    </label>
  );
}

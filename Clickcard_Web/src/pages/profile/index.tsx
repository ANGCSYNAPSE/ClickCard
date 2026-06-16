import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import {
  User as UserIcon,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  Package,
  Link2,
  Save,
  Camera,
  Plus,
  Trash2,
  Globe,
  Lock,
  Eye,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProfilePreview from "@/components/app/ProfilePreview";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  saveProfile,
  updateSection,
  setVisibility,
} from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import type {
  EducationItem,
  ExperienceItem,
  ProductItem,
  SocialLink,
  FullProfile,
} from "@/types";

type SectionKey =
  | "personal"
  | "contact"
  | "education"
  | "experience"
  | "business"
  | "products"
  | "social";

const SECTIONS: { key: SectionKey; label: string; icon: typeof UserIcon }[] = [
  { key: "personal", label: "Personal", icon: UserIcon },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "business", label: "Business", icon: Building2 },
  { key: "products", label: "Products", icon: Package },
  { key: "social", label: "Social links", icon: Link2 },
];

export default function ProfileEditorPage() {
  const dispatch = useAppDispatch();
  const { draft, saving, isPublic, status } = useAppSelector((s) => s.profile);
  const [active, setActive] = useState<SectionKey>("personal");
  const [picture, setPicture] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  const patch = <K extends keyof FullProfile>(section: K, value: FullProfile[K]) =>
    dispatch(updateSection({ section, value }));

  const onPickPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPicture(f);
    setPictureUrl(URL.createObjectURL(f));
  };

  const onSave = async () => {
    const res = await dispatch(saveProfile({ profile: draft, picture }));
    if (saveProfile.fulfilled.match(res)) {
      dispatch(pushToast("Profile saved 🎉", "success"));
      setPicture(null);
    } else {
      dispatch(pushToast((res.payload as string) || "Could not save", "error"));
    }
  };

  const toggleVisibility = async () => {
    const res = await dispatch(setVisibility(!isPublic));
    if (setVisibility.fulfilled.match(res))
      dispatch(
        pushToast(res.payload ? "Profile is now public" : "Profile is now private", "success"),
      );
  };

  const previewAvatar = pictureUrl || draft.personal?.profilePicture;

  return (
    <AppShell>
      <Head>
        <title>Profile editor · ClickCard</title>
      </Head>

      {/* header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-ink dark:text-white">
            Profile editor
          </h1>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Build your public page. Changes preview live on the right.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVisibility}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
              isPublic
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                : "bg-ink/5 text-ink/60 dark:bg-white/5 dark:text-white/60"
            }`}
          >
            {isPublic ? <Globe size={15} /> : <Lock size={15} />}
            {isPublic ? "Public" : "Private"}
          </button>
          <Button onClick={onSave} loading={saving}>
            <Save size={17} /> Save changes
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* editor */}
        <div>
          {/* section tabs */}
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  active === s.key
                    ? "bg-brand-gradient text-white shadow-soft"
                    : "bg-white text-ink/60 ring-1 ring-ink/[0.06] hover:text-brand-600 dark:bg-[#100b26] dark:text-white/60 dark:ring-white/[0.06]"
                }`}
              >
                <s.icon size={15} /> {s.label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#100b26]">
            {active === "personal" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-brand-gradient text-2xl font-black text-white">
                      {previewAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (draft.personal?.fullName || "Y")[0].toUpperCase()
                      )}
                    </span>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-xl bg-white text-brand-600 shadow-card ring-1 ring-ink/5 dark:bg-[#1a1340] dark:text-white"
                      aria-label="Upload photo"
                    >
                      <Camera size={15} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPicture} />
                  </div>
                  <div className="text-sm text-ink/55 dark:text-white/55">
                    Upload a profile photo
                    <br />
                    <span className="text-xs">JPG or PNG, square works best.</span>
                  </div>
                </div>
                <Input
                  label="Full name"
                  placeholder="Aarav Mehta"
                  value={draft.personal?.fullName || ""}
                  onChange={(e) => patch("personal", { ...draft.personal, fullName: e.target.value })}
                />
                <Input
                  label="Tagline"
                  placeholder="Product Designer · Freelance"
                  value={draft.personal?.tagline || ""}
                  onChange={(e) => patch("personal", { ...draft.personal, tagline: e.target.value })}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A short intro about you…"
                    value={draft.personal?.bio || ""}
                    onChange={(e) => patch("personal", { ...draft.personal, bio: e.target.value })}
                    className="w-full rounded-2xl border-2 border-brand-100 bg-white p-4 text-sm font-medium text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>
            )}

            {active === "contact" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["email", "Email", "you@example.com"],
                    ["phone", "Phone", "+91 98765 43210"],
                    ["whatsapp", "WhatsApp", "+91 98765 43210"],
                    ["website", "Website", "https://yoursite.com"],
                    ["city", "City", "Mumbai"],
                    ["country", "Country", "India"],
                  ] as const
                ).map(([k, label, ph]) => (
                  <Input
                    key={k}
                    label={label}
                    placeholder={ph}
                    value={(draft.contact?.[k] as string) || ""}
                    onChange={(e) => patch("contact", { ...draft.contact, [k]: e.target.value })}
                  />
                ))}
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    placeholder="Street, area…"
                    value={draft.contact?.address || ""}
                    onChange={(e) => patch("contact", { ...draft.contact, address: e.target.value })}
                  />
                </div>
              </div>
            )}

            {active === "education" && (
              <ListEditor<EducationItem>
                items={draft.education || []}
                onChange={(v) => patch("education", v)}
                empty="No education added yet."
                blank={{ institution: "", degree: "", field: "", startYear: "", endYear: "" }}
                addLabel="Add education"
                render={(item, set) => (
                  <>
                    <Input label="Institution" value={item.institution} onChange={(e) => set({ institution: e.target.value })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Degree" value={item.degree || ""} onChange={(e) => set({ degree: e.target.value })} />
                      <Input label="Field" value={item.field || ""} onChange={(e) => set({ field: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Start year" value={item.startYear || ""} onChange={(e) => set({ startYear: e.target.value })} />
                      <Input label="End year" value={item.endYear || ""} onChange={(e) => set({ endYear: e.target.value })} />
                    </div>
                  </>
                )}
              />
            )}

            {active === "experience" && (
              <ListEditor<ExperienceItem>
                items={draft.experience || []}
                onChange={(v) => patch("experience", v)}
                empty="No work experience added yet."
                blank={{ company: "", role: "", location: "", startDate: "", endDate: "" }}
                addLabel="Add experience"
                render={(item, set) => (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Company" value={item.company} onChange={(e) => set({ company: e.target.value })} />
                      <Input label="Role" value={item.role || ""} onChange={(e) => set({ role: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Start" placeholder="Jan 2022" value={item.startDate || ""} onChange={(e) => set({ startDate: e.target.value })} />
                      <Input label="End" placeholder="Present" value={item.endDate || ""} onChange={(e) => set({ endDate: e.target.value })} />
                    </div>
                  </>
                )}
              />
            )}

            {active === "business" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Business name" value={draft.business?.name || ""} onChange={(e) => patch("business", { ...draft.business, name: e.target.value })} />
                  <Input label="Category" placeholder="Café, Studio…" value={draft.business?.category || ""} onChange={(e) => patch("business", { ...draft.business, category: e.target.value })} />
                </div>
                <Input label="Map URL" placeholder="https://maps.google.com/…" value={draft.business?.mapUrl || ""} onChange={(e) => patch("business", { ...draft.business, mapUrl: e.target.value })} />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">Description</label>
                  <textarea
                    rows={3}
                    value={draft.business?.description || ""}
                    onChange={(e) => patch("business", { ...draft.business, description: e.target.value })}
                    className="w-full rounded-2xl border-2 border-brand-100 bg-white p-4 text-sm font-medium text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>
            )}

            {active === "products" && (
              <ListEditor<ProductItem>
                items={draft.products || []}
                onChange={(v) => patch("products", v)}
                empty="No products or services yet."
                blank={{ name: "", price: "", description: "", link: "" }}
                addLabel="Add product"
                render={(item, set) => (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Name" value={item.name} onChange={(e) => set({ name: e.target.value })} />
                      <Input label="Price" placeholder="₹499" value={item.price || ""} onChange={(e) => set({ price: e.target.value })} />
                    </div>
                    <Input label="Link" placeholder="https://…" value={item.link || ""} onChange={(e) => set({ link: e.target.value })} />
                  </>
                )}
              />
            )}

            {active === "social" && (
              <ListEditor<SocialLink>
                items={draft.social || []}
                onChange={(v) => patch("social", v)}
                empty="No social links yet."
                blank={{ platform: "", url: "", visible: true }}
                addLabel="Add link"
                render={(item, set) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Platform" placeholder="Instagram, GitHub…" value={item.platform} onChange={(e) => set({ platform: e.target.value })} />
                    <Input label="URL" placeholder="https://…" value={item.url} onChange={(e) => set({ url: e.target.value })} />
                  </div>
                )}
              />
            )}
          </div>
        </div>

        {/* live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-white/40">
            <Eye size={13} /> Live preview
          </div>
          <ProfilePreview profile={draft} avatarUrl={previewAvatar} />
        </div>
      </div>
    </AppShell>
  );
}

/* ---- generic repeatable list editor ---- */
function ListEditor<T extends object>({
  items,
  onChange,
  render,
  blank,
  addLabel,
  empty,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, set: (patch: Partial<T>) => void) => React.ReactNode;
  blank: T;
  addLabel: string;
  empty: string;
}) {
  const update = (i: number, p: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-2xl bg-mist py-8 text-center text-sm text-ink/45 dark:bg-white/[0.03] dark:text-white/45">
          {empty}
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="relative space-y-3 rounded-2xl bg-mist p-4 dark:bg-white/[0.03]">
          <button
            onClick={() => remove(i)}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
            aria-label="Remove"
          >
            <Trash2 size={15} />
          </button>
          {render(item, (p) => update(i, p))}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { ...blank }])}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 py-3 text-sm font-bold text-brand-600 transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

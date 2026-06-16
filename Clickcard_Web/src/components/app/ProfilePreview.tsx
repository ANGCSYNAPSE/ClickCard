import { Phone, MessageCircle, Mail, Globe, ExternalLink } from "lucide-react";
import type { FullProfile } from "@/types";

/** A phone-framed, Linktree-style render of the profile draft. */
export default function ProfilePreview({
  profile,
  avatarUrl,
}: {
  profile: FullProfile;
  avatarUrl?: string;
}) {
  const name = profile.personal?.fullName || "Your name";
  const tagline = profile.personal?.tagline || "Your tagline";
  const bio = profile.personal?.bio;
  const c = profile.contact || {};
  const socials = (profile.social || []).filter((s) => s.url);

  const actions = [
    c.phone && { icon: Phone, label: "Call", tint: "text-emerald-500" },
    c.whatsapp && { icon: MessageCircle, label: "WhatsApp", tint: "text-green-500" },
    c.email && { icon: Mail, label: "Email", tint: "text-brand-500" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; tint: string }[];

  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2.2rem] bg-ink p-2.5 shadow-float dark:bg-black">
      <div className="overflow-hidden rounded-[1.8rem] bg-white dark:bg-[#15102e]">
        {/* cover */}
        <div className="relative h-24 bg-brand-gradient">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <span className="absolute -bottom-9 left-1/2 grid h-[72px] w-[72px] -translate-x-1/2 place-items-center overflow-hidden rounded-2xl bg-white text-xl font-black text-brand-600 shadow-card ring-4 ring-white dark:ring-[#15102e]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              name[0]?.toUpperCase() || "Y"
            )}
          </span>
        </div>

        <div className="px-4 pb-5 pt-11 text-center">
          <h3 className="font-display text-lg font-black text-ink dark:text-white">
            {name}
          </h3>
          <p className="text-xs font-semibold text-brand-600">{tagline}</p>
          {bio && (
            <p className="mt-2 text-[11px] leading-relaxed text-ink/55 dark:text-white/55">
              {bio}
            </p>
          )}

          {/* action buttons */}
          {actions.length > 0 && (
            <div className="mt-4 flex justify-center gap-2">
              {actions.map((a) => (
                <div
                  key={a.label}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-mist py-2 dark:bg-white/5"
                >
                  <a.icon size={16} className={a.tint} />
                  <span className="text-[10px] font-bold text-ink/60 dark:text-white/60">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* website */}
          {c.website && (
            <Block icon={Globe} label="Website" />
          )}

          {/* social link blocks */}
          <div className="mt-3 space-y-2">
            {socials.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink/10 py-3 text-[11px] text-ink/35 dark:border-white/10 dark:text-white/35">
                Your links appear here
              </p>
            ) : (
              socials.map((s, i) => (
                <Block key={i} icon={ExternalLink} label={s.platform || "Link"} />
              ))
            )}
          </div>

          {/* section chips */}
          <SectionChips profile={profile} />
        </div>
      </div>
    </div>
  );
}

function Block({ icon: Icon, label }: { icon: typeof Globe; label: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-50 to-candy-pink/10 px-3 py-2.5 text-left dark:from-white/5 dark:to-white/[0.02]">
      <Icon size={14} className="text-brand-500" />
      <span className="truncate text-xs font-bold text-ink dark:text-white">
        {label}
      </span>
    </div>
  );
}

function SectionChips({ profile }: { profile: FullProfile }) {
  const chips = [
    (profile.experience?.length ?? 0) > 0 && `${profile.experience!.length} experience`,
    (profile.education?.length ?? 0) > 0 && `${profile.education!.length} education`,
    (profile.products?.length ?? 0) > 0 && `${profile.products!.length} products`,
    profile.business?.name && "business",
  ].filter(Boolean) as string[];

  if (chips.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
      {chips.map((c) => (
        <span
          key={c}
          className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold capitalize text-ink/55 dark:bg-white/5 dark:text-white/55"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

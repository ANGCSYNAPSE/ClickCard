import { CSSProperties } from "react";
import { Phone, Mail, Globe, MessageCircle, MapPin, ExternalLink, QrCode } from "lucide-react";
import type { FullProfile } from "@/types";

/**
 * Lightweight client-side preview of the 6 digital card templates. Visually
 * matches CardTemplateService.js on the BE so the rendered PDF is recognisable
 * from the preview. Intentionally not a 1:1 copy of every pixel — the BE PDF is
 * the source of truth for download.
 */
export default function CardPreview({
  templateId,
  primary,
  accent,
  theme,
  profile,
  username,
}: {
  templateId: string;
  primary: string;
  accent: string;
  theme: "light" | "dark";
  profile: FullProfile;
  username?: string | null;
}) {
  const p = profile.personal || {};
  const c = profile.contact || {};
  const social = (profile.social || []).filter((s) => s.url);
  const biz = profile.business || {};
  const fullName = p.fullName || "Your name";
  const initials = fullName.trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "Y";
  const publicUrl = username
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://clickcard.app"}/${username}`
    : "";

  const isDark = theme === "dark" || templateId === "neon-dark";
  const bg = isDark ? "#0b0820" : "#ffffff";
  const fg = isDark ? "#f7f5ff" : "#1a1138";
  const subtle = isDark ? "#aaa3c7" : "#5b5380";
  const surface = isDark ? "rgba(255,255,255,0.06)" : "#f7f4ff";

  const cardStyle: CSSProperties = {
    background: bg,
    color: fg,
    borderRadius: 24,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
    boxShadow: "0 30px 60px -20px rgba(20,10,60,0.18)",
  };

  const contact = [
    c.phone && { icon: Phone, label: c.phone },
    c.whatsapp && { icon: MessageCircle, label: c.whatsapp },
    c.email && { icon: Mail, label: c.email },
    c.website && { icon: Globe, label: c.website },
    (c.city || c.country) && { icon: MapPin, label: [c.city, c.country].filter(Boolean).join(", ") },
  ].filter(Boolean) as { icon: typeof Phone; label: string }[];

  const Row = ({ icon: Icon, label }: { icon: typeof Phone; label: string }) => (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
      style={{ background: surface, color: fg }}>
      <Icon size={13} style={{ color: accent }} />
      <span className="truncate">{label}</span>
    </div>
  );

  const Avatar = ({ size = 80 }: { size?: number }) => (
    <div
      className="grid place-items-center overflow-hidden rounded-full font-black"
      style={{
        width: size,
        height: size,
        background: surface,
        color: primary,
        fontSize: size * 0.36,
        border: `4px solid ${bg}`,
      }}
    >
      {p.profilePicture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.profilePicture} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );

  const Footer = () => (
    <div className="mt-4 text-center text-[10px]" style={{ color: subtle }}>
      {publicUrl || "clickcard.app"}
    </div>
  );

  // --- template variants ---

  if (templateId === "minimal-mono") {
    return (
      <div style={cardStyle} className="p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primary }}>
              {biz.name || "Digital Card"}
            </div>
            <h2 className="mt-4 font-display text-3xl font-black">{fullName}</h2>
            {p.tagline && <p className="mt-1 text-sm" style={{ color: subtle }}>{p.tagline}</p>}
          </div>
          <Avatar size={56} />
        </div>
        <div className="my-5 h-0.5 w-12" style={{ background: primary }} />
        {p.bio && <p className="text-xs leading-relaxed" style={{ color: subtle }}>{p.bio}</p>}
        <div className="mt-4 space-y-1.5">{contact.map((r, i) => <Row key={i} {...r} />)}</div>
        <Footer />
      </div>
    );
  }

  if (templateId === "split-modern") {
    return (
      <div style={cardStyle} className="flex">
        <div className="flex w-1/3 flex-col items-center gap-3 p-4 text-white"
          style={{ background: `linear-gradient(180deg, ${primary}, ${accent})` }}>
          <Avatar size={64} />
          <h3 className="text-center text-sm font-black leading-tight">{fullName}</h3>
          {p.tagline && (
            <div className="text-center text-[9px] font-black uppercase tracking-wider opacity-90">{p.tagline}</div>
          )}
          <div className="mt-auto grid h-14 w-14 place-items-center rounded-md bg-white text-ink">
            <QrCode size={36} />
          </div>
        </div>
        <div className="flex-1 p-4">
          {biz.name && (
            <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: primary }}>
              {biz.name}{biz.category ? ` · ${biz.category}` : ""}
            </div>
          )}
          {p.bio && <p className="mt-2 text-[11px]" style={{ color: subtle }}>{p.bio}</p>}
          <div className="mt-3 space-y-1.5">{contact.map((r, i) => <Row key={i} {...r} />)}</div>
        </div>
      </div>
    );
  }

  if (templateId === "neon-dark") {
    return (
      <div style={{ ...cardStyle, background: "#08051a", color: "#e8e3ff", border: "1px solid rgba(255,255,255,0.08)" }} className="p-5">
        <div className="h-24 rounded-2xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${primary}cc, transparent 60%), radial-gradient(circle at 70% 70%, ${accent}cc, transparent 60%), #08051a`,
          }} />
        <div className="-mt-10 flex justify-center"><Avatar size={72} /></div>
        <div className="mt-3 text-center">
          <h2 className="font-display text-xl font-black text-white">{fullName}</h2>
          {p.tagline && <div className="mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>{p.tagline}</div>}
          {p.bio && <p className="mt-2 text-[11px]" style={{ color: "#aaa3c7" }}>{p.bio}</p>}
        </div>
        <div className="mt-4 space-y-1.5">{contact.map((r, i) => <Row key={i} {...r} />)}</div>
        <Footer />
      </div>
    );
  }

  if (templateId === "corporate-premium") {
    return (
      <div style={{ ...cardStyle, background: "#fcfbf7", color: "#1f1a36" }} className="p-6">
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: `2px solid ${primary}` }}>
          <div>
            {biz.name && (
              <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: primary }}>{biz.name}</div>
            )}
            <h2 className="mt-1 text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>{fullName}</h2>
            {p.tagline && <div className="italic" style={{ color: "#5b5380" }}>{p.tagline}</div>}
          </div>
          <Avatar size={64} />
        </div>
        {p.bio && <p className="mt-4 text-xs italic" style={{ color: "#5b5380" }}>{p.bio}</p>}
        <div className="mt-4 space-y-1.5">{contact.map((r, i) => <Row key={i} {...r} />)}</div>
        <Footer />
      </div>
    );
  }

  if (templateId === "playful-rounded") {
    return (
      <div style={{ ...cardStyle, background: "linear-gradient(135deg, #fff7fb, #f3eeff)" }} className="p-5">
        <div className="rounded-3xl bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar size={56} />
            <div>
              <h2 className="font-display text-lg font-black text-ink">{fullName}</h2>
              {p.tagline && <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>{p.tagline}</div>}
            </div>
          </div>
          {p.bio && <p className="mt-3 text-xs" style={{ color: subtle }}>{p.bio}</p>}
        </div>
        <div className="mt-3 space-y-1.5">{contact.map((r, i) => <Row key={i} {...r} />)}</div>
        <Footer />
      </div>
    );
  }

  // default: gradient-classic
  return (
    <div style={cardStyle}>
      <div className="h-24"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }} />
      <div className="-mt-10 flex justify-center"><Avatar size={80} /></div>
      <div className="px-6 pb-6 pt-3 text-center">
        <h2 className="font-display text-xl font-black">{fullName}</h2>
        {p.tagline && (
          <div className="mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: primary }}>
            {p.tagline}
          </div>
        )}
        {p.bio && <p className="mt-2 text-[11px]" style={{ color: subtle }}>{p.bio}</p>}
        <div className="mt-4 space-y-1.5 text-left">{contact.map((r, i) => <Row key={i} {...r} />)}</div>
        {social.length > 0 && (
          <div className="mt-3 space-y-1.5 text-left">
            {social.slice(0, 4).map((s, i) => (
              <Row key={i} icon={ExternalLink} label={`${s.platform || "Link"} · ${s.url}`} />
            ))}
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

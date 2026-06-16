import { useMemo } from "react";
import {
  Phone,
  Mail,
  Globe,
  MessageCircle,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Package,
  Building2,
  FileDown,
  QrCode,
  Sparkles,
} from "lucide-react";
import type { FullProfile } from "@/types";

interface Row {
  id: string;
  icon: typeof Phone;
  label: string;
  sub?: string;
  tint: string;
}

// Lucide v1 (installed) doesn't export branded social icons, so we fall back to
// ExternalLink everywhere and rely on the platform label + tint to differentiate.
const SOCIAL_ICONS: Record<string, typeof Phone> = {};

/**
 * A skinny phone-frame live preview that scrolls through the user's added items
 * (contact, social, experience, etc.) as a feed of icon rows that updates as
 * the user edits their profile.
 */
export default function LiveProfileFeed({
  profile,
  username,
}: {
  profile: FullProfile;
  username?: string | null;
}) {
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const c = profile.contact || {};
    const p = profile.personal || {};

    if (p.fullName) {
      out.push({ id: "name", icon: Sparkles, label: p.fullName, sub: p.tagline, tint: "from-brand-500 to-candy-pink" });
    }
    if (c.phone) out.push({ id: "phone", icon: Phone, label: "Call", sub: c.phone, tint: "from-emerald-400 to-emerald-600" });
    if (c.whatsapp) out.push({ id: "wa", icon: MessageCircle, label: "WhatsApp", sub: c.whatsapp, tint: "from-green-400 to-green-600" });
    if (c.email) out.push({ id: "email", icon: Mail, label: "Email", sub: c.email, tint: "from-brand-500 to-candy-cyan" });
    if (c.website) out.push({ id: "web", icon: Globe, label: "Website", sub: c.website, tint: "from-candy-cyan to-brand-600" });

    (profile.social || []).forEach((s, i) => {
      if (!s.url) return;
      const key = (s.platform || "").toLowerCase();
      const Icon = SOCIAL_ICONS[key] || ExternalLink;
      out.push({
        id: `s-${i}`,
        icon: Icon,
        label: s.platform || "Link",
        sub: s.url,
        tint: "from-candy-pink to-candy-orange",
      });
    });

    (profile.experience || []).forEach((e, i) => {
      out.push({
        id: `e-${i}`,
        icon: Briefcase,
        label: e.role || "Experience",
        sub: e.company,
        tint: "from-indigo-400 to-brand-600",
      });
    });
    (profile.education || []).forEach((e, i) => {
      out.push({
        id: `ed-${i}`,
        icon: GraduationCap,
        label: e.institution || "Education",
        sub: e.degree,
        tint: "from-violet-400 to-brand-600",
      });
    });
    (profile.products || []).forEach((p2, i) => {
      out.push({
        id: `p-${i}`,
        icon: Package,
        label: p2.name || "Product",
        sub: p2.price ? `₹ ${p2.price}` : undefined,
        tint: "from-candy-orange to-candy-yellow",
      });
    });
    if (profile.business?.name) {
      out.push({
        id: "biz",
        icon: Building2,
        label: profile.business.name,
        sub: profile.business.category || profile.business.description,
        tint: "from-rose-400 to-candy-pink",
      });
    }

    // Always show share + download capability rows
    out.push({ id: "qr", icon: QrCode, label: "QR card", sub: "share & scan", tint: "from-ink to-brand-700" });
    out.push({ id: "pdf", icon: FileDown, label: "Resume PDF", sub: "download", tint: "from-brand-500 to-candy-cyan" });

    return out;
  }, [profile]);

  // duplicate rows for seamless marquee
  const loop = useMemo(() => [...rows, ...rows], [rows]);
  const duration = Math.max(rows.length * 1.8, 14);

  return (
    <div className="relative mx-auto w-full max-w-[300px] rounded-[2.2rem] bg-ink p-2.5 shadow-float dark:bg-black">
      <div className="overflow-hidden rounded-[1.8rem] bg-white dark:bg-[#15102e]">
        {/* status bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-500 to-candy-pink px-4 pb-1.5 pt-2 text-[10px] font-bold text-white/90">
          <span>9:41</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">LIVE</span>
        </div>

        {/* header */}
        <div className="flex items-center gap-2 px-3 pb-2 pt-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-xs font-black text-white">
            {(profile.personal?.fullName || username || "Y")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-ink dark:text-white">
              {profile.personal?.fullName || "Your name"}
            </p>
            <p className="truncate text-[10px] font-semibold text-brand-600">
              clickcard.app/{username ?? "you"}
            </p>
          </div>
        </div>

        {/* scrolling feed */}
        <div className="relative h-[330px] overflow-hidden bg-mist/40 dark:bg-white/[0.02]">
          <div
            className="flex flex-col gap-2 px-3 py-3"
            style={{
              animation: `clickcard-marquee ${duration}s linear infinite`,
            }}
          >
            {loop.map((r, i) => (
              <FeedRow key={`${r.id}-${i}`} row={r} />
            ))}
          </div>
          {/* fade overlays */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent dark:from-[#15102e]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-[#15102e]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes clickcard-marquee {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function FeedRow({ row }: { row: Row }) {
  const Icon = row.icon;
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-2.5 py-2 shadow-soft dark:bg-white/5">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${row.tint} text-white`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-black text-ink dark:text-white">
          {row.label}
        </p>
        {row.sub && (
          <p className="truncate text-[9px] font-semibold text-ink/55 dark:text-white/55">
            {row.sub}
          </p>
        )}
      </div>
      <ExternalLink size={12} className="text-ink/30" />
    </div>
  );
}

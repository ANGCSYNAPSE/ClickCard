import { ArrowUpRight, QrCode } from "lucide-react";

export default function BizCard({
  name = "Ivano Ermakov",
  role = "Graphic Designer",
  handle = "clickcard.app/ivano",
  gradient = "linear-gradient(135deg,#7c3aed,#ff5db1 60%,#ff9d4d)",
  cta,
  className = "",
}: {
  name?: string;
  role?: string;
  handle?: string;
  gradient?: string;
  cta?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[1.6/1] w-full overflow-hidden rounded-3xl p-5 text-white shadow-card ${className}`}
      style={{ background: gradient }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-xl" />
      <div className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-black/10 blur-xl" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-10 place-items-center rounded-xl bg-white font-display text-sm font-black text-brand-600 shadow-sm tracking-tight">
            CK
          </div>
          <span className="text-xs font-bold tracking-widest uppercase opacity-85">ClickCard</span>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm">
          <QrCode className="h-8 w-8 text-ink" />
        </div>
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="font-display text-2xl font-bold leading-tight">{name}</p>
        <p className="text-sm font-medium opacity-90">{role}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold opacity-80">{handle}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
            {cta ?? "View"} <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

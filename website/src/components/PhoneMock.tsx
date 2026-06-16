import { Eye, Link2, MessageCircle, Phone, Share2 } from "lucide-react";

export default function PhoneMock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-[270px] rounded-[2.6rem] border-[10px] border-ink bg-ink p-0 shadow-float ${className}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
      <div className="overflow-hidden rounded-[2rem] bg-mist">
        {/* cover */}
        <div className="relative h-24 bg-brand-gradient">
          <div className="absolute -bottom-7 left-5 h-16 w-16 overflow-hidden rounded-2xl border-4 border-white bg-white">
            <img
              src="https://i.pravatar.cc/160?img=12"
              alt="Ivano Ermakov"
              className="h-full w-full object-cover"
            />
          </div>
          <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-5 pt-9">
          <p className="font-display text-base font-bold text-ink">Ivano Ermakov</p>
          <p className="text-xs text-ink/60">Graphic Designer · Freelance</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-brand-600">
            <Link2 className="h-3 w-3" /> clickcard.app/ivano
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { i: Phone, l: "Call", c: "bg-candy-cyan/20 text-candy-cyan" },
              { i: MessageCircle, l: "WhatsApp", c: "bg-candy-lime/25 text-[#65a30d]" },
              { i: Eye, l: "12.4k", c: "bg-candy-pink/20 text-candy-pink" },
            ].map((b, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 rounded-2xl py-2 ${b.c}`}>
                <b.i className="h-4 w-4" />
                <span className="text-[10px] font-semibold">{b.l}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {[
              { t: "Portfolio", g: "from-brand-500 to-candy-cyan" },
              { t: "Behance", g: "from-candy-pink to-candy-orange" },
              { t: "Book a call", g: "from-candy-lime to-candy-cyan" },
            ].map((row) => (
              <div
                key={row.t}
                className={`flex items-center justify-between rounded-2xl bg-gradient-to-r ${row.g} px-4 py-3 text-xs font-semibold text-white shadow-soft`}
              >
                {row.t}
                <span className="opacity-80">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

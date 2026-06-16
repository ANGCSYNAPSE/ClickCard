"use client";
import { motion } from "framer-motion";
import { Crown, Lock, Phone, QrCode, Sparkles } from "lucide-react";
import { templates, WEBAPP_URL, PLANS_URL, type TemplateCard } from "@/lib/site";

/* ---------- four distinct template designs ---------- */

function VisitingCardDesign({ t }: { t: TemplateCard }) {
  return (
    <div className="flex h-full flex-col justify-between p-5 text-white">
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-white/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
          {t.kind}
        </span>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white">
          <QrCode className="h-6 w-6 text-ink" />
        </div>
      </div>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.avatar} alt={t.person} className="h-12 w-12 rounded-xl border-2 border-white/70 object-cover" />
        <p className="mt-2 font-display text-lg font-bold leading-tight">{t.person}</p>
        <p className="text-[11px] font-medium text-white/85">{t.role}</p>
        <div className="mt-2 space-y-0.5">
          {t.meta.map((m) => (
            <p key={m} className="flex items-center gap-1 text-[10px] text-white/80">
              <Phone className="h-2.5 w-2.5" /> {m}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResumeDesign({ t }: { t: TemplateCard }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 p-4 text-white" style={{ background: t.gradient }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.avatar} alt={t.person} className="h-11 w-11 rounded-full border-2 border-white object-cover" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">{t.person}</p>
          <p className="truncate text-[10px] text-white/85">{t.role}</p>
        </div>
      </div>
      <div className="flex-1 p-4">
        <p className="text-[9px] font-bold uppercase tracking-wider text-ink/40">Skills</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {t.meta.map((m) => (
            <span key={m} className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${t.accent}22`, color: t.accent }}>
              {m}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-ink/40">Experience</p>
        <div className="mt-1.5 space-y-1.5">
          <div className="h-2 w-full rounded-full bg-ink/10" />
          <div className="h-2 w-4/5 rounded-full bg-ink/10" />
          <div className="h-2 w-3/5 rounded-full bg-ink/10" />
        </div>
      </div>
    </div>
  );
}

function ProfileDesign({ t }: { t: TemplateCard }) {
  return (
    <div className="flex h-full flex-col items-center p-5 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={t.avatar} alt={t.person} className="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow-lg" />
      <p className="mt-2 font-display text-base font-bold">{t.person}</p>
      <p className="text-[11px] text-white/85">{t.role}</p>
      <div className="mt-3 w-full space-y-1.5">
        {t.meta.map((m) => (
          <div key={m} className="flex items-center justify-center rounded-xl bg-white/20 py-2 text-[11px] font-semibold backdrop-blur">
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function QrPosterDesign({ t }: { t: TemplateCard }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-5 text-white">
      <span className="rounded-full bg-white/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">{t.kind}</span>
      <div className="mt-3 grid h-24 w-24 place-items-center rounded-2xl bg-white">
        <QrCode className="h-20 w-20 text-ink" />
      </div>
      <p className="mt-3 font-display text-base font-bold">{t.person}</p>
      <p className="text-[11px] text-white/90">{t.role}</p>
      {t.meta[0] && <span className="mt-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold">{t.meta[0]}</span>}
    </div>
  );
}

function TemplatePreview({ t }: { t: TemplateCard }) {
  const isLight = t.kind === "Resume";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]" style={{ background: isLight ? "#fff" : t.gradient }}>
      {t.kind === "Visiting Card" && <VisitingCardDesign t={t} />}
      {t.kind === "Resume" && <ResumeDesign t={t} />}
      {t.kind === "Profile" && <ProfileDesign t={t} />}
      {t.kind === "QR Poster" && <QrPosterDesign t={t} />}

      {t.premium && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-candy-yellow backdrop-blur">
          <Crown className="h-3 w-3" /> Pro
        </span>
      )}
    </div>
  );
}

function TemplateChip({ t }: { t: TemplateCard }) {
  const href = t.premium ? PLANS_URL : WEBAPP_URL;
  return (
    <a
      href={href}
      className="group relative aspect-[3/4.6] w-[230px] shrink-0 rounded-[1.6rem] shadow-card ring-2 ring-transparent transition-all duration-300 hover:-translate-y-2 hover:ring-brand-400"
    >
      <TemplatePreview t={t} />
      {t.premium && (
        <div className="absolute inset-0 grid place-items-center rounded-[1.6rem] bg-ink/0 opacity-0 transition group-hover:bg-ink/45 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-glow">
            <Lock className="h-3.5 w-3.5" /> Unlock with Pro
          </span>
        </div>
      )}
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-ink/60">
        {t.name}
      </span>
    </a>
  );
}

/* ---------- the section ---------- */

export default function TemplateRail() {
  const loop = [...templates, ...templates];
  const premium = templates.filter((t) => t.premium);

  return (
    <section id="templates" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-mist to-white" />

      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            Card Studio
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Pick a template. <span className="text-gradient">Make it yours.</span>
          </h2>
          <p className="mt-4 text-lg text-ink/60">
            Visiting cards, resumes, profiles & QR posters — each design fully ready. Hover to pause.
          </p>
        </motion.div>
      </div>

      {/* auto-scrolling, centered marquee */}
      <div className="marquee-pause relative mt-16">
        {/* edge fades keep focus centered */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-mist to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-mist to-transparent" />
        <div className="overflow-hidden py-4">
          <div className="animate-marquee flex w-max gap-7 pb-8">
            {loop.map((t, i) => (
              <TemplateChip key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* premium teaser — half-screen showy blurred premium deck */}
      <div className="mx-auto mt-12 max-w-6xl px-5">
        <div className="relative h-[46vh] min-h-[360px] overflow-hidden rounded-[2.5rem] bg-ink shadow-float">
          {/* blurred premium cards in the background */}
          <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-70 blur-[3px]">
            {premium.concat(templates.slice(0, 3)).map((t, i) => (
              <div
                key={i}
                className="aspect-[3/4.4] w-44 shrink-0 rounded-2xl shadow-card"
                style={{ background: t.kind === "Resume" ? "#fff" : t.gradient, transform: `rotate(${(i - 2) * 5}deg) translateY(${(i % 2) * 18}px)` }}
              >
                <TemplatePreview t={t} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />

          {/* CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-candy-yellow/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-candy-yellow">
              <Crown className="h-4 w-4" /> Premium templates
            </span>
            <h3 className="mt-4 max-w-xl font-display text-3xl font-extrabold text-white sm:text-4xl">
              Stand out with <span className="shimmer-text animate-shimmer">designer-grade</span> templates
            </h3>
            <p className="mt-3 max-w-md text-white/70">
              Unlock the full premium collection — exclusive layouts, finishes and effects. Upgrade any time.
            </p>
            <a
              href={PLANS_URL}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4" /> See premium plans
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

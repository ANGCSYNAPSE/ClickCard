import { Check } from "lucide-react";
import { pricing, WEBAPP_URL } from "@/lib/site";
import Reveal from "./Reveal";

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            Simple pricing
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Start free. <span className="text-gradient">Upgrade when you grow.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricing.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-3xl p-7 shadow-soft transition hover:-translate-y-1 ${
                  p.highlight
                    ? "bg-ink text-white shadow-float ring-2 ring-brand-400"
                    : "bg-white text-ink ring-1 ring-brand-50"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-4 py-1 text-xs font-bold text-white shadow-glow">
                    Most popular
                  </span>
                )}
                <p className="font-display text-lg font-bold">{p.name}</p>
                <p className={`text-sm ${p.highlight ? "text-white/60" : "text-ink/50"}`}>
                  {p.tagline}
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold">{p.price}</span>
                  <span className={`mb-1 text-sm ${p.highlight ? "text-white/60" : "text-ink/50"}`}>
                    {p.period}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                          p.highlight ? "bg-brand-gradient" : "bg-brand-100 text-brand-600"
                        }`}
                      >
                        <Check className={`h-3 w-3 ${p.highlight ? "text-white" : ""}`} />
                      </span>
                      <span className={p.highlight ? "text-white/85" : "text-ink/70"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={WEBAPP_URL}
                  className={`mt-7 rounded-2xl px-5 py-3 text-center font-semibold transition ${
                    p.highlight
                      ? "bg-brand-gradient text-white hover:opacity-90"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

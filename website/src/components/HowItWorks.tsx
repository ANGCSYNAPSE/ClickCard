"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { steps, WEBAPP_URL } from "@/lib/site";

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            How it works
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Live in <span className="text-gradient">three steps</span>
          </h2>
          <p className="mt-4 text-lg text-ink/60">From zero to a shareable digital identity in under five minutes.</p>
        </motion.div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* animated connecting line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 origin-left bg-gradient-to-r from-brand-400 via-candy-pink to-candy-orange md:block"
          />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 rounded-3xl bg-white p-7 text-center shadow-card ring-1 ring-brand-50"
            >
              <div style={{ background: s.tint }} className="mx-auto grid h-24 w-24 place-items-center rounded-full font-display text-3xl font-extrabold text-white shadow-glow">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href={WEBAPP_URL}
            className="group inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-7 py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.03]"
          >
            Start in 5 minutes
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

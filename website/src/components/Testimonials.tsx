"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/lib/site";

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <div className="w-[340px] shrink-0 rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
          <div>
            <p className="font-display text-sm font-bold text-ink">{t.name}</p>
            <p className="text-xs text-ink/55">{t.role}</p>
          </div>
        </div>
        <Quote className="h-6 w-6 text-brand-200" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink/70">“{t.quote}”</p>
      <div className="mt-4 flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-candy-yellow text-candy-yellow" />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const rowA = [...testimonials, ...testimonials];
  const rowB = [...testimonials.slice().reverse(), ...testimonials.slice().reverse()];

  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-mist to-white" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl px-5 text-center"
      >
        <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
          Loved by creators
        </span>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Join <span className="text-gradient">50,000+</span> happy members
        </h2>
      </motion.div>

      <div className="marquee-pause relative mt-14 space-y-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-mist to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-mist to-transparent" />

        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-5">
            {rowA.map((t, i) => (
              <Card key={`a-${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-5 [animation-direction:reverse]">
            {rowB.map((t, i) => (
              <Card key={`b-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

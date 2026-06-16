"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Link2, Users, Sparkles, ChevronRight, Star, Trophy, Award, Copy, Check } from "lucide-react";
import { WEBAPP_URL, WEB_URL } from "@/lib/site";

/* ─── Working "Refer a friend" widget (copy code + share) ─── */
function ReferAFriend() {
  const code = "CC-ABC123";
  const inviteUrl = `${WEB_URL}/signup?ref=${code}`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const msg = encodeURIComponent(
    `Join me on ClickCard — one link for your whole identity. Sign up with my link:`,
  );
  const u = encodeURIComponent(inviteUrl);
  const shares = [
    { label: "WhatsApp", href: `https://wa.me/?text=${msg}%20${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${msg}&url=${u}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent("Join me on ClickCard")}&body=${msg}%20${u}` },
  ];

  return (
    <div className="mt-7 rounded-3xl border border-brand-100 bg-white/80 p-5 shadow-soft backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-wider text-ink/45">
        Your invite link
      </p>
      <div className="mt-2 flex min-w-0 items-center gap-2 rounded-2xl bg-mist p-1.5">
        <span className="min-w-0 flex-1 truncate px-2 text-xs font-bold text-ink sm:text-sm">
          {inviteUrl.replace(/^https?:\/\//, "")}
        </span>
        <button
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-xs font-bold text-white transition hover:opacity-90 sm:text-sm"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink/50">Share via</span>
        {shares.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-ink/5 px-3.5 py-2 text-xs font-bold text-ink/70 transition hover:bg-brand-50 hover:text-brand-600"
          >
            {s.label}
          </a>
        ))}
        <a
          href={WEBAPP_URL}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold text-white transition hover:bg-ink/90"
        >
          <Sparkles size={13} /> Get my code
        </a>
      </div>
    </div>
  );
}

/* ─── Left card: Onboarding / How it works ─── */
function CardOne() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="relative w-full"
    >
      <div className="rounded-3xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.35)] ring-1 ring-black/5 sm:p-7">
        <h3 className="font-display text-xl font-extrabold leading-tight text-ink sm:text-2xl">
          Earn rewards together
          <br />
          with your friends!
        </h3>

        {/* 3D illustration area */}
        <div className="relative mt-4 grid h-36 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-mist to-candy-cyan/20 sm:mt-5 sm:h-44">
          {/* floating card */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-10, -5, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-6 top-6 h-16 w-24 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-xl"
          >
            <div className="absolute right-2 top-2 h-3 w-4 rounded-sm bg-yellow-300" />
            <div className="absolute bottom-1.5 left-2 h-1 w-12 rounded-full bg-white/60" />
            <div className="absolute bottom-3.5 left-2 h-1 w-8 rounded-full bg-white/40" />
          </motion.div>

          {/* person avatar */}
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-candy-pink shadow-xl">
              <span className="text-3xl">👤</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-candy-yellow shadow-lg"
            >
              <span className="text-sm">💬</span>
            </motion.div>
          </div>

          {/* +12 chat bubble */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-4 top-4 flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-brand-600 shadow-lg"
          >
            +12 <span className="text-candy-orange">⭐</span>
          </motion.div>

          {/* sparkle decoration */}
          <motion.div
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute bottom-3 right-6"
          >
            <Sparkles className="h-4 w-4 text-candy-pink" />
          </motion.div>
        </div>

        {/* steps list */}
        <div className="mt-5 space-y-3">
          {[
            { icon: Link2, t: "Send your referral link to friends" },
            { icon: Users, t: "Friends sign up — both earn rewards" },
            { icon: Trophy, t: "Unlock free Pro months & templates" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50">
                <s.icon className="h-4 w-4 text-brand-600" />
              </span>
              <p className="pt-1 text-sm font-medium leading-snug text-ink/75">{s.t}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3.5 text-sm font-bold text-white shadow-glow"
        >
          <Sparkles className="h-4 w-4" /> Invite a friend
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Right card: Rewards / activity ─── */
function CardTwo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="relative w-full"
    >
      <div className="rounded-3xl bg-white p-7 shadow-[0_30px_80px_-20px_rgba(236,72,153,0.35)] ring-1 ring-black/5">
        {/* header */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Invite a friend</p>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
            <span className="text-sm font-bold">?</span>
          </span>
        </div>

        {/* Reward badge centered */}
        <div className="flex flex-col items-center pt-4">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-candy-yellow via-candy-orange to-candy-pink shadow-xl">
              <Gift className="h-11 w-11 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-white shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.div>
          </motion.div>

          <p className="mt-4 text-4xl font-black text-ink">
            24 <span className="text-candy-orange">⭐</span>
          </p>
          <p className="text-xs font-semibold text-ink/60">Points earned</p>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex rounded-full bg-mist p-1">
          <button className="flex-1 rounded-full bg-brand-gradient py-2 text-xs font-bold text-white shadow-md">
            My rewards
          </button>
          <button className="flex-1 py-2 text-xs font-bold text-ink/60">
            History
          </button>
        </div>

        {/* Reward list */}
        <div className="mt-4 space-y-2.5">
          {[
            { name: "Aliya Hassan", date: "24 July", value: "+12", color: "from-brand-500 to-candy-cyan" },
            { name: "Farhad Bagirov", date: "13 July", value: "+12", color: "from-candy-pink to-candy-orange" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-mist/70 p-2.5">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${r.color} text-white`}>
                <Star className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{r.name}</p>
                <p className="truncate text-xs text-ink/55">Referral bonus · {r.date}</p>
              </div>
              <span className="shrink-0 rounded-full bg-candy-yellow/30 px-2 py-1 text-[10px] font-bold text-candy-orange">
                {r.value} xp
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-white"
        >
          <Gift className="h-4 w-4" /> Invite a friend
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ReferralBanner() {
  return (
    <section id="referral" className="relative overflow-hidden py-20 md:py-28">
      {/* Premium background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50" />

        {/* Decorative blobs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-300/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-candy-pink/15 blur-3xl"
        />

        {/* Dotted pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
          <defs>
            <pattern id="ref-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#7c3aed" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ref-dots)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
              <Gift className="h-3.5 w-3.5" /> Referral Program
            </span>

            <h2 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.1] text-ink sm:text-5xl md:text-6xl">
              Earn bonuses{" "}
              <span className="text-gradient">together</span>
              <br />
              with your friends!
            </h2>

            <p className="mt-5 max-w-md text-base text-ink/65 sm:text-lg">
              Every member gets a unique code like <b className="text-brand-600">CC-ABC123</b>.
              Share it — when friends join, you both unlock rewards, free Pro
              months and exclusive templates.
            </p>

            {/* Feature list */}
            <div className="mt-7 space-y-3">
              {[
                { icon: Link2, t: "Invite friends via your unique link", c: "from-brand-500 to-candy-cyan" },
                { icon: Users, t: "Friends get exclusive welcome bonuses", c: "from-candy-pink to-candy-orange" },
                { icon: Award, t: "You earn rewards for every signup", c: "from-candy-lime to-candy-cyan" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.c} text-white shadow-md`}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-ink/80">{s.t}</p>
                </motion.div>
              ))}
            </div>

            {/* Working refer-a-friend widget */}
            <ReferAFriend />
          </motion.div>

          {/* Right: ONE card on every breakpoint — the primary onboarding card. */}
          <div className="relative flex items-center justify-center">
            {/* Decorative glow behind the card */}
            <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-80 w-80 rounded-full bg-brand-gradient opacity-20 blur-3xl" />

            <div className="w-full max-w-sm">
              <CardOne />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

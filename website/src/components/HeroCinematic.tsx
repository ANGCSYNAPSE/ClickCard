"use client";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Star,
  Eye,
  Link2,
  MessageCircle,
  Phone,
  Share2,
  Zap,
  UserPlus,
} from "lucide-react";
import { features, heroAvatars, WEBAPP_URL } from "@/lib/site";

/* ─── sleek phone ─── */
function SleekPhone() {
  return (
    <div className="relative w-[260px] sm:w-[280px] rounded-[2.4rem] border-[3px] border-[#d5cce8]/40 bg-gradient-to-b from-white/30 to-white/10 shadow-[0_60px_140px_-25px_rgba(124,58,237,0.5),0_0_0_1px_rgba(255,255,255,0.2)]">
      <div className="absolute left-1/2 top-1.5 z-10 h-[14px] w-[70px] -translate-x-1/2 rounded-full bg-black" />
      <div className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      <div className="overflow-hidden rounded-[2.2rem] bg-white">
        <div className="relative h-28 bg-gradient-to-br from-brand-500 via-candy-pink to-candy-orange">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-1.5">
            <span className="grid h-5 w-8 place-items-center rounded-md bg-white font-display text-[9px] font-black text-brand-600 tracking-tight">
              CK
            </span>
            <span className="text-[9px] font-bold text-white/95 tracking-wide">
              ClickCard
            </span>
          </div>
          <div className="absolute -bottom-7 left-4 h-16 w-16 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.pravatar.cc/160?img=12"
              alt="profile"
              className="h-full w-full object-cover"
            />
          </div>
          <button className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink shadow-sm">
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="px-4 pb-4 pt-10">
          <p className="font-display text-[15px] font-bold text-ink">
            Ivano Ermakov
          </p>
          <p className="text-[10px] text-ink/60">
            Graphic Designer · Freelance
          </p>
          <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-brand-600">
            <Link2 className="h-3 w-3" /> clickcard.app/ivano
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-brand-50/70 px-3 py-1.5">
            <div className="flex -space-x-1.5">
              {heroAvatars.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-5 w-5 rounded-full border-[1.5px] border-white object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5 fill-candy-yellow text-candy-yellow"
                />
              ))}
            </div>
            <span className="text-[8px] font-bold text-ink/50">50k+</span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {[
              { i: Phone, l: "Call", c: "bg-candy-cyan/15 text-[#0891b2]" },
              {
                i: MessageCircle,
                l: "WhatsApp",
                c: "bg-[#25d366]/12 text-[#128c5e]",
              },
              { i: Eye, l: "12.4k", c: "bg-candy-pink/12 text-candy-pink" },
            ].map((b, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 ${b.c}`}
              >
                <b.i className="h-3.5 w-3.5" />
                <span className="text-[8px] font-semibold">{b.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1.5">
            {[
              { t: "Portfolio", g: "from-brand-500 to-candy-cyan" },
              { t: "Behance", g: "from-candy-pink to-candy-orange" },
              { t: "Book a call →", g: "from-candy-lime to-[#06b6d4]" },
            ].map((row) => (
              <div
                key={row.t}
                className={`rounded-xl bg-gradient-to-r ${row.g} px-3.5 py-2 text-[10px] font-semibold text-white`}
              >
                {row.t}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-brand-500" />
              <span className="text-[9px] font-semibold text-ink/55">
                Views today
              </span>
            </div>
            <span className="text-[10px] font-bold text-brand-600">247 ↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── floating feature card ─── */
function FloatCard({
  feature,
  index,
  side,
  scrollProgress,
}: {
  feature: (typeof features)[number];
  index: number;
  side: "left" | "right";
  scrollProgress: MotionValue<number>;
}) {
  const localIdx = side === "left" ? index : index - 3;
  const threshold = 0.22 + index * 0.06;
  const opacity = useTransform(
    scrollProgress,
    [threshold, threshold + 0.08],
    [0, 1]
  );
  const slideX = useTransform(
    scrollProgress,
    [threshold, threshold + 0.14],
    [side === "left" ? -80 : 80, 0]
  );
  const slideY = useTransform(
    scrollProgress,
    [threshold, threshold + 0.14],
    [30, 0]
  );
  const tiltAngle = side === "left" ? 3 - localIdx * 1.5 : -3 + localIdx * 1.5;
  const rotate = useTransform(
    scrollProgress,
    [threshold, threshold + 0.14],
    [side === "left" ? 8 : -8, tiltAngle]
  );
  const Icon = feature.icon;

  return (
    <motion.div
      style={{ opacity, x: slideX, y: slideY, rotate }}
      className="flex items-start gap-3 rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-[0_12px_40px_-8px_rgba(124,58,237,0.22)] ring-1 ring-brand-100/50 w-[240px]"
    >
      <span
        style={{ background: feature.tint }}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-md"
      >
        <Icon className="h-5 w-5 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-ink leading-tight">
          {feature.title}
        </p>
        <p className="mt-0.5 text-[10px] leading-snug text-ink/55 line-clamp-2">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── static hero for mobile (no scroll-hijack) ─── */
function HeroMobile() {
  return (
    <section className="relative overflow-hidden bg-mist px-5 pb-16 pt-28 md:hidden">
      <div className="absolute inset-0 -z-10 bg-mesh" />
      <div className="absolute left-1/2 top-10 -z-10 h-[320px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-400/25 via-candy-pink/12 to-candy-cyan/15 blur-[120px]" />

      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brand-600 shadow-soft ring-1 ring-brand-100">
          <Zap className="h-3 w-3" /> Your whole identity, one link
        </span>
        <h1 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-ink">
          One link for your <span className="text-gradient">whole identity</span>.
        </h1>
        <p className="mt-4 text-sm font-medium text-ink/55">
          Digital card · Resume · QR · Analytics — all in one beautiful link.
        </p>

        {/* clear gap before the CTA buttons */}
        <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
          <a
            href={WEBAPP_URL}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3.5 text-sm font-bold text-white shadow-glow"
          >
            Create your ClickCard <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={WEBAPP_URL}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-soft"
          >
            <UserPlus className="h-4 w-4" /> Register now
          </a>
        </div>

        {/* extra breathing room before the phone — addresses the "things hugging
            the buttons" feedback on mobile too */}
        <div className="mt-14 flex justify-center">
          <SleekPhone />
        </div>
      </div>
    </section>
  );
}

/* ─── HERO ─── */
export default function HeroCinematic() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* phone 3D — rises and tilts into the air.
     Base scale held at 0.62 so the full device (~520px tall) fits inside
     the ~360-400px of vertical room remaining beneath the CTAs without
     clipping at the top or the bottom. */
  const rawY = useTransform(scrollYProgress, [0, 0.35, 1], [0, -40, -80]);
  const phoneY = useSpring(rawY, { stiffness: 80, damping: 22 });
  const rawScale = useTransform(scrollYProgress, [0, 0.3, 1], [0.62, 0.68, 0.68]);
  const phoneScale = useSpring(rawScale, { stiffness: 80, damping: 22 });
  const rawRotX = useTransform(scrollYProgress, [0, 0.45, 1], [0, 16, 24]);
  const phoneRotX = useSpring(rawRotX, { stiffness: 70, damping: 22 });
  const rawRotY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -8, -14]);
  const phoneRotY = useSpring(rawRotY, { stiffness: 70, damping: 22 });

  /* shadow grows as phone lifts */
  const shadowOp = useTransform(scrollYProgress, [0, 0.3], [0.2, 0.85]);
  const shadowScale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1.4]);

  /* headline fades out to make room for phone */
  const headOp = useTransform(scrollYProgress, [0, 0.06, 0.2], [1, 1, 0]);
  const headY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const hintOp = useTransform(scrollYProgress, [0, 0.04, 0.9, 1], [1, 1, 1, 0]);

  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3, 6);

  return (
    <>
      <HeroMobile />
      <section ref={ref} className="relative hidden h-[360vh] md:block">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* backgrounds */}
        <div className="absolute inset-0 -z-10 bg-mist" />
        <div className="absolute inset-0 -z-10 bg-mesh" />
        <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[960px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-400/25 via-candy-pink/12 to-candy-cyan/15 blur-[140px]" />

        {/* ── top zone: headline + CTA (fixed height, never overlaps phone) ── */}
        <motion.div
          style={{ opacity: headOp, y: headY }}
          className="relative z-30 flex flex-col items-center pt-24 sm:pt-28"
        >
          <h1 className="max-w-2xl px-5 text-center font-display text-[2.2rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-[3.5rem]">
            One link for your{" "}
            <span className="text-gradient">whole identity</span>.
          </h1>
          <p className="mt-4 max-w-lg px-5 text-center text-sm text-ink/50 font-medium sm:text-base">
            Digital card · Resume · QR · Analytics — all in one beautiful link.
          </p>

          {/* widened gap between subtitle and CTAs so they don't hug the heading */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={WEBAPP_URL}
              className="group inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.04] sm:px-7 sm:py-3.5 sm:text-base"
            >
              Create your ClickCard
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href={WEBAPP_URL}
              className="group inline-flex items-center gap-2 rounded-2xl border-2 border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 shadow-soft transition-all hover:border-brand-400 hover:bg-brand-50 hover:scale-[1.03] sm:px-5 sm:py-3"
            >
              <UserPlus className="h-4 w-4" />
              Register Now
            </a>
          </div>
        </motion.div>

        {/* ── bottom zone: phone + feature cards ──
            Starts below the CTAs (clear gap) and centers the (scaled-down)
            phone so it always renders in full. overflow-hidden keeps wide
            screen side cards inside the viewport. */}
        <div className="perspective absolute inset-x-0 bottom-0 top-[400px] sm:top-[420px] flex items-center justify-center overflow-hidden px-4">
          {/* left feature cards */}
          <div className="hidden md:flex flex-col gap-3.5 items-end flex-1 max-w-[280px] pr-4 lg:pr-8">
            {leftFeatures.map((f, i) => (
              <FloatCard
                key={f.title}
                feature={f}
                index={i}
                side="left"
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* phone */}
          <motion.div
            style={{
              y: phoneY,
              scale: phoneScale,
              rotateX: phoneRotX,
              rotateY: phoneRotY,
              transformOrigin: "center center",
            }}
            className="relative z-20 shrink-0 preserve-3d"
          >
            <motion.div
              style={{ opacity: shadowOp, scale: shadowScale }}
              className="pointer-events-none absolute -bottom-16 left-1/2 h-20 w-64 -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
            />
            <SleekPhone />
          </motion.div>

          {/* right feature cards */}
          <div className="hidden md:flex flex-col gap-3.5 items-start flex-1 max-w-[280px] pl-4 lg:pl-8">
            {rightFeatures.map((f, i) => (
              <FloatCard
                key={f.title}
                feature={f}
                index={i + 3}
                side="right"
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* hint */}
        <motion.p
          style={{ opacity: hintOp }}
          className="absolute bottom-5 inset-x-0 z-30 text-center text-xs font-semibold text-ink/35"
        >
          scroll to explore ↓
        </motion.p>
      </div>
      </section>
    </>
  );
}

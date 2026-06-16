"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { featuresBySegment, segments } from "@/lib/site";

/* ─── Premium Feature Card with strong contrast ─── */
function FeatureCard({
  feature,
  i,
  segmentTheme,
}: {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    tint: string;
  };
  i: number;
  segmentTheme: { cardBg: string; cardBorder: string };
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: (i % 3) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="h-full"
    >
      <div
        className={`group relative h-full overflow-hidden rounded-2xl ${segmentTheme.cardBg} backdrop-blur-xl border ${segmentTheme.cardBorder} p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)]`}
      >
        {/* Subtle gradient wash */}
        <div
          style={{
            background: feature.tint,
            opacity: 0.06,
          }}
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-15"
        />

        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        {/* Icon */}
        <div className="relative mb-4">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative inline-block"
          >
            <div
              style={{ background: feature.tint }}
              className="relative grid h-12 w-12 place-items-center rounded-xl text-white shadow-lg"
            >
              <Icon className="h-6 w-6" />
            </div>
            <div
              style={{ background: feature.tint }}
              className="absolute inset-0 rounded-xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-50 -z-10"
            />
          </motion.div>
        </div>

        {/* Content with strong text contrast */}
        <div className="relative">
          <h3 className="font-display text-base font-bold text-ink mb-2 leading-tight">
            {feature.title}
          </h3>
          <p className="text-xs text-ink/70 leading-relaxed">
            {feature.desc}
          </p>
        </div>

        {/* Accent bar */}
        <div
          style={{ background: feature.tint }}
          className="absolute bottom-0 left-0 right-0 h-[3px] opacity-60"
        />
      </div>
    </motion.div>
  );
}

/* ─── Segment Tab ─── */
function SegmentTab({
  segment,
  active,
  onClick,
}: {
  segment: (typeof segments)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group flex shrink-0 items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 ${
        active
          ? `${segment.color} text-white shadow-2xl scale-[1.08] ring-2 ring-white/40`
          : "bg-white/90 text-ink shadow-lg ring-1 ring-black/5 hover:ring-black/10 hover:bg-white backdrop-blur-sm"
      }`}
    >
      <motion.span
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
          active ? "bg-white/30" : "bg-ink/5"
        }`}
      >
        <segment.icon className="h-4 w-4" />
      </motion.span>
      {segment.label}
    </motion.button>
  );
}

/* ─── Premium themed backgrounds per segment ─── */
type SegmentTheme = {
  bg: string;
  overlay: string;
  pattern: React.ReactNode;
  badge: string;
  cardBg: string;
  cardBorder: string;
  decorativeImage: React.ReactNode;
  // Photographic background — sits behind the gradient + pattern.
  // Switches when the active tab changes.
  bgImage: string;
};

function StudentsBg() {
  return (
    <>
      {/* Notebook lines + dots pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden>
        <defs>
          <pattern id="students-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0e7490" strokeWidth="0.8" />
            <circle cx="20" cy="20" r="1" fill="#0e7490" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#students-grid)" />
      </svg>
      {/* Floating shapes — books, pencils */}
      <motion.svg
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[10%] h-24 w-24 opacity-20"
        viewBox="0 0 100 100"
      >
        <rect x="20" y="30" width="60" height="50" rx="4" fill="#0891b2" />
        <rect x="20" y="30" width="60" height="6" fill="#06b6d4" />
        <rect x="20" y="40" width="60" height="2" fill="#0e7490" />
      </motion.svg>
      <motion.svg
        animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 left-[8%] h-32 w-32 opacity-15"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" />
        <text x="50" y="58" textAnchor="middle" fontSize="30" fill="#06b6d4" fontWeight="bold">A+</text>
      </motion.svg>
      <motion.svg
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-40 left-[15%] h-20 w-20 opacity-20"
        viewBox="0 0 100 100"
      >
        <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="#0891b2" />
      </motion.svg>
    </>
  );
}

function ProfessionalsBg() {
  return (
    <>
      {/* Subtle pinstripe + grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="prof-stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#6d28d9" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#prof-stripes)" />
      </svg>
      {/* Building silhouettes */}
      <motion.svg
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 h-32 w-full opacity-10"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
      >
        <rect x="50" y="30" width="60" height="70" fill="#6d28d9" />
        <rect x="130" y="10" width="40" height="90" fill="#7c3aed" />
        <rect x="190" y="40" width="80" height="60" fill="#6d28d9" />
        <rect x="290" y="20" width="50" height="80" fill="#a78bfa" />
        <rect x="360" y="35" width="70" height="65" fill="#7c3aed" />
        <rect x="450" y="15" width="55" height="85" fill="#6d28d9" />
        <rect x="525" y="40" width="65" height="60" fill="#7c3aed" />
        <rect x="610" y="25" width="45" height="75" fill="#a78bfa" />
        <rect x="675" y="30" width="75" height="70" fill="#6d28d9" />
      </motion.svg>
      {/* Briefcase icon floating */}
      <motion.svg
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[12%] h-24 w-24 opacity-15"
        viewBox="0 0 100 100"
      >
        <rect x="15" y="35" width="70" height="50" rx="4" fill="#7c3aed" />
        <rect x="35" y="20" width="30" height="15" rx="2" fill="none" stroke="#7c3aed" strokeWidth="3" />
        <line x1="15" y1="55" x2="85" y2="55" stroke="#a78bfa" strokeWidth="2" />
      </motion.svg>
      {/* Growth chart */}
      <motion.svg
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-20 left-[10%] h-20 w-32 opacity-20"
        viewBox="0 0 120 80"
      >
        <polyline points="10,70 30,50 50,55 70,30 90,20 110,10" fill="none" stroke="#7c3aed" strokeWidth="3" />
        <polyline points="110,10 100,10 110,10 110,20" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      </motion.svg>
    </>
  );
}

function BusinessesBg() {
  return (
    <>
      {/* Diagonal stripes pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="biz-diag" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="30" stroke="#ec4899" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#biz-diag)" />
      </svg>
      {/* Storefront illustration */}
      <motion.svg
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-[5%] h-32 w-40 opacity-15"
        viewBox="0 0 160 120"
      >
        <rect x="20" y="50" width="120" height="60" fill="#ec4899" />
        <polygon points="10,50 80,15 150,50" fill="#f43f5e" />
        <rect x="40" y="70" width="20" height="40" fill="#fff" opacity="0.8" />
        <rect x="80" y="70" width="40" height="25" fill="#fff" opacity="0.8" />
        <circle cx="100" cy="105" r="3" fill="#ec4899" />
      </motion.svg>
      {/* Shopping bag */}
      <motion.svg
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-[10%] h-28 w-28 opacity-15"
        viewBox="0 0 100 100"
      >
        <path d="M25 35 L25 85 L75 85 L75 35 Z" fill="#fb923c" />
        <path d="M35 35 Q35 20 50 20 Q65 20 65 35" fill="none" stroke="#fb923c" strokeWidth="3" />
        <text x="50" y="65" textAnchor="middle" fontSize="20" fill="#fff" fontWeight="bold">%</text>
      </motion.svg>
      {/* Coins */}
      <motion.svg
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-20 left-[12%] h-20 w-20 opacity-20"
        viewBox="0 0 80 80"
      >
        <circle cx="40" cy="40" r="30" fill="#fb923c" stroke="#f97316" strokeWidth="2" />
        <text x="40" y="50" textAnchor="middle" fontSize="28" fill="#fff" fontWeight="bold">$</text>
      </motion.svg>
    </>
  );
}

function CreatorsBg() {
  return (
    <>
      {/* Confetti dots pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.1]" aria-hidden>
        <defs>
          <pattern id="creator-dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="#f59e0b" />
            <circle cx="35" cy="25" r="1.5" fill="#fb923c" />
            <circle cx="20" cy="40" r="1" fill="#d97706" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#creator-dots)" />
      </svg>
      {/* Camera/Mic icon */}
      <motion.svg
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[10%] h-28 w-28 opacity-15"
        viewBox="0 0 100 100"
      >
        <rect x="15" y="30" width="70" height="50" rx="6" fill="#f59e0b" />
        <circle cx="50" cy="55" r="15" fill="#fff" />
        <circle cx="50" cy="55" r="8" fill="#f59e0b" />
        <rect x="40" y="20" width="20" height="12" rx="2" fill="#f59e0b" />
      </motion.svg>
      {/* Play button */}
      <motion.svg
        animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[8%] h-24 w-24 opacity-20"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="40" fill="#f59e0b" />
        <polygon points="40,30 40,70 70,50" fill="#fff" />
      </motion.svg>
      {/* Music notes / sparkles */}
      <motion.svg
        animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-24 left-[15%] h-20 w-20 opacity-25"
        viewBox="0 0 80 80"
      >
        <path d="M40 10 L50 35 L75 40 L55 55 L60 80 L40 65 L20 80 L25 55 L5 40 L30 35 Z" fill="#fb923c" />
      </motion.svg>
    </>
  );
}

const segmentThemes: Record<string, SegmentTheme> = {
  Students: {
    bg: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
    overlay: "from-cyan-500/15 via-blue-500/5 to-transparent",
    pattern: <StudentsBg />,
    badge: "bg-cyan-500",
    cardBg: "bg-white/85",
    cardBorder: "border-cyan-200/60",
    decorativeImage: null,
    // Library / books / study vibes
    bgImage:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1800&q=70",
  },
  Professionals: {
    bg: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
    overlay: "from-purple-500/15 via-indigo-500/5 to-transparent",
    pattern: <ProfessionalsBg />,
    badge: "bg-purple-600",
    cardBg: "bg-white/85",
    cardBorder: "border-purple-200/60",
    decorativeImage: null,
    // Modern office / skyline
    bgImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=70",
  },
  Businesses: {
    bg: "bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100",
    overlay: "from-pink-500/15 via-rose-500/5 to-transparent",
    pattern: <BusinessesBg />,
    badge: "bg-pink-500",
    cardBg: "bg-white/85",
    cardBorder: "border-pink-200/60",
    decorativeImage: null,
    // Boutique storefront
    bgImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=70",
  },
  Creators: {
    bg: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
    overlay: "from-amber-500/15 via-orange-500/5 to-transparent",
    pattern: <CreatorsBg />,
    badge: "bg-amber-500",
    cardBg: "bg-white/85",
    cardBorder: "border-amber-200/60",
    decorativeImage: null,
    // Studio / creator setup
    bgImage:
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1800&q=70",
  },
};

/* ─── Main Features Section ─── */
export default function Features() {
  const [activeSegment, setActiveSegment] = useState(0);
  const activeSeg = segments[activeSegment];
  const theme = segmentThemes[activeSeg.label] || segmentThemes.Students;
  const currentFeatures =
    featuresBySegment[activeSeg.label as keyof typeof featuresBySegment] || [];

  return (
    <section id="features" className="relative overflow-hidden py-24 md:py-32">
      {/* Themed background — photo + colour wash + animated patterns */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSeg.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 -z-10 ${theme.bg}`}
        >
          {/* photographic layer that swaps per tab */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply"
            style={{ backgroundImage: `url(${theme.bgImage})` }}
          />
          {/* soft colour wash so feature cards stay readable */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.overlay}`} />
          {/* tint to blend the photo with the segment palette */}
          <div className={`absolute inset-0 ${theme.bg} opacity-60`} />
          {theme.pattern}
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <motion.span
            key={activeSeg.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`inline-block rounded-full ${theme.badge} text-white px-5 py-2 text-xs font-bold uppercase tracking-widest shadow-xl ring-2 ring-white/30`}
          >
            For {activeSeg.label}
          </motion.span>
          <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Way more than a{" "}
            <span className="text-gradient">link in bio</span>
          </h2>
          <p className="mt-4 text-lg text-ink/65">
            ClickCard packs your entire professional presence into one
            beautiful, always-updated destination.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-3 mb-14 flex-wrap"
        >
          {segments.map((s, i) => (
            <SegmentTab
              key={s.label}
              segment={s}
              active={i === activeSegment}
              onClick={() => setActiveSegment(i)}
            />
          ))}
        </motion.div>

        {/* Feature cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSeg.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentFeatures.map((f, i) => (
              <FeatureCard
                key={`${activeSeg.label}-${i}`}
                feature={f}
                i={i}
                segmentTheme={theme}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { QrCode, Mail, Phone, Sparkles, Crown, Zap, Star, Heart } from "lucide-react";

type CardData = {
  id: number;
  label: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  cardNumber: string;
  // visual identity
  bgImage: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  pattern: "dots" | "lines" | "waves" | "mesh" | "rings" | "grid";
};

const showcaseCards: CardData[] = [
  {
    id: 1,
    label: "Designer Card",
    name: "Trazodene",
    role: "UI / UX Designer",
    email: "trazodene@gmail.com",
    phone: "+92 1234 5678",
    cardNumber: "•••• 4521",
    bgImage:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    gradient:
      "radial-gradient(circle at 20% 30%, rgba(124,58,237,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.5) 0%, transparent 50%)",
    textColor: "#ffffff",
    accentColor: "#22d3ee",
    icon: Sparkles,
    pattern: "mesh",
  },
  {
    id: 2,
    label: "Premium Gold",
    name: "Sarah Martinez",
    role: "Brand Director",
    email: "sarah@design.co",
    phone: "+1 555 234 5678",
    cardNumber: "•••• 8907",
    bgImage:
      "linear-gradient(135deg, #f7971e 0%, #ffd200 50%, #f7971e 100%)",
    gradient:
      "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(217,119,6,0.5) 0%, transparent 60%)",
    textColor: "#1a1a1a",
    accentColor: "#7c2d12",
    icon: Crown,
    pattern: "rings",
  },
  {
    id: 3,
    label: "Sunset Pro",
    name: "Alex Chen",
    role: "Product Designer",
    email: "alex@studio.co",
    phone: "+1 555 345 6789",
    cardNumber: "•••• 3344",
    bgImage:
      "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 50%, #fc5c7d 100%)",
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(252,92,125,0.6) 0%, transparent 50%)",
    textColor: "#ffffff",
    accentColor: "#fef3c7",
    icon: Heart,
    pattern: "waves",
  },
  {
    id: 4,
    label: "Aurora",
    name: "Jessica Lee",
    role: "Creative Director",
    email: "jessica@creative.io",
    phone: "+1 555 456 7890",
    cardNumber: "•••• 1209",
    bgImage:
      "linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #00c6ff 100%)",
    gradient:
      "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.5) 0%, transparent 50%)",
    textColor: "#ffffff",
    accentColor: "#fef3c7",
    icon: Zap,
    pattern: "lines",
  },
  {
    id: 5,
    label: "Onyx Black",
    name: "Michael Park",
    role: "Digital Strategist",
    email: "m.park@strategy.io",
    phone: "+1 555 567 8901",
    cardNumber: "•••• 7752",
    bgImage:
      "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
    gradient:
      "radial-gradient(circle at 20% 30%, rgba(236,72,153,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.4) 0%, transparent 50%)",
    textColor: "#ffffff",
    accentColor: "#f472b6",
    icon: Star,
    pattern: "dots",
  },
  {
    id: 6,
    label: "Emerald Reserve",
    name: "Emma Wilson",
    role: "UX Researcher",
    email: "emma@research.co",
    phone: "+1 555 678 9012",
    cardNumber: "•••• 5588",
    bgImage:
      "linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #11998e 100%)",
    gradient:
      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(5,150,105,0.5) 0%, transparent 50%)",
    textColor: "#ffffff",
    accentColor: "#fde68a",
    icon: Sparkles,
    pattern: "grid",
  },
];

/* SVG pattern overlay per card */
function CardPattern({ pattern, color }: { pattern: CardData["pattern"]; color: string }) {
  const id = `pattern-${pattern}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
      <defs>
        {pattern === "dots" && (
          <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={color} />
          </pattern>
        )}
        {pattern === "lines" && (
          <pattern id={id} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="30" stroke={color} strokeWidth="1" />
          </pattern>
        )}
        {pattern === "grid" && (
          <pattern id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke={color} strokeWidth="0.6" />
          </pattern>
        )}
        {pattern === "waves" && (
          <pattern id={id} x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 Q 10 0 20 10 T 40 10" fill="none" stroke={color} strokeWidth="1" />
          </pattern>
        )}
        {pattern === "rings" && (
          <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="0.6" />
            <circle cx="30" cy="30" r="12" fill="none" stroke={color} strokeWidth="0.6" />
            <circle cx="30" cy="30" r="4" fill="none" stroke={color} strokeWidth="0.6" />
          </pattern>
        )}
        {pattern === "mesh" && (
          <pattern id={id} x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M0,25 Q12.5,5 25,25 T50,25" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
            <path d="M0,25 Q12.5,45 25,25 T50,25" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* Premium card design — Figma style with rich graphics */
function PremiumCard({
  card,
  index,
  progress,
  total,
}: {
  card: CardData;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  // Overlapping animation windows: as card N is leaving, card N+1 is already arriving.
  // Each card is anchored on its slice center; enter/exit reach into neighbor slices.
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const sliceWidth = 1 / total;
  const center = (index + 0.5) * sliceWidth;

  // Animation keyframes (clamped to [0, 1])
  const enterStart = Math.max(0, center - sliceWidth * 0.75);
  const fullIn = Math.max(0, center - sliceWidth * 0.15);
  const exitStart = Math.min(1, center + sliceWidth * 0.15);
  const fullOut = Math.min(1, center + sliceWidth * 0.75);

  // First card starts in place, last card stays in place
  const x = useTransform(
    progress,
    [enterStart, fullIn, exitStart, fullOut],
    [
      isFirst ? "0%" : "110%",
      "0%",
      "0%",
      isLast ? "0%" : "-110%",
    ]
  );
  const opacity = useTransform(
    progress,
    [enterStart, fullIn, exitStart, fullOut],
    [
      isFirst ? 1 : 0,
      1,
      1,
      isLast ? 1 : 0,
    ]
  );
  const rotateY = useTransform(
    progress,
    [enterStart, fullIn, exitStart, fullOut],
    [
      isFirst ? 0 : 30,
      0,
      0,
      isLast ? 0 : -20,
    ]
  );
  const scale = useTransform(
    progress,
    [enterStart, fullIn, exitStart, fullOut],
    [
      isFirst ? 1 : 0.88,
      1,
      1,
      isLast ? 1 : 0.88,
    ]
  );

  return (
    <motion.div
      style={{ x, opacity, rotateY, scale, zIndex: index + 1 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div
        className="relative w-[340px] sm:w-[420px] md:w-[480px] aspect-[1.586/1] rounded-[28px] overflow-hidden"
        style={{
          background: card.bgImage,
          boxShadow:
            "0 50px 100px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Radial gradient overlay */}
        <div className="absolute inset-0" style={{ background: card.gradient }} />

        {/* Decorative pattern */}
        <CardPattern pattern={card.pattern} color={card.accentColor} />

        {/* Glossy shine */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />

        {/* Floating circle decoration */}
        <div
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-2xl"
          style={{ background: card.accentColor }}
        />
        <div
          className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ background: card.accentColor }}
        />

        {/* Card content */}
        <div className="relative h-full flex flex-col justify-between p-6 sm:p-7" style={{ color: card.textColor }}>
          {/* Top row: brand + icon */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">CLICKCARD</p>
              <p className="mt-1 text-lg sm:text-xl font-extrabold tracking-tight">{card.label}</p>
            </div>
            <div
              className="grid h-12 w-12 place-items-center rounded-xl backdrop-blur"
              style={{
                background: `${card.accentColor}25`,
                border: `1px solid ${card.accentColor}55`,
              }}
            >
              <card.icon className="h-6 w-6" />
            </div>
          </div>

          {/* Middle: chip + card number */}
          <div className="flex items-center gap-3">
            {/* Chip */}
            <div
              className="h-9 w-12 rounded-md relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #d4af37 0%, #f0e68c 50%, #b8860b 100%)",
              }}
            >
              <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-black/30 rounded-[1px]" />
                ))}
              </div>
            </div>
            {/* Contactless icon */}
            <svg className="h-5 w-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12a7 7 0 0 1 14 0" strokeLinecap="round" />
              <path d="M8 12a4 4 0 0 1 8 0" strokeLinecap="round" />
              <path d="M11 12a1 1 0 0 1 2 0" strokeLinecap="round" />
            </svg>
            <p className="ml-auto text-base sm:text-lg font-mono font-bold tracking-widest">{card.cardNumber}</p>
          </div>

          {/* Bottom: name + role + QR */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">CARDHOLDER</p>
              <p className="mt-0.5 text-lg sm:text-xl font-bold truncate">{card.name}</p>
              <p className="text-xs opacity-75 truncate">{card.role}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] opacity-75">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> <span className="truncate max-w-[110px]">{card.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {card.phone}
                </span>
              </div>
            </div>
            <div
              className="grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-xl backdrop-blur"
              style={{
                background: `${card.accentColor}20`,
                border: `1px solid ${card.accentColor}50`,
              }}
            >
              <QrCode className="h-7 w-7 sm:h-9 sm:w-9 opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScrollShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progressBar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${showcaseCards.length * 100}vh` }}
    >
      {/* Sticky pinned viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Premium gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#150a2e] to-[#1a0a2a]" />

          {/* Animated mesh */}
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ x: [0, 60, 0], y: [0, -60, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
          />

          {/* Grid pattern */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
            <defs>
              <pattern id="grid-bg" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-bg)" />
          </svg>
        </div>

        {/* Headline — fixed top with clearance from navbar */}
        <div className="absolute top-0 left-0 right-0 pt-24 sm:pt-28 md:pt-32 px-6 z-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] border border-white/15 bg-white/5 backdrop-blur text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(to right, #22d3ee, #a78bfa, #ec4899)", WebkitBackgroundClip: "text" }}
          >
            Premium Card Designs
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05]"
          >
            Build it{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              once
            </span>
            .
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            Share it{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">
              everywhere
            </span>
            .
          </motion.h2>
        </div>

        {/* Card stage */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "1500px" }}
        >
          <div className="relative h-[320px] sm:h-[360px] md:h-[400px] w-full max-w-2xl mx-auto" style={{ transformStyle: "preserve-3d" }}>
            {showcaseCards.map((card, i) => (
              <PremiumCard
                key={card.id}
                card={card}
                index={i}
                progress={scrollYProgress}
                total={showcaseCards.length}
              />
            ))}
          </div>
        </div>

        {/* Bottom: progress + counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 w-full max-w-md px-6">
          <div className="h-[3px] w-full max-w-xs rounded-full bg-white/10 overflow-hidden">
            <motion.div
              style={{ width: progressBar }}
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
            Scroll · {showcaseCards.length} premium designs
          </p>
        </div>
      </div>
    </section>
  );
}

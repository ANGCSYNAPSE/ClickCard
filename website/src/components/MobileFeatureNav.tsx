"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Sparkles,
  Layers,
  CreditCard,
  Share2,
  BarChart3,
  Menu,
  X,
  User,
  QrCode,
  FileText,
  Gift,
  Crown,
  ArrowRight,
  Briefcase,
  Palette,
} from "lucide-react";
import { WEBAPP_URL, LOGIN_URL, PLANS_URL } from "@/lib/site";

/**
 * Mobile bottom dock + slide-in side drawer for the public website.
 * Showcases the in-app features (Dashboard / Card builder / Studio / Share /
 * Analytics / Billing) as if the visitor were already inside the product —
 * helps demo what they get after they sign up. Desktop ignores this entirely.
 */

const DOCK = [
  { label: "Home", icon: Home, href: "#top" },
  { label: "Features", icon: Sparkles, href: "#features" },
  { label: "Templates", icon: Layers, href: "#templates" },
  { label: "Pricing", icon: CreditCard, href: "#pricing" },
];

const DRAWER_GROUPS: {
  group: string;
  items: { label: string; icon: typeof Home; tint: string; description: string; href: string }[];
}[] = [
  {
    group: "Build your card",
    items: [
      { label: "Edit profile",    icon: User,     tint: "from-brand-500 to-candy-cyan",   description: "Personal · contact · social",         href: WEBAPP_URL },
      { label: "Digital Card",    icon: CreditCard, tint: "from-candy-pink to-brand-500",  description: "5+ templates · colours · PDF",         href: WEBAPP_URL },
      { label: "Studio",          icon: Palette,  tint: "from-candy-orange to-candy-pink",description: "Resumes · visiting cards · QR posters", href: WEBAPP_URL },
    ],
  },
  {
    group: "Share & grow",
    items: [
      { label: "Share & QR",      icon: Share2,   tint: "from-candy-cyan to-brand-600",   description: "Short links · custom QR · password",    href: WEBAPP_URL },
      { label: "Analytics",       icon: BarChart3,tint: "from-brand-600 to-candy-pink",   description: "Profile views · link taps · downloads", href: WEBAPP_URL },
      { label: "Referrals",       icon: Gift,     tint: "from-candy-orange to-candy-yellow", description: "Earn free Pro months by inviting",    href: "#referral" },
    ],
  },
  {
    group: "Identity",
    items: [
      { label: "Public profile",  icon: QrCode,   tint: "from-brand-500 to-candy-pink",   description: "Your clickcard.app/<username>",         href: WEBAPP_URL },
      { label: "Resume PDF",      icon: FileText, tint: "from-emerald-400 to-candy-cyan", description: "One-tap export",                        href: WEBAPP_URL },
      { label: "For professionals", icon: Briefcase, tint: "from-violet-500 to-brand-600", description: "Bundled features per vertical",        href: "#features" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Sign in",         icon: User,     tint: "from-ink to-brand-700",          description: "Use your email or Google / Apple",       href: LOGIN_URL },
      { label: "Upgrade to Pro",  icon: Crown,    tint: "from-candy-yellow to-candy-orange", description: "Unlimited links · Premium templates", href: PLANS_URL },
    ],
  },
];

export default function MobileFeatureNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ─── Bottom dock ─── */}
      <nav
        aria-label="Mobile primary"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 items-center rounded-2xl bg-white/95 px-2 py-1.5 shadow-[0_18px_40px_-10px_rgba(20,10,60,0.25)] backdrop-blur md:hidden"
      >
        {DOCK.map((d) => (
          <a
            key={d.label}
            href={d.href}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-bold text-ink/65 transition active:scale-95 hover:bg-brand-50 hover:text-brand-600"
          >
            <d.icon className="h-5 w-5" />
            {d.label}
          </a>
        ))}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open feature drawer"
          className="flex flex-col items-center gap-0.5 rounded-xl bg-brand-gradient px-2 py-1.5 text-[10px] font-bold text-white shadow-soft active:scale-95"
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* ─── Side drawer ─── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm md:hidden"
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto rounded-l-3xl bg-mist shadow-2xl"
            >
              {/* drawer header */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-11 place-items-center rounded-xl bg-brand-gradient font-display text-base font-black text-white shadow-soft">
                    CK
                  </span>
                  <div>
                    <p className="font-display text-base font-black text-ink">ClickCard</p>
                    <p className="text-[10px] font-semibold text-ink/55">Explore the app</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink/60 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* groups */}
              <div className="space-y-6 p-5 pb-28">
                {DRAWER_GROUPS.map((g) => (
                  <section key={g.group}>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-ink/45">
                      {g.group}
                    </p>
                    <div className="space-y-2">
                      {g.items.map((it) => (
                        <a
                          key={it.label}
                          href={it.href}
                          onClick={() => setDrawerOpen(false)}
                          className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/[0.03] transition active:scale-[0.98]"
                        >
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${it.tint} text-white`}>
                            <it.icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink">
                              {it.label}
                            </span>
                            <span className="block truncate text-[11px] text-ink/55">
                              {it.description}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                        </a>
                      ))}
                    </div>
                  </section>
                ))}

                <a
                  href={WEBAPP_URL}
                  className="block w-full rounded-2xl bg-brand-gradient py-3.5 text-center text-sm font-bold text-white shadow-glow"
                >
                  Create your ClickCard
                </a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

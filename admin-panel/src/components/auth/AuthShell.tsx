import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PERKS = [
  { icon: Zap, text: "Claim clickcard.app/you in seconds" },
  { icon: Sparkles, text: "Design cards, resumes & QR in the Studio" },
  { icon: ShieldCheck, text: "Passwordless, secure email OTP login" },
];

/** Split-screen auth layout: vibrant brand panel + form panel. */
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-mist dark:bg-[#0c0820]">
      {/* brand panel */}
      <div className="relative hidden w-[44%] overflow-hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-candy-pink/40 blur-3xl animate-floatSlow" />
        <div className="absolute -right-10 bottom-16 h-64 w-64 rounded-full bg-candy-cyan/40 blur-3xl animate-float" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Logo href="/" />
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-black leading-tight"
            >
              One link for your
              <br />
              whole identity.
            </motion.h2>
            <p className="mt-4 max-w-sm text-white/80">
              Profile, digital card, resume, QR & analytics — beautifully shareable.
            </p>
            <div className="mt-8 space-y-3">
              {PERKS.map((p, i) => (
                <motion.div
                  key={p.text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-sm"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
                    <p.icon size={18} />
                  </span>
                  <span className="text-sm font-semibold">{p.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} ClickCard. Crafted with care.
          </p>
        </div>
      </div>

      {/* form panel */}
      <div className="relative flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo href="/" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl font-black tracking-tight text-ink dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink/60 dark:text-white/60">
                {subtitle}
              </p>
            )}
            <div className="mt-7">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

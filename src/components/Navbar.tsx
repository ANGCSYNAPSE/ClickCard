"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { WEBAPP_URL } from "@/lib/site";

const links = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "Referral", href: "#referral" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all ${
          scrolled ? "glass shadow-soft" : ""
        }`}
      >
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-11 place-items-center rounded-xl bg-brand-gradient font-display text-base font-black text-white shadow-soft tracking-tight">
            CK
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            ClickCard
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-ink/70 transition hover:text-brand-600"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={WEBAPP_URL}
            className="text-sm font-semibold text-ink/70 transition hover:text-brand-600"
          >
            Log in
          </a>
          <a
            href={WEBAPP_URL}
            className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            Get started
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl glass p-4 shadow-soft md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink/80 hover:bg-brand-50"
            >
              {l.label}
            </a>
          ))}
          <a
            href={WEBAPP_URL}
            className="mt-2 block rounded-xl bg-brand-gradient px-4 py-2 text-center text-sm font-semibold text-white"
          >
            Get started
          </a>
        </div>
      )}
    </header>
  );
}

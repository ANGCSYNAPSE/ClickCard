import Link from "next/link";
import { WEBAPP_URL } from "@/lib/site";

type FooterLink = { label: string; href: string };

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "#templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "Get started", href: WEBAPP_URL },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Students", href: WEBAPP_URL },
      { label: "Professionals", href: WEBAPP_URL },
      { label: "Businesses", href: WEBAPP_URL },
      { label: "Creators", href: WEBAPP_URL },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#features" },
      { label: "Referral", href: "#referral" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "mailto:hello@clickcard.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "mailto:privacy@clickcard.app" },
      { label: "Terms", href: "mailto:legal@clickcard.app" },
      { label: "Security", href: "mailto:security@clickcard.app" },
      { label: "Contact", href: "mailto:hello@clickcard.app" },
    ],
  },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  const cls = "text-sm text-ink/60 transition hover:text-brand-600";
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={cls}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} className={cls}>
      {link.label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-mist pt-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 pb-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white">
                C
              </span>
              <span className="font-display text-lg font-bold text-ink">ClickCard</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink/60">
              One link for your whole identity. Build, share & grow your digital presence.
            </p>
            <a
              href={WEBAPP_URL}
              className="mt-5 inline-flex rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              Get started free
            </a>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="font-display text-sm font-bold text-ink">{c.title}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <FooterAnchor link={l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-brand-100 py-6 text-sm text-ink/50 sm:flex-row">
          <p>© {new Date().getFullYear()} ClickCard. All rights reserved.</p>
          <p>Made with ♥ for creators, professionals & businesses.</p>
        </div>
      </div>
    </footer>
  );
}

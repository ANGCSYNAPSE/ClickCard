import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Inbox,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NotificationBell from "@/components/app/NotificationBell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { setSidebar } from "@/store/slices/uiSlice";
import { useRequireAdmin } from "@/lib/authGuards";

const NAV = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Manage",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
      { label: "Studio templates", href: "/studio", icon: Sparkles },
      { label: "Plans", href: "/plans", icon: CreditCard },
      { label: "Leads", href: "/leads", icon: Inbox },
      { label: "Moderation", href: "/moderation", icon: ShieldCheck },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export default function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { ready } = useRequireAdmin();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setSidebar(false));
    setMenuOpen(false);
  }, [router.asPath, dispatch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist dark:bg-[#0a0717]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/login");
  };

  const initial = (user?.username || user?.email || "A")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0a0717]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebar(false))}
        />
      )}

      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-ink/[0.06] bg-white px-4 py-5 transition-transform dark:border-white/[0.06] dark:bg-[#100b26] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Logo showText={false} />
            <div className="leading-tight">
              <p className="font-display text-sm font-black text-ink dark:text-white">ClickCard</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">Admin</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => dispatch(setSidebar(false))} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-7 flex-1 space-y-5 overflow-y-auto no-scrollbar">
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/35 dark:text-white/30">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    router.pathname === item.href ||
                    router.pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-brand-gradient text-white shadow-soft"
                          : "text-ink/65 hover:bg-brand-50 hover:text-brand-700 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          <LogOut size={18} /> Log out
        </button>
      </aside>

      {/* main */}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink/[0.06] bg-white/75 px-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0717]/75 sm:px-6">
          <button className="lg:hidden" onClick={() => dispatch(setSidebar(true))} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="relative hidden max-w-xs flex-1 sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35 dark:text-white/35" />
            <input
              placeholder="Search users…"
              className="h-10 w-full rounded-xl border border-ink/[0.07] bg-mist pl-9 pr-3 text-sm font-medium text-ink outline-none transition focus:border-brand-300 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white"
            />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 sm:block">
              ● Admin
            </span>
            <NotificationBell />
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-brand-50 py-1 pl-1 pr-2 transition hover:bg-brand-100 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-xs font-black text-white">
                  {initial}
                </span>
                <ChevronDown size={14} className="text-ink/50 dark:text-white/50" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white py-1.5 shadow-card dark:border-white/[0.06] dark:bg-[#100b26]">
                  <div className="border-b border-ink/[0.06] px-4 py-3 dark:border-white/[0.06]">
                    <p className="truncate text-sm font-bold text-ink dark:text-white">
                      {user?.username || "Admin"}
                    </p>
                    <p className="truncate text-xs text-ink/50 dark:text-white/50">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {title && (
            <h1 className="mb-6 font-display text-2xl font-black text-ink dark:text-white">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

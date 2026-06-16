import Link from "next/link";
import { cn } from "@/lib/cn";

export default function Logo({
  href = "/",
  className,
  showText = true,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="grid h-9 w-11 place-items-center rounded-xl bg-brand-gradient font-display text-base font-black tracking-tight text-white shadow-soft">
        CK
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-ink dark:text-white">
          ClickCard
        </span>
      )}
    </Link>
  );
}

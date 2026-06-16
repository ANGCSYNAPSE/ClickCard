import { stats } from "@/lib/site";
import Reveal from "./Reveal";

export default function StatsBar() {
  return (
    <section className="relative mx-auto -mt-8 max-w-5xl px-5">
      <Reveal>
        <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-50 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-gradient">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-ink/60">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

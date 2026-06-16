"use client";
import { motion } from "framer-motion";
import { Apple, Bell, Smartphone } from "lucide-react";
import PhoneMock from "./PhoneMock";

export default function MobileApp() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative grid items-center gap-12 overflow-hidden rounded-[2.5rem] bg-ink p-10 shadow-float lg:grid-cols-2 lg:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-gradient opacity-40 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-candy-cyan opacity-30 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Bell className="h-3.5 w-3.5" /> Coming soon
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Your ClickCard,{" "}
              <span className="shimmer-text animate-shimmer">in your pocket</span>.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/70">
              The ClickCard mobile app is on its way — create, update and share your
              card on the go, tap-to-share with NFC, and scan to connect instantly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 font-semibold text-ink shadow-soft">
                <Apple className="h-6 w-6" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] font-medium text-ink/50">Soon on</p>
                  <p className="text-sm">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 font-semibold text-ink shadow-soft">
                <Smartphone className="h-6 w-6" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] font-medium text-ink/50">Soon on</p>
                  <p className="text-sm">Google Play</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 4 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="animate-float"
            >
              <PhoneMock />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

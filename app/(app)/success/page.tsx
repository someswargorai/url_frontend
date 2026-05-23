"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const REDIRECT_SECONDS = 5;

const perks = [
  { icon: <Zap className="h-4 w-4" />, label: "Unlimited short links" },
  { icon: <Sparkles className="h-4 w-4" />, label: "Full analytics dashboard" },
  { icon: <Shield className="h-4 w-4" />, label: "Priority support" },
];

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutId = searchParams.get("checkout_id");

  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDone(true);
          router.push("/subscription");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const progress = ((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-6 bg-background">
      {/* subtle background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-emerald-500/10"
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: i * 280, height: i * 280, opacity: 0 }}
            transition={{ duration: 2.5, delay: i * 0.4, ease: "easeOut", repeat: Infinity, repeatDelay: 1 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">

          {/* top accent bar */}
          <div className="h-1 w-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>

          <div className="px-8 pt-10 pb-8 space-y-8">

            {/* icon */}
            <div className="flex justify-center">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.25 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
                  </motion.div>
                </motion.div>

                {/* orbiting sparkle */}
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </div>

            {/* text */}
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold tracking-tight">
                You&apos;re all set!
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your subscription is now active. Welcome to the club — here&apos;s what you unlocked:
              </p>
            </motion.div>

            {/* perks */}
            <motion.div
              className="space-y-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/50"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08, duration: 0.35 }}
                >
                  <span className="text-emerald-500">{perk.icon}</span>
                  <span className="text-sm font-medium">{perk.label}</span>
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08, type: "spring" }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* checkout id */}
            {checkoutId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <p className="text-[11px] text-muted-foreground">
                  Order reference:{" "}
                  <span className="font-mono text-foreground/70">{checkoutId}</span>
                </p>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <Button
                className="w-full h-11 font-semibold gap-2 group bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => router.push("/subscription")}
              >
                Go to Subscription Page
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={countdown}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {countdown > 0
                      ? `Redirecting automatically in ${countdown}s…`
                      : "Redirecting…"}
                  </motion.span>
                </AnimatePresence>
              </p>
            </motion.div>

          </div>
        </div>

        {/* powered by */}
        <motion.p
          className="text-center text-[11px] text-muted-foreground mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Secured & processed by{" "}
          <a
            href="https://polar.sh"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Polar
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
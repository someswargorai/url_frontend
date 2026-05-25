"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import {
  Fingerprint, Zap, Shield, MousePointer2, Link2, Sparkles,
  BarChart2, Globe, RefreshCw, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Sub-ms Redirects",
    description: "Redis-cached resolution. Every click hits the edge first — your users never wait.",
    icon: Zap,
    stat: "< 1ms",
    statLabel: "p99 latency",
    accent: "#00e5a0",
    accentBg: "rgba(0,229,160,0.06)",
    accentBorder: "rgba(0,229,160,0.15)",
    code: "GET /:short → 301",
  },
  {
    title: "Live Event Feed",
    description: "Every click, signup, and purchase streams into your dashboard in real time.",
    icon: Activity,
    stat: "Real-time",
    statLabel: "event ingestion",
    accent: "#7c6df0",
    accentBg: "rgba(124,109,240,0.06)",
    accentBorder: "rgba(124,109,240,0.15)",
    code: "purchase_completed · user_4412",
  },
  {
    title: "Global Traffic Map",
    description: "Country, city, region — every click geo-located and plotted on an interactive heatmap.",
    icon: Globe,
    stat: "180+",
    statLabel: "countries tracked",
    accent: "#00e5a0",
    accentBg: "rgba(0,229,160,0.06)",
    accentBorder: "rgba(0,229,160,0.15)",
    code: "Ashburn · Kolkata · London",
  },
  {
    title: "Funnel Analytics",
    description: "Multi-step conversion tracking. See exactly where users drop off — fix it fast.",
    icon: BarChart2,
    stat: "N-step",
    statLabel: "funnel tracking",
    accent: "#7c6df0",
    accentBg: "rgba(124,109,240,0.06)",
    accentBorder: "rgba(124,109,240,0.15)",
    code: "signup → checkout → purchase",
  },
  {
    title: "Custom Shortcodes",
    description: "Brand your links. yoursite.com/launch instead of random noise.",
    icon: Fingerprint,
    stat: "Branded",
    statLabel: "short links",
    accent: "#00e5a0",
    accentBg: "rgba(0,229,160,0.06)",
    accentBorder: "rgba(0,229,160,0.15)",
    code: "shorty.in/your-brand",
  },
  {
    title: "Retention Cohorts",
    description: "Day-1, Day-7, Day-30 retention — automatically calculated from your event data.",
    icon: RefreshCw,
    stat: "D1/D7/D30",
    statLabel: "cohort analysis",
    accent: "#7c6df0",
    accentBg: "rgba(124,109,240,0.06)",
    accentBorder: "rgba(124,109,240,0.15)",
    code: "7-day retention · 100%",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div
        className="relative h-full rounded-xl border overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
        style={{
          background: feature.accentBg,
          borderColor: feature.accentBorder,
        }}
      >
        {/* top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}60, transparent)` }}
        />

        <div className="p-6 flex flex-col h-full">
          {/* header row */}
          <div className="flex items-start justify-between mb-5">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${feature.accent}12`, border: `1px solid ${feature.accent}25` }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: feature.accent }}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-right">
              <div
                className="font-mono text-xs font-medium"
                style={{ color: feature.accent }}
              >
                {feature.stat}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {feature.statLabel}
              </div>
            </div>
          </div>

          {/* text */}
          <h3 className="text-sm font-semibold tracking-tight mb-2 text-foreground">
            {feature.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed flex-1 font-light">
            {feature.description}
          </p>

          {/* code line */}
          <div
            className="mt-5 flex items-center gap-2 rounded-md px-3 py-2"
            style={{  border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: feature.accent }}
            />
            <code
              className="text-[10px] font-mono truncate"
              style={{ color: feature.accent, opacity: 0.8 }}
            >
              {feature.code}
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-6xl mx-auto">
      {/* section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-14"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-8 bg-[#00e5a0]" />
          <span
            className="font-mono text-[11px] tracking-widest uppercase"
            style={{ color: "#00e5a0" }}
          >
            capabilities
          </span>
        </div>
        <h2
          className="font-bold tracking-tight leading-none"
          style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-2px" }}
        >
          Everything your
          <br />
          <span className="text-muted-foreground/40">links deserve</span>
        </h2>
      </motion.div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>

      {/* bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12 rounded-xl border px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "rgba(0,229,160,0.03)",
          borderColor: "rgba(0,229,160,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#00e5a0" }}
          />
          <span className="font-mono text-xs text-muted-foreground">
            Processing live events — RabbitMQ batch pipeline active
          </span> 
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: "events/batch", val: "50" },
            { label: "flush interval", val: "2s" },
            { label: "p99 write", val: "<5ms" },
          ].map((item) => (
            <div key={item.label} className="text-right">
              <div className="font-mono text-xs font-medium" style={{ color: "#00e5a0" }}>
                {item.val}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
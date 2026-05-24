"use client";

import { motion } from "framer-motion";
import { Globe, Smartphone, Users, MapPin, MousePointerClick, Activity } from "lucide-react";

const metrics = [
  { icon: MapPin,           label: "Geo-Location",  text: "Country, region, city — every click plotted on a live global heatmap.",    accent: "#00e5a0" },
  { icon: Smartphone,       label: "Device Intel",  text: "iOS, Android, Desktop split with OS and browser breakdown.",               accent: "#7c6df0" },
  { icon: Users,            label: "Referrer Graph", text: "Direct, social, search — know exactly where your traffic originates.",    accent: "#00e5a0" },
  { icon: MousePointerClick,label: "Conversion",    text: "Click-through rates per link, per campaign, per time window.",            accent: "#7c6df0" },
];

const liveEvents = [
  { event: "purchase_completed", user: "user_1111", loc: "Ashburn, US",  time: "2s ago",  accent: "#00e5a0" },
  { event: "homepage_view",      user: "user_4412", loc: "Kolkata, IN",  time: "5s ago",  accent: "#7c6df0" },
  { event: "checkout_started",   user: "user_2891", loc: "London, UK",   time: "11s ago", accent: "#00e5a0" },
  { event: "signup",             user: "anon_7291", loc: "Mumbai, IN",   time: "18s ago", accent: "#7c6df0" },
];

const bars = [38, 55, 42, 78, 61, 90, 74, 85, 58, 92, 67, 80];

export function AnalyticsSection() {
  return (
    <section id="analytics" className="py-24 px-4 md:px-10 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start gap-16">

        {/* LEFT — copy */}
        <div className="flex-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px w-8" style={{ background: "#00e5a0" }} />
              <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: "#00e5a0" }}>
                real-time analytics
              </span>
            </div>
            <h2
              className="font-bold leading-none tracking-tight mb-5"
              style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
            >
              Know exactly who is
              <br />
              <span className="text-muted-foreground/35">clicking your links.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-md">
              Every redirect fingerprinted — geo, device, referrer, OS — flowing into your
              dashboard within milliseconds via a Redis + RabbitMQ pipeline.
            </p>
          </motion.div>

          {/* metric list */}
          <div className="space-y-0">
            {metrics.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-4 py-5 border-b border-border/30 group"
                >
                  <div
                    className="mt-0.5 p-2 rounded-lg shrink-0 transition-all duration-200 group-hover:scale-105"
                    style={{
                      background: `${item.accent}10`,
                      border: `1px solid ${item.accent}20`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: item.accent }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold tracking-tight">{item.label}</h4>
                      <div className="h-px flex-1 max-w-[24px]" style={{ background: `${item.accent}40` }} />
                    </div>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* bottom stat strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-8 pt-2"
          >
            {[
              { val: "232",    label: "events today" },
              { val: "< 1ms", label: "redirect latency" },
              { val: "99.9%", label: "uptime" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-mono text-lg font-semibold" style={{ color: "#00e5a0" }}>
                  {s.val}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — dashboard mock */}
        <motion.div
          className="flex-1 w-full max-w-lg"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
          >
            {/* topbar */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ background: "#13131a", borderColor: "#1e1e2e" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {["#ff5f57","#febc2e","#28c840"].map(c => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground ml-2">
                  shorty · link analytics
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00e5a0" }} />
                <span className="font-mono text-[10px]" style={{ color: "#00e5a0" }}>LIVE</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* top stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "total clicks", val: "12,482", color: "#00e5a0" },
                  { label: "top country", val: "United States", color: "#7c6df0" },
                  { label: "mobile share", val: "82%", color: "#00e5a0" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-3"
                    style={{ background: "#13131a", border: "1px solid #1e1e2e" }}
                  >
                    <div className="font-mono text-[9px] text-muted-foreground mb-1.5 uppercase tracking-wider">
                      {s.label}
                    </div>
                    <div className="font-mono text-sm font-medium leading-none" style={{ color: s.color }}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* bar chart */}
              <div
                className="rounded-lg p-4"
                style={{ background: "#13131a", border: "1px solid #1e1e2e" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    click volume · 12h
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "#00e5a0" }}>
                    ↑ 23% vs yesterday
                  </span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {bars.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ background: i === 11 ? "#00e5a0" : "#1e1e2e" }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.4, ease: "easeOut" }}
                    />
                  ))}
                </div>
              </div>

              {/* geo split */}
              <div
                className="rounded-lg p-4"
                style={{ background: "#13131a", border: "1px solid #1e1e2e" }}
              >
                <div className="font-mono text-[10px] text-muted-foreground mb-3">
                   top cities
                </div>
                <div className="space-y-2.5">
                  {[
                    { city: "Ashburn", hits: 123, pct: 100 },
                    { city: "Unknown", hits: 70,  pct: 57  },
                    { city: "Kolkata", hits: 19,  pct: 15  },
                    { city: "Durgapur",hits: 18,  pct: 14  },
                  ].map((row) => (
                    <div key={row.city} className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0">
                        {row.city}
                      </span>
                      <div className="flex-1 h-1 rounded-full" style={{ background: "#1e1e2e" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "#00e5a0", opacity: 0.7 }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${row.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <span className="font-mono text-[10px]" style={{ color: "#00e5a0" }}>
                        {row.hits}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* live feed */}
              <div
                className="rounded-lg p-4"
                style={{ background: "#13131a", border: "1px solid #1e1e2e" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] text-muted-foreground"> live feed</span>
                  <Activity className="h-3 w-3" style={{ color: "#00e5a0" }} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  {liveEvents.map((e, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                    >
                      <div
                        className="shrink-0 px-2 py-0.5 rounded font-mono text-[9px]"
                        style={{ background: `${e.accent}12`, color: e.accent }}
                      >
                        {e.event}
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground flex-1 truncate">
                        {e.user} · {e.loc}
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: "#2a2a3d" }}>
                        {e.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
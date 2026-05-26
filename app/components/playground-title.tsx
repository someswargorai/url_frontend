"use client";

import { motion } from "framer-motion";

const chars1 = "Preview the ".split("");
const chars2 = "Shorty".split("");
const chars3 = " Dashboard".split("");
const chars4 = "Know your links.".split("");

export function DashboardPreviewHeader() {
  return (
    <div className="space-y-4">

      {/* eyebrow */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <div className="h-px w-6" style={{ background: "#00e5a0" }} />
        <span
          className="font-mono text-[11px] tracking-widest uppercase"
          style={{ color: "#00e5a0" }}
        >
          interactive demo · no auth required
        </span>
      </motion.div>

      {/* headline char-by-char */}
      <div
        className="font-bold leading-none"
        style={{ fontSize: "clamp(28px, 5vw, 56px)", letterSpacing: "-2px" }}
      >
        {/* "Preview the " */}
        <span>
          {chars1.map((char, i) => (
            <motion.span
              key={`c1-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: "easeOut" }}
            >
              {char}
            </motion.span>
          ))}
        </span>

        {/* "Shorty" — green */}
        {chars2.map((char, i) => (
          <motion.span
            key={`c2-${i}`}
            style={{ color: "#00e5a0" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: chars1.length * 0.03 + i * 0.04,
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {char}
          </motion.span>
        ))}

        {/* " Dashboard" */}
        {chars3.map((char, i) => (
          <motion.span
            key={`c3-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (chars1.length + chars2.length) * 0.03 + i * 0.03,
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {char}
          </motion.span>
        ))}

        {/* line break + dim subtitle */}
        <br />
        <span style={{ color: "rgba(255,255,255,0.12)" }}>
          {chars4.map((char, i) => (
            <motion.span
              key={`c4-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.8 + i * 0.035,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </div>

      {/* blinking cursor */}
      <motion.span
        className="inline-block w-0.5 h-8 ml-1 align-middle rounded-sm"
        style={{ background: "#00e5a0", verticalAlign: "middle" }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />

      {/* description */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="flex items-start gap-3 max-w-lg"
      >
        <div
          className="mt-1 shrink-0 px-1.5 py-0.5 rounded font-mono text-[9px]"
          style={{
            background: "rgba(0,229,160,0.08)",
            color: "#00e5a0",
            border: "1px solid rgba(0,229,160,0.2)",
          }}
        >
          NOTE
        </div>
        <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#6b6b85" }}>
          State-only demo of the authenticated product. Mirrors real screens
          without API calls, auth, or persistence.
        </p>
      </motion.div>

      {/* live indicator strip */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left" }}
        className="flex items-center gap-4 pt-1"
      >
        {[
          { val: "0ms",    label: "api latency" },
          { val: "local",  label: "state only"  },
          { val: "100%",   label: "ui coverage" },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            {i > 0 && (
              <div className="w-px h-4" style={{ background: "#1e1e2e" }} />
            )}
            <div>
              <div className="font-mono text-xs font-medium" style={{ color: "#00e5a0" }}>
                {s.val}
              </div>
              <div className="font-mono text-[9px]" style={{ color: "#3a3a52" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
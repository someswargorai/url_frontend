"use client";

import {  useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, Check, Loader2, Scissors, Zap, Star,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { AnalyticsSection } from "./components/analytics";
import { PricingSection } from "./components/pricing";
import { FeaturesSection } from "./components/features";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DocumentationPage from "./components/docs";
import PlayGroundSimulator from "./components/play-ground-simulator";

const pulseRings = [1, 2, 3];

const stats = [
  { val: "10M+",  label: "links created",    accent: "#00e5a0", sub: "and counting" },
  { val: "500M+", label: "clicks tracked",   accent: "#7c6df0", sub: "across all projects" },
  { val: "99.9%", label: "uptime SLA",       accent: "#00e5a0", sub: "Redis + edge cache" },
  { val: "< 1ms", label: "redirect latency", accent: "#7c6df0", sub: "p99 globally" },
];

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { status } = useSession();
  const router = useRouter();


  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setShortUrl(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/url-short`, {url:url});
      if(response?.data){
        setShortUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${response?.data?.url}`);
        toast.success("URL shortened successfully!");
      }
    } catch (error) {
      if(axios.isAxiosError(error)){
        toast.error(error?.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}
      
      {/* --- HERO SECTION --- */}
       <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">

      {/* background grid */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#00e5a0 1px, transparent 1px), linear-gradient(90deg, #00e5a0 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent 70%)" }}
        />
        <div
          className="absolute top-1/4 right-[10%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,109,240,0.05), transparent 70%)" }}
        />
      </div>

  <div className="container px-4 mx-auto text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* badge */}
      <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border font-mono text-[11px] tracking-widest"
        style={{ background: "rgba(0,229,160,0.05)", borderColor: "rgba(0,229,160,0.2)", color: "#00e5a0" }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00e5a0" }} />
        more than just a link shortener
      </div>

      {/* headline */}
      <h1
        className="font-bold leading-none tracking-tight mb-6"
        style={{ fontSize: "clamp(40px, 7vw, 96px)", letterSpacing: "-4px" }}
      >
        Shorten Links.
        <br />
        <span style={{ color: "#00e5a0" }}>Expand Reach.</span>
      </h1>

      <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-12 font-light leading-relaxed">
        Create short, branded links in seconds. Track performance, optimize for
        conversion, and take control of your digital presence.
      </p>
    </motion.div>

    {/* FORM CARD */}
    <div className="w-full max-w-2xl mx-auto space-y-4 relative">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
      >
        {/* topbar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ background: "#13131a", borderColor: "#1e1e2e" }}
        >
          <div className="flex items-center gap-1.5">
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            shorty · url shortener
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00e5a0" }} />
            <span className="font-mono text-[10px]" style={{ color: "#00e5a0" }}>READY</span>
          </div>
        </div>

        {/* form body */}
        <div className="p-5">
          <form
            onSubmit={status === "authenticated"
              ? (e) => { e.preventDefault(); router.push("/shorten-url"); }
              : handleShorten
            }
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Input
                type="url"
                placeholder="Paste your long link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 font-mono text-sm px-4 border-0 rounded-lg"
                style={{ background: "#13131a", color: "var(--foreground)" }}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-6 font-semibold text-sm gap-2 shrink-0 rounded-lg border-0"
              style={{ background: "#00e5a0", color: "#000" }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                : <><Scissors className="h-4 w-4" strokeWidth={1.5} /> Shorten Now</>
              }
            </Button>
          </form>

          {/* bottom hint */}
          <div className="flex items-center gap-4 mt-3">
            {["no account needed", "instant redirect", "full analytics"].map((t, i) => (
              <div key={t} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-px h-3" style={{ background: "#1e1e2e" }} />}
                <span className="font-mono text-[9px] text-muted-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* result card */}
      <AnimatePresence>
        {shortUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "#0d0d12", borderColor: "rgba(0,229,160,0.2)" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, #00e5a0, transparent)" }}
              />
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 truncate text-left">
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)" }}
                  >
                    <Zap className="h-4 w-4" style={{ color: "#00e5a0" }} strokeWidth={1.5} />
                  </div>
                  <div className="truncate">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">
                      your shortened link
                    </p>
                    <p
                      className="font-mono text-lg font-semibold truncate"
                      style={{ color: "#00e5a0" }}
                    >
                      {shortUrl}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="shrink-0 gap-2 h-11 px-5 rounded-lg font-mono text-xs border-0"
                  style={{ background: "rgba(0,229,160,0.1)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.2)" }}
                  onClick={copyToClipboard}
                >
                  {copied
                    ? <><Check className="h-4 w-4" /> Copied</>
                    : <><Copy className="h-4 w-4" /> Copy Link</>
                  }
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* social proof */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-16 flex flex-wrap justify-center items-center gap-8"
    >
      {[
        { label: "★ Trustpilot" },
        { label: "ProductHunt" },
        { label: "TechCrunch" },
      ].map((item, i) => (
        <div key={item.label} className="flex items-center gap-6">
          {i > 0 && (
            <div className="w-px h-4 hidden sm:block" style={{ background: "#1e1e2e" }} />
          )}
          <span
            className="font-mono text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-300 tracking-widest uppercase"
          >
            {item.label}
          </span>
        </div>
      ))}
    </motion.div>
  </div>
</section>

      {/* --- FEATURES SECTION --- */}
      <FeaturesSection />
      
      {/* Analytics Section */}
      <AnalyticsSection/>

      {/* PlayGround Simulator */}
      <PlayGroundSimulator/>

       {/* Documentation Section */}
      <DocumentationPage/>

      

      {/* Pricing Section */}
      <PricingSection/>

     

      {/* --- STATS SECTION --- */}
      <section className="py-6 px-4 md:px-10 max-w-6xl mx-auto">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
      >
        {/* top bar */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: "#13131a", borderColor: "#1e1e2e" }}
        >
          <span className="font-mono text-[10px] text-muted-foreground">
             system · global metrics
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00e5a0" }}
            />
            <span className="font-mono text-[10px]" style={{ color: "#00e5a0" }}>
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
          style={{ borderColor: "#1e1e2e" }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative px-8 py-8 group overflow-hidden"
              style={{ borderColor: "#1e1e2e" }}
            >
              {/* hover accent */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `${stat.accent}05` }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.accent}60, transparent)` }}
              />

              {/* index */}
              <div
                className="font-mono text-[9px] mb-4"
                style={{ color: "#2a2a3d" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* value */}
              <motion.div
                className="font-mono font-semibold leading-none mb-2"
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  color: stat.accent,
                  letterSpacing: "-1px",
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
              >
                {stat.val}
              </motion.div>

              {/* label */}
              <div className="font-mono text-[11px] text-foreground tracking-widest uppercase mb-1">
                {stat.label}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* bottom bar */}
        <div
          className="flex items-center gap-6 px-5 py-3 border-t overflow-x-auto"
          style={{ background: "#13131a", borderColor: "#1e1e2e" }}
        >
          {[
            { label: "pipeline",    val: "RabbitMQ · batch/50" },
            { label: "cache",       val: "Redis · TTL 24h"     },
            { label: "geo engine",  val: "ip-api · geoip-lite" },
            { label: "storage",     val: "MongoDB · bulkWrite" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-white" >
                {item.label}
              </span>
              <span className="font-mono text-[10px] text-white">
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>
      </section>
 
      {/* --- CTA SECTION --- */}
      <section className="py-24 px-4 md:px-10 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-xl border overflow-hidden"
        style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
      >
        {/* top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #00e5a0, transparent)" }}
        />

        {/* pulsing glow center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {pulseRings.map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{ borderColor: "rgba(0,229,160,0.08)" }}
              initial={{ width: 0, height: 0, opacity: 0.6 }}
              animate={{ width: i * 320, height: i * 320, opacity: 0 }}
              transition={{
                duration: 3,
                delay: i * 0.8,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeOut",
              }}
            />
          ))}
          <div
            className="absolute w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,229,160,0.05), transparent 70%)" }}
          />
        </div>

        {/* topbar */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: "#13131a", borderColor: "#1e1e2e" }}
        >
          <span className="font-mono text-[10px] text-muted-foreground">
             shorty · get started
          </span>
          <div className="flex items-center gap-4">
            {["links", "analytics", "revenue"].map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] px-2 py-0.5 rounded"
                style={{ background: "rgba(0,229,160,0.08)", color: "#00e5a0" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* main content */}
        <div className="relative px-8 md:px-20 py-16 md:py-24 text-center">
          {/* index label */}
          <div className="font-mono text-[10px] text-white mb-8 tracking-widest">
            — start for free, upgrade when ready —
          </div>

          {/* headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="font-bold leading-none tracking-tight mb-6 text-white"
            style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-3px" }}
          >
            Know your links.
            <br />
            <span style={{ color: "#00e5a0" }}>Know your users.</span>
          </motion.h2>

          {/* sub */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto mb-12"
          >
            Every click tells a story. Funnels, retention, revenue, live logs, AI insights —
            all from a single short link. Stop flying blind.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="h-12 px-8 font-semibold gap-2 group text-sm"
              style={{ background: "#00e5a0", color: "#000", border: "none" }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Get started free
              <ArrowRight
                className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2}
              />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 font-mono text-xs hover:bg-white/5 rounded-lg"
              style={{ borderColor: "#1e1e2e", color: "var(--muted-foreground)" }}
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              view pricing →
            </Button>
          </motion.div>

          {/* bottom micro stats */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex items-center justify-center gap-8 mt-12 flex-wrap"
          >
            {[
              { val: "₹0",    label: "to start" },
              { val: "< 1ms", label: "redirect speed" },
              { val: "99.9%", label: "uptime" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                {i > 0 && (
                  <div className="w-px h-6 hidden sm:block" style={{ background: "#1e1e2e" }} />
                )}
                <div>
                  <div className="font-mono text-sm font-medium" style={{ color: "#00e5a0" }}>
                    {s.val}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* bottom bar */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ background: "#13131a", borderColor: "#1e1e2e" }}
        >
          <span className="font-mono text-[10px] text-muted-foreground">
            No credit card required · Cancel anytime
          </span>
          <span className="font-mono text-[10px]" style={{ color: "#2a2a3d" }}>
            Shorty © 2026
          </span>
        </div>
      </motion.div>
    </section>

      {/* --- FOOTER --- */}
      <footer
  className="relative border-t"
  style={{ background: "#060608", borderColor: "#1e1e2e" }}
>
 
  <div
    className="absolute top-0 left-0 right-0 h-px"
    style={{ background: "linear-gradient(90deg, transparent, #00e5a030, transparent)" }}
  />

 
  <div
    className="border-b px-6 md:px-10 py-4 flex items-center justify-between"
    style={{ borderColor: "#1e1e2e" }}
  >
    <span className="font-mono text-[10px] text-muted-foreground">
      shorty · url intelligence platform
    </span>
    <div className="flex items-center gap-6">
      {[
        { label: "pipeline",  val: "RabbitMQ" },
        { label: "cache",     val: "Redis"    },
        { label: "db",        val: "MongoDB"  },
      ].map((item) => (
        <div key={item.label} className="hidden md:flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground/40 text-white">{item.label}</span>
          <span className="font-mono text-[9px]" style={{ color: "#00e5a0", opacity: 0.6 }}>
            {item.val}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00e5a0" }} />
        <span className="font-mono text-[9px]" style={{ color: "#00e5a0" }}>
          ALL SYSTEMS OPERATIONAL
        </span>
      </div>
    </div>
  </div>

  {/* main footer row */}
  <div className="container px-6 md:px-10 mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-6">

    {/* logo */}
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)" }}
      >
        <Scissors className="h-3.5 w-3.5" style={{ color: "#00e5a0" }} strokeWidth={1.5} />
      </div>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: "16px", letterSpacing: "-0.5px" }}
      >
        <span style={{ color: "#00e5a0" }}>Shorty.</span>
      </span>
    </div>

    {/* copyright */}
    <p className="font-mono text-[10px] text-muted-foreground text-center">
      © {new Date().getFullYear()}{" "}
      <span style={{ color: "#00e5a0" }}>Shorty.</span>
      {" "}Built with Next.js & shadcn/ui. Made in India.
    </p>

    {/* links */}
    <div className="flex items-center gap-1">
      {[
        { label: "Terms",    href: "#" },
        { label: "Privacy",  href: "#" },
        { label: "API docs", href: "#" },
      ].map((item, i) => (
        <div key={item.label} className="flex items-center">
          {i > 0 && (
            <div className="w-px h-3 mx-2" style={{ background: "#1e1e2e" }} />
          )}
          <a
            href={item.href}
            className="font-mono text-[11px] text-muted-foreground transition-colors duration-200"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00e5a0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            {item.label}
          </a>
        </div>
      ))}
    </div>
  </div>
</footer>
    </div>
  );
}

"use client";

import {  useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, Check, Loader2, Scissors, Zap, Star
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

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);


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
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-90 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/40 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-4 border-primary/10 bg-gray-50 dark:bg-transparent text-primary hover:bg-primary/20 transition-colors text-xs">
              <span className="text-md font-medium tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">More than just a link shortener</span>
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Shorten Links. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">
                Expand Reach.
              </span>
            </h1>
            <p className="text-md md:text-md text-muted-foreground max-w-2xl mx-auto mb-10">
              Create short, branded links in seconds. Track performance, optimize for conversion, 
              and take control of your digital presence.
            </p>
          </motion.div>

          {/* MAIN FORM CARD */}
          <div className="w-full max-w-2xl mx-auto space-y-6 relative">
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
              <CardContent className="p-6">
                <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="url"
                      placeholder="Paste your long link here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-lg px-4"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="h-14 px-8 font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25"
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Scissors className="mr-2 h-5 w-5" />}
                    {loading ? "Creating..." : "Shorten Now"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <AnimatePresence>
              {shortUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-primary/30 bg-primary/5 backdrop-blur-md ring-1 ring-primary/20">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 truncate text-left">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Shortened Link</p>
                          <p className="text-xl font-bold text-primary truncate tracking-tight">{shortUrl}</p>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="shrink-0 rounded-xl gap-2 h-14 px-6"
                        onClick={copyToClipboard}
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        {copied ? "Copied" : "Copy Link"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 font-bold text-xl"><Star className="fill-current h-5 w-5" /> TRUSTPILOT</div>
             <div className="font-bold text-xl uppercase tracking-tighter">ProductHunt</div>
             <div className="font-bold text-xl uppercase tracking-tighter">TechCrunch</div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <FeaturesSection />
      
      {/* Analytics Section */}
      <AnalyticsSection/>

      {/* Pricing Section */}
      <PricingSection/>

      {/* --- STATS SECTION --- */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">10M+</p>
              <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Links Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">500M+</p>
              <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Clicks Tracked</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Uptime Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">24/7</p>
              <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 container px-4">
        <div className="bg-primary rounded-3xl p-8 md:p-16 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to shorten your links?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of creators and businesses who use our platform to manage their links effectively.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold " onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t">
        <div className="container px-4 mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">Shorty.</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} <span className="text-md font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">Shorty.</span> Built with Next.js & Shadcn/UI.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">API docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-border/50 bg-card/50 hover:border-primary/50 transition-all group">
      <CardContent className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
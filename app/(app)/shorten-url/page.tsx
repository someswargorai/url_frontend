"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check, Zap, Scissors, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  _id: string;
  name: string;
  isDefault: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState("");
  const [campaignId, setCampaignId] = useState<string>("default");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (status !== "authenticated") return;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/campaign`,
          {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          },
        );
        setCampaigns(response.data?.campaigns || []);

        // Find the default campaign and select it initially
        const defaultCamp = response.data?.campaigns?.find(
          (c: Campaign) => c.isDefault,
        );
        if (defaultCamp) {
          setCampaignId(defaultCamp._id);
        }
      } catch (error) {
        console.error(error);
        if (axios?.isAxiosError(error)) {
          const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
          toast.error(message); 
      }
      }
    };
    fetchCampaigns();
  }, [session?.access_token, status]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setShortUrl(null);

    const requestBody: { url: string; campaignId?: string } = { url };
    if (campaignId !== "default") {
      requestBody.campaignId = campaignId;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/url/shorten-url`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );
      if (response?.data) {
        if (response?.data?.domain) {
          setShortUrl(`${response?.data?.domain}/${response?.data?.url}`);
        } else { 
          setShortUrl(
            `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${response?.data?.url}`,
          );
        }
        toast.success("URL shortened successfully!");
      }
    } catch (error) {
      if (axios?.isAxiosError(error)) {
          const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
          toast.error(message); 
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
        style={{ fontSize: "clamp(20px, 7vw, 76px)", letterSpacing: "-1px" }}
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

      {/* MAIN FORM CARD */}
      <div className="w-full max-w-2xl mx-auto space-y-6 relative">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-md overflow-hidden ring-1 ring-white/10">
          <CardContent className="p-6">
            <form onSubmit={handleShorten} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    type="url"
                    placeholder="Paste your long link here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-14 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-lg px-4 placeholder:text-xs md:placeholder:text-sm"
                  />
                </div>
                {campaigns.length > 0 && (
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger className="h-14! w-full md:w-[200px] bg-background/50 border-border/50 focus:ring-primary/50">
                      <SelectValue placeholder="Select Campaign" />
                    </SelectTrigger>
                    <SelectContent
                      className="h-36! overflow-y-scroll"
                      align="start"
                    >
                      {campaigns.map((camp) => (
                        <SelectItem
                          key={camp._id}
                          value={camp._id}
                          className="h-10!"
                        >
                          {camp.name} {camp.isDefault && "(Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Shortened Link
                      </p>
                      <p className="text-xl font-bold text-primary truncate tracking-tight">
                        {shortUrl}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="shrink-0 rounded-xl gap-2 h-14 px-6"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check, Zap, Scissors } from "lucide-react";
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
    <div className="min-h-[20vh] bg-background relative overflow-hidden flex flex-col justify-center items-center">
      {/* background grid */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
       
     
        <div
          className="absolute top-1/4 right-[10%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,109,240,0.05), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl space-y-8 flex flex-col items-center">
        {/* Header and badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-2xl gap-3"
        >
          {/* badge */}
          <div
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border font-mono text-[9px] uppercase tracking-widest bg-[#00e5a0]/5 border-[#00e5a0]/20 text-[#00e5a0]"
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
            more than just a link shortener
          </div>

          {/* headline */}
          <h1
            className="font-bold tracking-tight dark:text-white font-mono text-3xl md:text-5xl lg:text-6xl leading-none"
            style={{ letterSpacing: "-1.5px" }}
          >
            Shorten Links. <br />
            <span style={{ color: "#00e5a0" }}>Expand Reach.</span>
          </h1>

          <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed max-w-md mt-2">
            Create short, branded links in seconds. Track performance, optimize for
            conversion, and take control of your digital presence.
          </p>
        </motion.div>

        {/* MAIN FORM CARD inside Terminal frame */}
        <div className="w-full max-w-2xl space-y-6 relative">
          <Card className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
            {/* Terminal topbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
              <div className="flex items-center gap-2">
                {/* macOS window control dots */}
                <div className="flex items-center gap-1.5 shrink-0 mr-1">
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                  system · shorten helper
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
                <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                  READY
                </span>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleShorten} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="url"
                      placeholder="Paste your long link here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 bg-[#13131a] border-[#1e1e2e] text-white focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:border-[#00e5a0] font-mono text-xs px-4 placeholder:text-zinc-500 rounded-lg"
                    />
                  </div>
                  {campaigns.length > 0 && (
                    <Select value={campaignId} onValueChange={setCampaignId}>
                      <SelectTrigger className="h-12! w-full md:w-[200px] bg-[#13131a] border-[#1e1e2e] text-white focus:ring-[#00e5a0] focus:border-[#00e5a0] font-mono text-xs rounded-lg">
                        <SelectValue placeholder="Select Campaign" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-[#0d0d12] border-[#1e1e2e] text-white font-mono text-xs max-h-36 overflow-y-auto"
                        align="start"
                      >
                        {campaigns.map((camp) => (
                          <SelectItem
                            key={camp._id}
                            value={camp._id}
                            className="hover:bg-white/5 cursor-pointer text-xs"
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
                  className="h-11 px-5 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono text-xs font-semibold border-0 transition-all duration-300 gap-2 w-full justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Shortening...
                    </>
                  ) : (
                    <>
                      <Scissors className="h-4 w-4" strokeWidth={1.5} /> Shorten Now
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Shortlink Result Container */}
          <AnimatePresence>
            {shortUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="rounded-xl border-[#00e5a0]/30 bg-[#00e5a0]/5 overflow-hidden backdrop-blur-md">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 truncate text-left">
                      <div className="p-2.5 bg-[#00e5a0]/10 border border-[#00e5a0]/25 rounded-lg text-[#00e5a0] shrink-0">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <p className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                          Your Shortened Link
                        </p>
                        <p className="text-base md:text-lg font-bold font-mono text-white truncate tracking-tight mt-0.5">
                          {shortUrl}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      className="shrink-0 h-11 px-5 bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono text-xs font-semibold border-0 transition-all duration-300 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

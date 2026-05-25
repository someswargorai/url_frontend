"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    BarChart3,
    Globe,
    MousePointerClick,
    Smartphone,
    Monitor,
    WandSparkles,
} from "lucide-react";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface CampaignAnalytics {
    campaign: {
        _id: string;
        name: string;
        description: string;
        isDefault: boolean;
        createdAt: string;
    };
    totalClicks: number;
    countGraph: { count: number, _id: string }[];
    location: string[];
    devices: string[];
    browsers: string[];
    os: string[];
    referrer: string[];
}

interface AiInsightsData {
    summary: string;
    traffic_pattern: string;
    audience_insights: string;
    geo_insights: string;
    referrer_insights: string;
    anomalies: string;
    growth_recommendations: string[];
    interesting_insight: string;
}

interface ChartData {
    name: string;
    value: number;
}

const PALETTES = {
    blue: ["#00e5a0", "#7c6df0", "#05d594", "#6d5ee0", "#04c387"],
    purple: ["#7c6df0", "#6d5ee0", "#5e50cf", "#4f41be", "#4033ad"],
    pink: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
    emerald: ["#00e5a0", "#05d594", "#04c387", "#03b17a", "#029e6d"],
    orange: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
    red: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"],
};

function renderMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

export default function CampaignStatsPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { data: session, status } = useSession();
    const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (status !== "authenticated" || !id) return;
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/campaign/${id}/analytics`, {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });
                setAnalytics(response.data.analytics);
            } catch (error) {
                if (axios?.isAxiosError(error)) {
                    const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                    toast.error(message); 
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [id, session?.access_token, status]);

    const viewAiInsights = async () => {
        if (aiInsights || aiLoading) return;
        setAiLoading(true);
        setAiError(null);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/campaign/${id}/ai-insights`, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });
            const cleanedText = response.data.aiText.replace(/```json\n?|```/g, "").trim();
            const parsed = JSON.parse(cleanedText);
            setAiInsights(parsed);
        } catch (error) {
            console.error("Failed to fetch AI insights:", error);
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message); 
            }
            setAiError("Failed to load AI insights. Please try again later.");
        } finally {
            setAiLoading(false);
        }
    }

    const processData = (data: string[] | undefined): ChartData[] => {
        if (!data || data.length === 0) return [];
        const counts = data.reduce((acc: Record<string, number>, item) => {
            const key = item || "Unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    const deviceData = useMemo(() => processData(analytics?.devices), [analytics]);
    const browserData = useMemo(() => processData(analytics?.browsers), [analytics]);
    const osData = useMemo(() => processData(analytics?.os), [analytics]);
    const referrerData = useMemo(() => {
        const referrers = analytics?.referrer?.map(ref => {
            if (!ref || ref === "Direct") return "Direct Traffic";
            try {
                const url = new URL(ref);
                return url.hostname;
            } catch (e) {
                return ref;
            }
        });
        return processData(referrers);
    }, [analytics]);

    const formattedClickHistory = useMemo(() => {
        if (!analytics?.countGraph) return [];
        return [...analytics.countGraph]
            .sort((a, b) => new Date(a._id).getTime() - new Date(b._id).getTime())
            .map(item => ({
                time: `${item._id?.split("T")[0]} ${new Date(item._id).toLocaleTimeString("en-Us", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })}`,
                clicks: item.count,
            }));
    }, [analytics]);

    const countryData = useMemo(() => {
        const countries = analytics?.location?.map(loc => {
            if (loc === "Unknown Location") return "Unknown";
            const parts = loc.split(', ');
            return parts[parts.length - 1] || "Unknown";
        });
        return processData(countries);
    }, [analytics]);

    const cityData = useMemo(() => {
        const cities = analytics?.location?.map(loc => {
            if (loc === "Unknown Location") return "Unknown";
            return loc.split(', ')[0] || "Unknown";
        });
        return processData(cities);
    }, [analytics]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                {/* background grid */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(#00e5a0 1px, transparent 1px), linear-gradient(90deg, #00e5a0 1px, transparent 1px)`,
                            backgroundSize: "48px 48px",
                        }}
                    />
                </div>
                <div className="container mx-auto px-4 py-10 space-y-8 relative z-10">
                    <Skeleton className="h-10 w-44 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e]" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-[140px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e]" />
                        <Skeleton className="h-[140px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e]" />
                        <Skeleton className="h-[140px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e]" />
                    </div>
                    <Skeleton className="h-[400px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e]" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Skeleton className="h-[350px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e]" />
                        <Skeleton className="h-[350px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center text-center px-4">
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(#00e5a0 1px, transparent 1px), linear-gradient(90deg, #00e5a0 1px, transparent 1px)`,
                            backgroundSize: "48px 48px",
                        }}
                    />
                </div>
                <div className="max-w-md w-full rounded-xl border p-8 bg-[#0d0d12] border-[#1e1e2e] relative z-10 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 text-[#00e5a0]">
                            <BarChart3 className="h-8 w-8 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-xl font-mono font-bold mb-3 text-white">CAMPAIGN NOT FOUND</h2>
                    <p className="text-zinc-400 font-light text-sm mb-6">
                        The requested campaign ID could not be loaded or is unavailable.
                    </p>
                    <Button 
                        onClick={() => router.push("/campaigns")}
                        className="w-full h-11 font-mono text-xs rounded-lg border-0 shadow-md font-semibold cursor-pointer"
                        style={{ background: "#00e5a0", color: "#000" }}
                    >
                        Back to Campaigns
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
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
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent 70%)" }}
                />
                <div
                    className="absolute top-1/2 right-[10%] w-[350px] h-[350px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(124,109,240,0.05), transparent 70%)" }}
                />
            </div>

            <div className="container mx-auto px-4 py-8 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 hover:bg-white/5 border border-transparent  rounded-lg gap-2 cursor-pointer font-mono text-xs text-zinc-400 hover:text-[#00e5a0] transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaigns
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight  font-mono text-black dark:text-white" style={{ letterSpacing: "-1px" }}>
                                    {analytics.campaign.name} Insights
                                </h1>
                                <Dialog open={open}
                                    onOpenChange={(value) => {
                                        if (value) {
                                            viewAiInsights();
                                        }
                                        setOpen(value);
                                    }}>
                                    <TooltipProvider>
                                        <UITooltip>
                                            <TooltipTrigger asChild>
                                                <DialogTrigger asChild>
                                                    <div className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-[10px] tracking-wider cursor-pointer transition-all duration-300 shadow-sm"
                                                        style={{ background: "rgba(0,229,160,0.05)", borderColor: "rgba(0,229,160,0.2)", color: "#00e5a0" }}
                                                    >
                                                        <WandSparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
                                                        <span>AI Insights</span>
                                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
                                                        {/* Shimmer sweep */}
                                                        <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                                                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                                        </span>
                                                    </div>
                                                </DialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-[#13131a] border border-[#1e1e2e] text-zinc-300 font-mono text-xs">
                                                <p>Generate AI Insights for Campaign</p>
                                            </TooltipContent>
                                        </UITooltip>
                                    </TooltipProvider>

                                    <DialogContent 
                                        showCloseButton={false}
                                        className="
                                        max-w-3xl w-[calc(100vw-2rem)] sm:w-full
                                        max-h-[90vh] sm:max-h-[85vh]
                                        border border-[#1e1e2e]
                                        bg-[#0d0d12]
                                        text-white
                                        p-0
                                        rounded-xl
                                        shadow-2xl
                                        flex flex-col
                                        overflow-hidden
                                    ">
                                        {/* Top glow bar */}
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent" />

                                        {/* Ambient background orb */}
                                        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#00e5a0]/5 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#7c6df0]/5 blur-3xl" />

                                        {/* Sticky Header */}
                                        <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e] bg-[#13131a] z-50">
                                            <div className="flex items-center gap-3">
                                                {/* macOS window control dots */}
                                                <div className="flex items-center gap-1.5 shrink-0 mr-1.5">
                                                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                                                        <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                                                    ))}
                                                </div>
                                                <div className="h-4 w-px bg-[#1e1e2e] mr-1" />
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 rounded-lg bg-[#00e5a0]/20 blur-md" />
                                                    <div className="relative p-2 rounded-lg bg-gradient-to-br from-[#00e5a0]/15 to-[#7c6df0]/15 border border-[#00e5a0]/20">
                                                        <WandSparkles className="h-4 w-4 text-[#00e5a0]" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="text-sm sm:text-base font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00e5a0] via-[#00e5a0] to-[#7c6df0] leading-tight font-mono">
                                                        Campaign Growth Insights
                                                    </h2>
                                                </div>
                                            </div>
                                            <DialogClose asChild>
                                                <Button variant="ghost" className="h-7 w-7 p-0 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 shrink-0 cursor-pointer">
                                                    <span className="sr-only">Close</span>
                                                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                                    </svg>
                                                </Button>
                                            </DialogClose>
                                        </div>

                                        {/* Scrollable Body */}
                                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 relative space-y-4">
                                            {aiLoading ? (
                                                <div className="space-y-4 py-2">
                                                    <div className="flex items-center gap-2.5 text-[#00e5a0] mb-4">
                                                        <WandSparkles className="h-4 w-4 animate-pulse" />
                                                        <span className="font-mono text-xs font-semibold tracking-wider animate-pulse uppercase">Analyzing campaign data…</span>
                                                    </div>
                                                    <div className="h-24 w-full rounded-lg bg-[#13131a] border border-[#1e1e2e] animate-pulse" />
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="h-28 w-full rounded-lg bg-[#13131a] border border-[#1e1e2e] animate-pulse" />
                                                        <div className="h-28 w-full rounded-lg bg-[#13131a] border border-[#1e1e2e] animate-pulse" style={{ animationDelay: '150ms' }} />
                                                        <div className="h-28 w-full rounded-lg bg-[#13131a] border border-[#1e1e2e] animate-pulse" style={{ animationDelay: '300ms' }} />
                                                        <div className="h-28 w-full rounded-lg bg-[#13131a] border border-[#1e1e2e] animate-pulse" style={{ animationDelay: '450ms' }} />
                                                    </div>
                                                </div>
                                            ) : aiError ? (
                                                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                                                    <span className="mt-0.5 shrink-0">⚠</span>
                                                    <span>{aiError}</span>
                                                </div>
                                            ) : aiInsights ? (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    {/* Executive Summary */}
                                                    <div className="relative rounded-lg overflow-hidden bg-[#13131a] border border-[#1e1e2e] shadow-sm">
                                                        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-[#00e5a0] to-[#7c6df0]" />
                                                        <div className="pl-5 pr-4 py-4 sm:pl-6 sm:py-5">
                                                            <p className="font-mono text-[9px] font-bold text-[#00e5a0] uppercase tracking-widest mb-2.5">
                                                                Executive Summary
                                                            </p>
                                                            <div
                                                                className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed font-light
                                                                    prose-strong:text-white prose-strong:font-semibold
                                                                    prose-p:my-0 text-xs sm:text-sm"
                                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(aiInsights.summary) }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 2x2 grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {[
                                                            { label: 'Traffic Patterns',    icon: '📈', content: aiInsights.traffic_pattern,    tag: 'text-[#00e5a0]' },
                                                            { label: 'Audience Behavior',   icon: '👥', content: aiInsights.audience_insights,  tag: 'text-[#7c6df0]' },
                                                            { label: 'Referral & Sources',  icon: '🔗', content: aiInsights.referrer_insights,  tag: 'text-[#00e5a0]' },
                                                            { label: 'Anomalies Detected',  icon: '🔍', content: aiInsights.anomalies,          tag: 'text-[#7c6df0]' },
                                                        ].map(({ label, icon, content, tag }) => (
                                                            <div key={label} className="relative rounded-lg bg-[#13131a] border border-[#1e1e2e] shadow-sm p-4 flex flex-col gap-2">
                                                                <p className={`font-mono text-[9px] font-bold ${tag} uppercase tracking-widest flex items-center gap-1.5`}>
                                                                    <span>{icon}</span>{label}
                                                                </p>
                                                                <div
                                                                    className="prose prose-sm prose-invert max-w-none text-zinc-400 leading-relaxed text-[12px] font-light
                                                                        prose-strong:text-zinc-200 prose-strong:font-semibold
                                                                        prose-p:my-0"
                                                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Growth Recommendations */}
                                                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-[#00e5a0]/5 to-transparent border border-[#00e5a0]/15 shadow-sm">
                                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#00e5a0]/50 to-transparent" />
                                                        <div className="p-4 sm:p-5">
                                                            <p className="font-mono text-[9px] font-bold text-[#00e5a0] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                                <span>🚀</span> Growth Recommendations
                                                            </p>
                                                            <ul className="space-y-2.5">
                                                                {aiInsights.growth_recommendations.map((rec, idx) => (
                                                                    <li key={idx} className="flex items-start gap-3">
                                                                        <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#00e5a0] shadow-[0_0_8px_rgba(0,229,160,0.8)]" />
                                                                        <div
                                                                            className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed text-[12px] font-light
                                                                                prose-strong:text-white prose-strong:font-semibold
                                                                                prose-p:my-0"
                                                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(rec) }}
                                                                        />
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    {/* Key Insight */}
                                                    {aiInsights.interesting_insight && (
                                                        <div className="relative rounded-lg overflow-hidden bg-[#13131a] border border-[#1e1e2e] shadow-sm p-4">
                                                            <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#7c6df0]" />
                                                            <p className="font-mono text-[9px] font-bold text-[#7c6df0] uppercase tracking-widest mb-1.5 pl-1">
                                                                ✦ Key Insight
                                                            </p>
                                                            <div
                                                                className="prose prose-sm prose-invert max-w-none text-zinc-300 italic leading-relaxed text-[12px] font-light
                                                                    prose-strong:text-white prose-strong:not-italic prose-strong:font-semibold
                                                                    prose-p:my-0 pl-1"
                                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(aiInsights.interesting_insight) }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <p className="text-zinc-400 font-light text-sm max-w-xl">
                                {analytics.campaign.description || "Aggregated insights for all links in this campaign."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Campaign Clicks"
                        value={analytics.totalClicks}
                        icon={<MousePointerClick className="h-4.5 w-4.5" />}
                        delay={0.05}
                        accentColor="#00e5a0"
                    />
                    <StatsCard
                        title="Top Country"
                        value={countryData[0]?.name || "N/A"}
                        icon={<Globe className="h-4.5 w-4.5" />}
                        delay={0.1}
                        accentColor="#7c6df0"
                    />
                    <StatsCard
                        title="Top Referrer"
                        value={referrerData[0]?.name || "Direct"}
                        icon={<BarChart3 className="h-4.5 w-4.5" />}
                        delay={0.15}
                        accentColor="#00e5a0"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
                        {/* Terminal topbar */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
                            <div className="flex items-center gap-2">
                                {/* macOS window control dots */}
                                <div className="flex items-center gap-1.5 shrink-0 mr-1">
                                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                                        <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                                    ))}
                                </div>
                                <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
                                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                                    system · click history
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
                                <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                                    ACTIVE MONITOR
                                </span>
                            </div>
                        </div>

                        <CardContent className="pt-6">
                            <div className="h-[300px] w-full">
                                {formattedClickHistory.length > 0 ? (
                                    <ChartContainer config={{ clicks: { label: "Clicks", color: "#00e5a0" } }}>
                                        <AreaChart data={formattedClickHistory} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e2e" />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6e6e80', fontSize: 10, fontFamily: 'monospace' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6e6e80', fontSize: 10, fontFamily: 'monospace' }}
                                                dx={-5}
                                            />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Area
                                                type="monotone"
                                                dataKey="clicks"
                                                stroke="#00e5a0"
                                                strokeWidth={1.5}
                                                fillOpacity={1}
                                                fill="url(#colorClicks)"
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-xs">
                                        No click history available for this campaign
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Devices Chart */}
                    <ChartSection
                        title="Devices"
                        description="User distribution by device type"
                        data={deviceData}
                        icon={<Smartphone className="h-5 w-5 text-blue-400" />}
                        delay={0.2}
                        colorScheme="blue"
                    />

                    {/* Browsers Chart */}
                    <ChartSection
                        title="Browsers"
                        description="Most used browsers for this campaign"
                        data={browserData}
                        icon={<Globe className="h-5 w-5 text-orange-400" />}
                        delay={0.25}
                        colorScheme="orange"
                    />

                    {/* OS Chart */}
                    <ChartSection
                        title="Operating Systems"
                        description="User OS distribution"
                        data={osData}
                        icon={<Monitor className="h-5 w-5 text-purple-400" />}
                        delay={0.3}
                        colorScheme="purple"
                    />

                    {/* Countries Chart */}
                    <ChartSection
                        title="Countries"
                        description="Distribution by country"
                        data={countryData}
                        icon={<Globe className="h-5 w-5 text-emerald-400" />}
                        delay={0.35}
                        colorScheme="emerald"
                    />

                    {/* Cities Chart */}
                    <ChartSection
                        title="Cities"
                        description="Distribution by city"
                        data={cityData}
                        icon={<Globe className="h-5 w-5 text-blue-400" />}
                        delay={0.4}
                        colorScheme="blue"
                    />

                    {/* Referrers Chart */}
                    <ChartSection
                        title="Referrers"
                        description="Traffic sources for this campaign"
                        data={referrerData}
                        icon={<BarChart3 className="h-5 w-5 text-pink-400" />}
                        delay={0.45}
                        colorScheme="pink"
                    />
                </div>
            </div>
        </div>
    );
}

function StatsCard({ 
    title, 
    value, 
    icon, 
    delay,
    accentColor = "#00e5a0"
}: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    delay: number;
    accentColor?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group relative"
        >
            <Card className="rounded-xl border-[#1e1e2e] bg-[#0d0d12] h-[130px] overflow-hidden transition-all duration-300 relative">
                {/* top border glow sweep */}
                <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                />
                {/* subtle corner sweep */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top, ${accentColor}02, transparent 60%)` }}
                />
                <CardContent className="p-6 flex items-center justify-between h-full relative z-10">
                    <div className="space-y-1.5">
                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{title}</p>
                        <h2 className="font-mono font-semibold text-3xl tracking-tight" style={{ color: accentColor }}>
                            {value}
                        </h2>
                    </div>
                    <div 
                        className="p-3.5 rounded-lg border transition-colors duration-300"
                        style={{ 
                            background: "rgba(19, 19, 26, 0.6)", 
                            borderColor: "#1e1e2e",
                            color: accentColor 
                        }}
                    >
                        {icon}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ChartSection({
    title,
    description,
    data,
    icon,
    delay,
    colorScheme = "blue"
}: {
    title: string;
    description: string;
    data: ChartData[];
    icon: React.ReactNode;
    delay: number;
    colorScheme?: keyof typeof PALETTES;
}) {
    const palette = PALETTES[colorScheme];
    const config: ChartConfig = {
        value: {
            label: "Clicks",
            color: palette[0],
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="rounded-xl border-[#1e1e2e] overflow-hidden h-full bg-[#0d0d12]">
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
                            segment · {title.toLowerCase()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-mono text-[8px] text-zinc-600 tracking-wider">
                            LOG_OK
                        </span>
                    </div>
                </div>

                <CardHeader className="pb-4 pt-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-[#00e5a0]">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">{title}</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs font-light">{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2 px-6 pb-6">
                    <div className="h-[250px] w-full overflow-y-auto">
                        {data.length > 0 ? (
                            <ChartContainer config={config}>
                                <BarChart data={data} layout="vertical" margin={{ left: 20, right: 10, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e1e2e" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        position={{x:0, y:0}}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-600 font-mono text-xs">
                                No data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}


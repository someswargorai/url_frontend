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
    Link2,
    WandSparkles,
    Database,
} from "lucide-react";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import QR from "../../common/Qr";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface UrlStats {
    _id: string;
    shortUrl: string;
    private: boolean;
    longUrl: string;
    countGraph: { count: number, _id: string }[];
    location: string[];
    devices: string[];
    browsers: string[];
    os: string[];
    referrer: string[];
    createdAt: string;
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
    blue: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
    purple: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
    pink: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
    emerald: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
    orange: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
    red: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"],
};

export function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

export default function ShowStatsPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<UrlStats | null>(null);
    const [clickHistory, setClickHistory] = useState<{ count: number, _id: string }[]>([]);
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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/url/stats/${id}`, {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });
                setStats(response.data.urlStats);
                setClickHistory(response.data.clickStateWithMinutes || []);
            } catch (error) {
                console.error("Error fetching stats:", error);
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/url/ai-insights/${id}`, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });
            const cleanedText = response.data.aiText.replace(/```json\n?|```/g, "").trim();
            const parsed = JSON.parse(cleanedText);
            setAiInsights(parsed);
        } catch (error) {
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message); 
            }
            console.error("Failed to fetch AI insights:", error);
            setAiError("Failed to load AI insights. Please try again later.");
        } finally {
            setAiLoading(false);
        }
    }

    const updateUrl = async (id: string, privacy: boolean) => {
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/url/update-url/${id}`, {
                privacy: !privacy,
            }, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });
            if (res.data?.success) {
                toast.success(res.data?.message);
                setStats((prev) => prev ? { ...prev, private: !prev.private } : prev);
            }
        } catch (error) {
            console.error("Error updating URL:", error);
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message); 
            }
        }
    };
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

    const deviceData = useMemo(() => processData(stats?.devices), [stats]);
    const browserData = useMemo(() => processData(stats?.browsers), [stats]);
    const osData = useMemo(() => processData(stats?.os), [stats]);
    const referrerData = useMemo(() => {
        const referrers = stats?.referrer?.map(ref => {
            if (!ref || ref === "Direct") return "Direct Traffic";
            try {
                const url = new URL(ref);
                return url.hostname;
            } catch (e) {
                return ref;
            }
        });
        return processData(referrers);
    }, [stats]);

    const formattedClickHistory = useMemo(() => {
        return [...clickHistory]
            .sort((a, b) => new Date(a._id).getTime() - new Date(b._id).getTime())
            .map(item => ({
                time: `${item._id?.split("T")[0]} ${new Date(item._id).toLocaleTimeString("en-Us", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })}`,
                clicks: item.count,

            }));
    }, [clickHistory]);

    const countryData = useMemo(() => {
        const countries = stats?.location?.map(loc => {
            if (loc === "Unknown Location") return "Unknown";
            const parts = loc.split(', ');
            return parts[parts.length - 1] || "Unknown";
        });
        return processData(countries);
    }, [stats]);

    const cityData = useMemo(() => {
        const cities = stats?.location?.map(loc => {
            if (loc === "Unknown Location") return "Unknown";
            return loc.split(', ')[0] || "Unknown";
        });
        return processData(cities);
    }, [stats]);

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
                    <div
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent 70%)" }}
                    />
                    <div
                        className="absolute top-1/4 right-[10%] w-[300px] h-[300px] rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(124,109,240,0.05), transparent 70%)" }}
                    />
                </div>
                <div className="container mx-auto px-4 py-10 space-y-8 relative z-10">
                    <Skeleton className="h-10 w-44 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse animate-pulse" />
                        <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse animate-pulse" />
                        <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Skeleton className="h-[300px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse animate-pulse" />
                        <Skeleton className="h-[300px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center text-center px-4">
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
                <div className="max-w-md w-full rounded-xl border p-8 bg-[#0d0d12] border-[#1e1e2e] relative z-10 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 text-[#00e5a0]">
                            <Database className="h-8 w-8 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-xl font-mono font-bold mb-3 text-white">STATS NOT FOUND</h2>
                    <p className="text-zinc-400 font-light text-sm mb-6">
                        The requested stats or click records could not be loaded.
                    </p>
                    <Button 
                        onClick={() => router.push("/urls")}
                        className="w-full h-11 font-mono text-xs rounded-lg border-0 shadow-md font-semibold cursor-pointer"
                        style={{ background: "#00e5a0", color: "#000" }}
                    >
                        Back to URLs
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
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent 70%)" }}
                />
                <div
                    className="absolute top-1/4 right-[10%] w-[300px] h-[300px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(124,109,240,0.05), transparent 70%)" }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 pb-20 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 border border-transparent rounded-lg gap-2 cursor-pointer font-mono text-xs text-zinc-400 hover:text-[#00e5a0] transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to URLs
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3.5">
                                <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
                                    URL <span style={{ color: "#00e5a0" }}>Statistics</span>
                                </h1>
                                <Dialog open={open} onOpenChange={(value) => {
                                    if (value) {
                                        viewAiInsights();
                                    }
                                    setOpen(value);
                                }}>
                                    <TooltipProvider>
                                        <UITooltip>
                                            <TooltipTrigger asChild>
                                                <DialogTrigger asChild>
                                                    <div className="group relative flex items-center gap-2 h-9 px-3.5 bg-white/5 border border-blue-400/20 text-blue-400 hover:text-blue-300 hover:border-blue-400/40 rounded-lg cursor-pointer transition-all duration-200 font-mono text-xs font-semibold">
                                                        <WandSparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
                                                        <span>AI Insights</span>
                                                        <span className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
                                                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                                        </span>
                                                    </div>
                                                </DialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Generate AI Insights</p>
                                            </TooltipContent>
                                        </UITooltip>
                                    </TooltipProvider>

                                    <DialogContent 
                                        showCloseButton={false}
                                        className="max-w-3xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] sm:max-h-[85vh] border border-[#1e1e2e] bg-[#0d0d12] text-white p-0 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
                                        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-600/5 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-indigo-600/5 blur-3xl" />

                                        {/* Sticky Header */}
                                        <div className="flex-none flex items-center gap-3.5 p-5 sm:p-7 border-b border-[#1e1e2e] bg-[#13131a] z-50">
                                            <div className="relative shrink-0">
                                                <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md" />
                                                <div className="relative p-2.5 rounded-xl bg-[#13131a] border border-[#1e1e2e] shadow-inner">
                                                    <WandSparkles className="h-5 w-5 text-blue-400" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 font-mono text-left">
                                                <h2 className="text-sm font-bold tracking-wider uppercase text-white">
                                                    ShortyAI Insights
                                                </h2>
                                                <p className="text-zinc-500 text-[10px] uppercase font-light mt-0.5">
                                                    Deep analytical intelligence generated for your link.
                                                </p>
                                            </div>
                                            <DialogClose asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 ml-auto shrink-0 cursor-pointer">
                                                    <span className="sr-only">Close</span>
                                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                                    </svg>
                                                </Button>
                                            </DialogClose>
                                        </div>

                                        {/* Scrollable Body */}
                                        <div className="flex-1 overflow-y-auto p-5 sm:p-7 relative space-y-5">
                                            {aiLoading ? (
                                                <div className="space-y-4 py-4 font-mono text-xs">
                                                    <div className="flex items-center gap-2.5 text-blue-400 mb-5">
                                                        <WandSparkles className="h-4 w-4 animate-pulse" />
                                                        <span className="text-xs font-semibold tracking-wide animate-pulse uppercase">Analyzing link data…</span>
                                                    </div>
                                                    <div className="h-24 w-full rounded-2xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="h-28 w-full rounded-2xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                                                        <div className="h-28 w-full rounded-2xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" style={{ animationDelay: '150ms' }} />
                                                    </div>
                                                </div>
                                            ) : aiError ? (
                                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
                                                    <span className="mt-0.5 shrink-0 text-base">⚠</span>
                                                    <span>{aiError}</span>
                                                </div>
                                            ) : aiInsights ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 font-mono text-xs text-left">
                                                    {/* Executive Summary */}
                                                    <div className="relative rounded-xl overflow-hidden bg-[#13131a] border border-[#1e1e2e] shadow-sm">
                                                        <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#00e5a0] to-[#7c6df0] rounded-l-2xl" />
                                                        <div className="pl-5 pr-4 py-4 sm:pl-6 sm:py-5">
                                                            <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.12em] mb-2.5">
                                                                Executive Summary
                                                            </p>
                                                            <div
                                                                className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-p:my-0 text-xs"
                                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(aiInsights.summary) }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 2×2 grid cards */}
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {[
                                                            { label: 'Traffic Patterns',    icon: '📈', content: aiInsights.traffic_pattern,    tag: 'text-sky-400/70' },
                                                            { label: 'Audience Behavior',   icon: '👥', content: aiInsights.audience_insights,  tag: 'text-violet-400/70' },
                                                            { label: 'Referral & Sources',  icon: '🔗', content: aiInsights.referrer_insights,   tag: 'text-amber-400/70' },
                                                            { label: 'Anomalies Detected',  icon: '🔍', content: aiInsights.anomalies,           tag: 'text-rose-400/70' },
                                                        ].map(({ label, icon, content, tag }) => (
                                                            <div key={label} className="relative rounded-xl bg-[#13131a]/50 border border-[#1e1e2e] shadow-sm p-4 sm:p-5 flex flex-col gap-2.5">
                                                                <p className={`text-[10px] font-bold ${tag} uppercase tracking-[0.12em] flex items-center gap-1.5`}>
                                                                    <span>{icon}</span>{label}
                                                                </p>
                                                                <div
                                                                    className="prose prose-sm prose-invert max-w-none text-zinc-400 leading-relaxed text-xs prose-strong:text-zinc-200 prose-strong:font-semibold prose-p:my-0"
                                                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Growth Recommendations */}
                                                    <div className="relative rounded-xl overflow-hidden bg-emerald-500/[0.03] border border-[#1e1e2e] shadow-sm">
                                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-400/60 via-teal-400/40 to-transparent" />
                                                        <div className="p-4 sm:p-5 sm:pt-5 pt-5">
                                                            <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-[0.12em] mb-3.5 flex items-center gap-1.5">
                                                                <span>🚀</span> Growth Recommendations
                                                            </p>
                                                            <ul className="space-y-3">
                                                                {aiInsights.growth_recommendations.map((rec, idx) => (
                                                                    <li key={idx} className="flex items-start gap-3 group/rec text-left">
                                                                        <div className="mt-[5px] shrink-0 w-1.5 h-1.5 rounded-md bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                                                                        <div
                                                                            className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed text-xs font-medium prose-strong:text-white prose-strong:font-semibold prose-p:my-0"
                                                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(rec) }}
                                                                        />
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    {/* Key Insight */}
                                                    {aiInsights.interesting_insight && (
                                                        <div className="relative rounded-xl overflow-hidden bg-[#13131a] border border-[#1e1e2e] shadow-sm p-4 sm:p-5">
                                                            <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#7c6df0] to-fuchsia-500 rounded-l-xl" />
                                                            <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-[0.12em] mb-2 pl-1">
                                                                ✦ Key Insight
                                                            </p>
                                                            <div
                                                                className="prose prose-sm prose-invert max-w-none text-zinc-300 italic leading-relaxed text-xs prose-strong:text-white prose-strong:not-italic prose-strong:font-semibold prose-p:my-0 pl-1"
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
                            <div className="flex items-center gap-5 mt-2 md:mt-0">
                                <p className="text-zinc-400 flex items-center gap-2 text-sm font-mono">
                                    <Link2 className="h-4 w-4 text-[#00e5a0]" />
                                    {stats.shortUrl}
                                </p>
                                <div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="p-2.5 rounded-lg border bg-white/5 border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] text-zinc-300 transition-colors cursor-pointer">
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="flex items-center justify-center p-6 bg-[#0d0d12] border-[#1e1e2e] rounded-xl max-w-[280px]">
                                            <div className="p-4 bg-white rounded-lg">
                                                <QR shortUrl={stats.shortUrl} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={stats?.private}
                                        onCheckedChange={() => updateUrl(stats._id, stats.private)}
                                        className="w-10 h-5 cursor-pointer data-[state=checked]:bg-[#00e5a0]"
                                    />
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-medium">{stats?.private ? "Private" : "Public"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right mt-3 md:mt-0">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-medium mb-1">Destination</p>
                            <p className="text-sm font-mono text-zinc-300 truncate max-w-md">
                                {stats.longUrl}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Clicks"
                        value={stats?.countGraph?.length}
                        icon={<MousePointerClick className="h-4.5 w-4.5" />}
                        accentColor="#00e5a0"
                    />
                    <StatsCard
                        title="Top Country"
                        value={countryData[0]?.name || "N/A"}
                        icon={<Globe className="h-4.5 w-4.5" />}
                        accentColor="#7c6df0"
                    />
                    <StatsCard
                        title="Top Referrer"
                        value={referrerData[0]?.name || "Direct"}
                        icon={<BarChart3 className="h-4.5 w-4.5" />}
                        accentColor="#00e5a0"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
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
                                    segment · click history graph
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-[8px] text-zinc-600 tracking-wider">
                                    GRAPH_OK
                                </span>
                            </div>
                        </div>
                        <CardHeader className="pb-4 pt-4 px-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-[#00e5a0]">
                                    <BarChart3 className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Click History</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs font-light">Minute-wise activity for this URL</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 px-6 pb-6">
                            <div className="h-[300px] w-full pt-4">
                                {formattedClickHistory.length > 0 ? (
                                    <ChartContainer config={{ clicks: { label: "Clicks", color: "#00e5a0" } }}>
                                        <AreaChart data={formattedClickHistory} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e1e2e" />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
                                                dx={-10}
                                            />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Area
                                                type="monotone"
                                                dataKey="clicks"
                                                stroke="#00e5a0"
                                                strokeWidth={1}
                                                fillOpacity={1}
                                                fill="url(#colorClicks)"
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-600 font-mono text-xs">
                                        No click history available
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
                        delay={0.1}
                        colorScheme="blue"
                    />

                    {/* Browsers Chart */}
                    <ChartSection
                        title="Browsers"
                        description="Most used browsers for this link"
                        data={browserData}
                        icon={<Globe className="h-5 w-5 text-orange-400" />}
                        delay={0.15}
                        colorScheme="orange"
                    />

                    {/* OS Chart */}
                    <ChartSection
                        title="Operating Systems"
                        description="User OS distribution"
                        data={osData}
                        icon={<Monitor className="h-5 w-5 text-purple-400" />}
                        delay={0.2}
                        colorScheme="purple"
                    />

                    {/* Countries Chart */}
                    <ChartSection
                        title="Countries"
                        description="Distribution by country"
                        data={countryData}
                        icon={<Globe className="h-5 w-5 text-emerald-400" />}
                        delay={0.25}
                        colorScheme="emerald"
                    />

                    {/* Cities Chart */}
                    <ChartSection
                        title="Cities"
                        description="Distribution by city"
                        data={cityData}
                        icon={<Globe className="h-5 w-5 text-blue-400" />}
                        delay={0.3}
                        colorScheme="blue"
                    />

                    {/* Referrers Chart */}
                    <ChartSection
                        title="Referrers"
                        description="Traffic sources for this link"
                        data={referrerData}
                        icon={<BarChart3 className="h-5 w-5 text-pink-400" />}
                        delay={0.35}
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
    accentColor = "#00e5a0",
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    accentColor?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
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
                            color: accentColor,
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
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
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

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
            <div className="container mx-auto px-4 py-10 space-y-8">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] rounded-3xl" />
                    <Skeleton className="h-[400px] rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold mb-4">Stats Not Found</h2>
                <Button onClick={() => router.push("/urls")}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 hover:bg-white/5 rounded-xl gap-2 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to URLs
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 ">
                            <h1 className="text-3xl font-bold tracking-tight ">URL Statistics</h1>
                            <Dialog  open={open}
                                onOpenChange={(value) => {
                                    if (value) {
                                        viewAiInsights(); // run ONLY when opening
                                    }
                                    setOpen(value);

                                }}>
                                <TooltipProvider>
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <div className="group relative flex items-center gap-2 px-2 py-2 rounded-sm bg-gradient-to-br from-blue-500/8 to-indigo-500/12 border border-blue-400/20 text-blue-400 hover:text-blue-300 hover:border-blue-400/40 hover:from-blue-500/[0.14] hover:to-indigo-500/18 cursor-pointer transition-all duration-300 shadow-[0_0_0_0_rgba(99,130,255,0)] hover:shadow-[0_0_16px_rgba(99,130,255,0.12)]">
                                                    <WandSparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
                                                    <span className="text-xs font-semibold tracking-wide">AI Insights</span>
                                                    {/* Shimmer sweep */}
                                                    <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
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
                                    className="
                                    max-w-3xl w-[calc(100vw-2rem)] sm:w-full
                                    max-h-[90vh] sm:max-h-[85vh]
                                    border border-white/10
                                    bg-zinc-950/80 backdrop-blur-xl
                                    text-white
                                    p-0
                                    rounded-md
                                    shadow-2xl
                                    flex flex-col
                                    overflow-hidden
                                    
                                ">
                                    {/* Top glow bar */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

                                    {/* Ambient background orb */}
                                    <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-600/5 blur-3xl" />
                                    <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-indigo-600/5 blur-3xl" />

                                    {/* Sticky Header */}
                                    <div className="flex-none flex items-center gap-3.5 p-5 sm:p-7 border-b border-white/10 bg-zinc-950/50 z-50">
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md" />
                                            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-400/20 shadow-inner">
                                                <WandSparkles className="h-5 w-5 text-blue-400" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 leading-tight">
                                                ShortyAI Insights
                                            </h2>
                                            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 font-medium">
                                                Deep analytical intelligence generated for your link.
                                            </p>
                                        </div>
                                        <DialogClose asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 ml-auto shrink-0 cursor-pointer">
                                                <span className="sr-only">Close</span>
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                                </svg>
                                            </Button>
                                        </DialogClose>
                                    </div>

                                    {/* Scrollable Body */}
                                    <div className="flex-1 overflow-y-auto p-5 sm:p-7 relative space-y-5">
                                        {/* ── Loading state ── */}
                                        {aiLoading ? (
                                            <div className="space-y-4 py-4">
                                                <div className="flex items-center gap-2.5 text-blue-400 mb-5">
                                                    <WandSparkles className="h-4 w-4 animate-pulse" />
                                                    <span className="text-xs font-semibold tracking-wide animate-pulse uppercase">Analyzing link data…</span>
                                                </div>
                                                {/* Pulse skeleton */}
                                                <div className="h-24 w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="h-28 w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                                                    <div className="h-28 w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: '150ms' }} />
                                                    <div className="h-28 w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: '300ms' }} />
                                                    <div className="h-28 w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: '450ms' }} />
                                                </div>
                                            </div>
                                        ) : aiError ? (
                                            /* ── Error state ── */
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                                <span className="mt-0.5 shrink-0 text-base">⚠</span>
                                                <span>{aiError}</span>
                                            </div>
                                        ) : aiInsights ? (
                                            /* ── Insights ── */
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">

                                                {/* Executive Summary */}
                                                <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-white/5 to-white/5 border border-white/10 shadow-sm">
                                                    {/* left accent bar */}
                                                    <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-2xl" />
                                                    <div className="pl-5 pr-4 py-4 sm:pl-6 sm:py-5">
                                                        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.12em] mb-2.5">
                                                            Executive Summary
                                                        </p>
                                                        <div
                                                            className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed
                                                                prose-strong:text-white prose-strong:font-semibold
                                                                prose-p:my-0"
                                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(aiInsights.summary) }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* 2×2 grid cards */}
                                                <div className="grid grid-cols-1 gap-3">
                                                    {[
                                                        { label: 'Traffic Patterns',    icon: '📈', content: aiInsights.traffic_pattern,    accent: 'from-sky-400/[0.07] to-cyan-400/[0.04]',     border: 'border-white/10',    tag: 'text-sky-400/70' },
                                                        { label: 'Audience Behavior',   icon: '👥', content: aiInsights.audience_insights,  accent: 'from-violet-400/[0.07] to-purple-400/[0.04]', border: 'border-white/10', tag: 'text-violet-400/70' },
                                                        { label: 'Referral & Sources',  icon: '🔗', content: aiInsights.referrer_insights,   accent: 'from-amber-400/[0.07] to-orange-400/[0.04]', border: 'border-white/10',  tag: 'text-amber-400/70' },
                                                        { label: 'Anomalies Detected',  icon: '🔍', content: aiInsights.anomalies,           accent: 'from-rose-400/[0.07] to-pink-400/[0.04]',   border: 'border-white/10',   tag: 'text-rose-400/70' },
                                                    ].map(({ label, icon, content, accent, border, tag }) => (
                                                        <div key={label} className={`relative rounded-md bg-white/5 ${border} border shadow-sm p-4 sm:p-5 flex flex-col gap-2.5`}>
                                                            <p className={`text-[10px] font-bold ${tag} uppercase tracking-[0.12em] flex items-center gap-1.5`}>
                                                                <span>{icon}</span>{label}
                                                            </p>
                                                            <div
                                                                className="prose prose-sm prose-invert max-w-none text-zinc-400 leading-relaxed text-[13px]
                                                                    prose-strong:text-zinc-200 prose-strong:font-semibold
                                                                    prose-p:my-0"
                                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Growth Recommendations */}
                                                <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/4 border border-white/10 shadow-sm">
                                                    {/* top accent */}
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-400/60 via-teal-400/40 to-transparent" />
                                                    <div className="p-4 sm:p-5 sm:pt-5 pt-5">
                                                        <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-[0.12em] mb-3.5 flex items-center gap-1.5">
                                                            <span>🚀</span> Growth Recommendations
                                                        </p>
                                                        <ul className="space-y-3">
                                                            {aiInsights.growth_recommendations.map((rec, idx) => (
                                                                <li key={idx} className="flex items-start gap-3 group/rec">
                                                                    <div className="mt-[5px] shrink-0 w-1.5 h-1.5 rounded-md bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                                                                    <div
                                                                        className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed text-[13px] font-medium
                                                                            prose-strong:text-white prose-strong:font-semibold
                                                                            prose-p:my-0"
                                                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(rec) }}
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Key Insight (conditional) */}
                                                {aiInsights.interesting_insight && (
                                                    <div className="relative rounded-md overflow-hidden bg-white/5 border border-white/10 shadow-sm p-4 sm:p-5">
                                                        <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-purple-400 to-fuchsia-500 rounded-l-xl" />
                                                        <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-[0.12em] mb-2 pl-1">
                                                            ✦ Key Insight
                                                        </p>
                                                        <div
                                                            className="prose prose-sm prose-invert max-w-none text-zinc-300 italic leading-relaxed text-[13px]
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
                        <div className="flex items-center gap-5">
                            <p className="text-zinc-400 flex items-center gap-2 text-sm">
                                <Link2 className="h-4 w-4 text-blue-400" />
                                {stats.shortUrl}
                            </p>
                            <div>
                                <Dialog>

                                    <DialogTrigger>
                                        <TooltipProvider>
                                            <UITooltip>
                                                <TooltipTrigger>
                                                    <button className="p-2 rounded-md border hover:bg-gray-100 cursor-pointer">
                                                        <QrCode className="w-5 h-5" />
                                                    </button>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    <p>Show QR Code</p>
                                                </TooltipContent>
                                            </UITooltip>
                                        </TooltipProvider>
                                    </DialogTrigger>

                                    <DialogContent className="flex items-center justify-center p-5">
                                        <div>
                                            <QR shortUrl={stats.shortUrl} />
                                        </div>
                                    </DialogContent>

                                </Dialog>
                            </div>
                            <div className="flex items-center gap-1">
                            <TooltipProvider>
                                <UITooltip>
                                    <TooltipTrigger>
                                        <Switch
                                            checked={stats?.private}
                                            onCheckedChange={() => updateUrl(stats._id, stats.private)}
                                            className="w-10 h-5 cursor-pointer"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Url Privacy</p>
                                    </TooltipContent>
                                </UITooltip>
                            </TooltipProvider>
                            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{stats?.private ? "Private" : "Public"}</span>
                        </div>
                        </div>
                        
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Destination</p>
                        <p className="text-sm font-medium text-zinc-300 truncate max-w-md">
                            {stats.longUrl}
                        </p>
                    </div>
                </div>
            </motion.div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatsCard
                    title="Total Clicks"
                    value={stats?.countGraph?.length}
                    icon={<MousePointerClick className="h-5 w-5 text-blue-400" />}
                    delay={0.1}
                />
                <StatsCard
                    title="Top Country"
                    value={countryData[0]?.name || "N/A"}
                    icon={<Globe className="h-5 w-5 text-emerald-400" />}
                    delay={0.2}
                />
                <StatsCard
                    title="Top Referrer"
                    value={referrerData[0]?.name || "Direct"}
                    icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
                    delay={0.3}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-8"
            >
                <Card className="rounded-md border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <BarChart3 className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle>Click History</CardTitle>
                                <CardDescription>Minute-wise activity for this URL</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            {formattedClickHistory.length > 0 ? (
                                <ChartContainer config={{ clicks: { label: "Clicks", color: "#3b82f6" } }}>
                                    <AreaChart data={formattedClickHistory} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="1 1" vertical={false} stroke="#333" />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#888', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#888', fontSize: 12 }}
                                            dx={-10}
                                        />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="clicks"
                                            stroke="#3b82f6"
                                            strokeWidth={1}
                                            fillOpacity={1}
                                            fill="url(#colorClicks)"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500">
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
                    delay={0.4}
                    colorScheme="blue"
                />

                {/* Browsers Chart */}
                <ChartSection
                    title="Browsers"
                    description="Most used browsers for this link"
                    data={browserData}
                    icon={<Globe className="h-5 w-5 text-orange-400" />}
                    delay={0.5}
                    colorScheme="orange"
                />

                {/* OS Chart */}
                <ChartSection
                    title="Operating Systems"
                    description="User OS distribution"
                    data={osData}
                    icon={<Monitor className="h-5 w-5 text-purple-400" />}
                    delay={0.6}
                    colorScheme="purple"
                />

                {/* Countries Chart */}
                <ChartSection
                    title="Countries"
                    description="Distribution by country"
                    data={countryData}
                    icon={<Globe className="h-5 w-5 text-emerald-400" />}
                    delay={0.7}
                    colorScheme="emerald"
                />

                {/* Cities Chart */}
                <ChartSection
                    title="Cities"
                    description="Distribution by city"
                    data={cityData}
                    icon={<Globe className="h-5 w-5 text-blue-400" />}
                    delay={0.8}
                    colorScheme="blue"
                />

                {/* Referrers Chart */}
                <ChartSection
                    title="Referrers"
                    description="Traffic sources for this link"
                    data={referrerData}
                    icon={<BarChart3 className="h-5 w-5 text-pink-400" />}
                    delay={0.9}
                    colorScheme="pink"
                />
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, delay }: { title: string; value: string | number; icon: React.ReactNode; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="border-white/10 rounded-md bg-white/5 backdrop-blur-xl h-[140px] overflow-y-auto">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{title}</p>
                        <h2 className="text-xl font-bold">{value}</h2>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="rounded-md border-white/10 overflow-hidden h-full">
                <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            {icon}
                        </div>
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[250px] w-full overflow-y-auto">
                        {data.length > 0 ? (
                            <ChartContainer config={config}>
                                <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
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
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                No data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
    Smartphone,
    Monitor,
    Copy,
    Check,
    List,
    WandSparkles,
    Database,
    Send,
    Bot,
    User,
    Building,
    Loader2,
} from "lucide-react";

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { renderMarkdown } from "../../show-stats/[id]/page";
import { Input } from "@/components/ui/input";
import InsightsAnalytics, { ProjectAnalytics } from "@/components/InsightsAnalytics";
import { Charts } from "@/app/components/charts";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";


interface EventLog {
    _id: string;
    eventName: string;
    metadata?: Record<string, string>;
    userId?: string;
    anonymousId?: string;
    device?: { os: string, browser: string, deviceType: string };
    location?: { country: string, city: string, region: string };
    ip?: string;
    timestamp?: string;
}

interface UserJourney {
    userId: string;
    deviceType: string;
    os: string;
    country: string;
    city: string;
    events: EventLog[];
    rageClicks: number;
    lastActive: string;
    sessionDurationMs: number;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    projectApiKey: string;
}

interface ChartData {
    name: string;
    value: number;
}

const PALETTES = {
    blue: ["#00e5a0", "#7c6df0", "#05d594", "#6d5ee0", "#04c387"],
    purple: ["#7c6df0", "#6d5ee0", "#5e50cf", "#4f41be", "#4033ad"],
    emerald: ["#00e5a0", "#05d594", "#04c387", "#03b17a", "#029e6d"],
};

export default function ProjectDashboardPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [search, setSearch] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string>("");
    const [project, setProject] = useState<Project | null>(null);
    const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
    const [logs, setLogs] = useState<EventLog[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMoreLogs, setHasMoreLogs] = useState<boolean>(true);
    const [logFilter, setLogFilter] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Grouped User Journeys from Backend
    const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
    const [userJourneysLoading, setUserJourneysLoading] = useState<boolean>(false);
    const [journeysPage, setJourneysPage] = useState<number>(1);
    const [hasMoreJourneys, setHasMoreJourneys] = useState<boolean>(true);
    const [loadingMoreJourneys, setLoadingMoreJourneys] = useState<boolean>(false);

    // AI Chat State
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai", text: string }[]>([
        { role: "ai", text: "Hello! I am your AI Analyst for this project. Ask me any question about your event logs, like 'Where is most of my traffic coming from?' or 'Which event is the most popular?'" }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if(debounceRef.current){
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setSearch(value);
            setPage(1);
            fetchLogs(1);
        }, 500)
    }

    const fetchUserJourneys = async (pageNum: number, isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMoreJourneys(true);
            } else {
                setUserJourneysLoading(true);
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${id}/user-journeys?page=${pageNum}&limit=5`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            const fetchedJourneys = response.data.journeys || [];
            
            if (pageNum < response?.data?.totalPages) {
                setHasMoreJourneys(true);
            } else {
                setHasMoreJourneys(false);
            }

            if (isLoadMore) {
                setUserJourneys(prev => {
                    const existingIds = new Set(prev.map(j => j.userId));
                    const filteredNew = fetchedJourneys.filter((j: UserJourney) => !existingIds.has(j.userId));
                    return [...prev, ...filteredNew];
                });
            } else {
                setUserJourneys(fetchedJourneys);
            }
        } catch (error) {
            console.error("Error fetching user journeys:", error);
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message); 
            }
        } finally {
            setUserJourneysLoading(false);
            setLoadingMoreJourneys(false);
        }
    };

    const fetchLogs = async (pageNum: number, isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLogsLoading(true);
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${id}/logs?page=${pageNum}&limit=10&filter=${selectedFilter}&search=${search}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            const fetchedEvents = response.data.events || [];
            if (pageNum < response?.data?.totalPages) {
                setHasMoreLogs(true);
            } else {
                setHasMoreLogs(false);
            }
            if (isLoadMore) {
                setLogs(prev => [...prev, ...fetchedEvents]);
            } else {
                setLogs(fetchedEvents);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message); 
            }
        } finally {
            setLogsLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        async function fetchLogs () {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${id}/filter-logs`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if(response?.data?.success){
                setLogFilter(response.data.types || []);
            }
        }
        if (status === "authenticated") {
            fetchLogs();
        }
    }, [id, session?.access_token, status]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (status !== "authenticated" || !id) return;
            try {
                setLoading(true);
                // Fetch Project Details
                const projRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/project/${id}`, {
                    headers: { Authorization: `Bearer ${session?.access_token}` },
                });
                setProject(projRes.data.project);

                // Fetch Analytics
                const analyticsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${id}/analytics`, {
                    headers: { Authorization: `Bearer ${session?.access_token}` },
                });
                setAnalytics(analyticsRes.data.analytics);

                // Fetch Grouped User Journeys
                setJourneysPage(1);
                fetchUserJourneys(1);
            } catch (error) {
                console.error("Error fetching project data:", error);
                if (axios?.isAxiosError(error)) {
                    const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                    toast.error(message); 
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [id, session?.access_token, status]);

    useEffect(() => {
        if(status === "authenticated"){
            setTimeout(() => fetchLogs(1), 0)
        }
    }, [id, session?.access_token, selectedFilter, search]);
    
    const copyApiKey = () => {
        if (!project) return;
        navigator.clipboard.writeText(project.projectApiKey);
        setCopied(true);
        toast.success("API Key copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const userMessage = chatInput.trim();
        setChatInput("");
        setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setChatLoading(true);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/event/${id}/chat`,
                { query: userMessage },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            setChatMessages(prev => [...prev, { role: "ai", text: response.data.aiResponse }]);
        } catch (error) {
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message);
            }
            console.error("AI Chat Error:", error);
            setChatMessages(prev => [...prev, { role: "ai", text: "Sorry, I encountered an error while analyzing your data. Please try again." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const processData = (data: { count: number, _id: string }[] | undefined): ChartData[] => {
        if (!data || data.length === 0) return [];
        return data.map(item => ({ name: item._id || "Unknown", value: item.count }));
    };

    const eventData = useMemo(() => processData(analytics?.topEvents), [analytics]);
    const countryData = useMemo(() => processData(analytics?.countries), [analytics]);
    const cityData = useMemo(() => processData(analytics?.cities), [analytics]);
    const osData = useMemo(() => processData(analytics?.os), [analytics]);
    const deviceData = useMemo(() => processData(analytics?.devices), [analytics]);

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
                    <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                        <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                        <Skeleton className="h-[120px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
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
                    <h2 className="text-xl font-mono font-bold mb-3 text-white">PROJECT NOT FOUND</h2>
                    <p className="text-zinc-400 font-light text-sm mb-6">
                        The requested project ID could not be loaded or is unavailable.
                    </p>
                    <Button 
                        onClick={() => router.push("/projects")}
                        className="w-full h-11 font-mono text-xs rounded-lg border-0 shadow-md font-semibold cursor-pointer hover:border-none!"
                        style={{ background: "#00e5a0", color: "#000" }}
                    >
                        Back to Projects
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

            <div className="container mx-auto px-4 py-8 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4  border border-transparent rounded-lg gap-2 cursor-pointer font-mono text-xs text-zinc-400 hover:text-[#00e5a0] transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono animate-fade-in" style={{ letterSpacing: "-1px" }}>
                                Project <span style={{ color: "#00e5a0" }}>{project.name}</span>
                            </h1>
                            <p className="text-zinc-400 text-sm max-w-xl font-light leading-relaxed">
                                {project.description || "Manage your tracking events and analyze user behavior."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-[#0d0d12] border border-[#1e1e2e] p-1.5 rounded-xl w-full flex overflow-x-auto scrollbar-none flex-no-wrap justify-start h-14 gap-2 py-7">
                        <TabsTrigger value="overview" className="px-4 py-4 cursor-pointer rounded-lg font-mono text-xs text-zinc-400 transition-all duration-200 data-[state=active]:bg-[#13131a] data-[state=active]:text-[#00e5a0] data-[state=active]:border border-transparent data-[state=active]:border-[#1e1e2e] hover:text-[#00e5a0]">Overview</TabsTrigger>
                        <TabsTrigger value="analytics" className="px-4 py-4 cursor-pointer rounded-lg font-mono text-xs text-zinc-400 transition-all duration-200 data-[state=active]:bg-[#13131a] data-[state=active]:text-[#00e5a0] data-[state=active]:border border-transparent data-[state=active]:border-[#1e1e2e] hover:text-[#00e5a0]">Analytics</TabsTrigger>
                        <TabsTrigger value="insights" className="px-4 py-4 cursor-pointer rounded-lg font-mono text-xs text-zinc-400 transition-all duration-200 data-[state=active]:bg-[#13131a] data-[state=active]:text-[#00e5a0] data-[state=active]:border border-transparent data-[state=active]:border-[#1e1e2e] hover:text-[#00e5a0]">Insights</TabsTrigger>
                        <TabsTrigger value="logs" className="px-4 py-4 cursor-pointer rounded-lg font-mono text-xs text-zinc-400 transition-all duration-200 data-[state=active]:bg-[#13131a] data-[state=active]:text-[#00e5a0] data-[state=active]:border border-transparent data-[state=active]:border-[#1e1e2e] hover:text-[#00e5a0]">Live Logs</TabsTrigger>
                        <TabsTrigger value="ai-analyst" className="px-4 py-4 cursor-pointer rounded-lg font-mono text-xs text-zinc-400 transition-all duration-200 data-[state=active]:bg-[#7c6df0]/10 data-[state=active]:text-[#7c6df0] data-[state=active]:border border-transparent data-[state=active]:border-[#7c6df0]/20 hover:text-[#7c6df0]">AI Analyst</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
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
                                        system · setup instructions
                                    </span>
                                </div>
                            </div>

                            <CardHeader className="pb-4 pt-4 px-6">
                                <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Integration Setup</CardTitle>
                                <CardDescription className="text-zinc-500 text-xs font-light">Use this API Key to send events from your application.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 px-6 pb-6">
                                <div>
                                    <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-2.5">Project API Key</p>
                                    <div className="flex items-center gap-2 max-w-md md:max-w-lg">
                                        <code className="flex-1 p-3 bg-[#13131a] rounded-lg border border-[#1e1e2e] text-[#00e5a0] font-mono text-sm break-all">
                                            {project.projectApiKey}
                                        </code>
                                        <Button onClick={copyApiKey} variant="outline" className="h-[46px] px-4 cursor-pointer bg-white/5 border border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] rounded-lg transition-all duration-300">
                                            {copied ? <Check className="h-4 w-4 text-[#00e5a0]" /> : <Copy className="h-4 w-4 text-zinc-300" />}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-2.5">SDK Example</p>
                                    <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 overflow-x-auto">
                                        <pre className="text-xs text-zinc-300 font-mono">
{`import { trackEvent } from "shorty-analytics-sdk";

await trackEvent("${project.projectApiKey}", {
  event: "user_signup",
  userId: "user_123", // optional
  notification: true, // optional: send email notification to the project owner
  metadata: {         // optional flexible data
    plan: "pro",
    source: "google_ad"
  }
});`}
                                        </pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatsCard
                                title="Total Events Tracked"
                                value={analytics?.totalEvents || 0}
                                icon={<Database className="h-4.5 w-4.5" />}
                                accentColor="#00e5a0"
                                delay={0.05}
                            />
                            <StatsCard
                                title="Top Event"
                                value={eventData[0]?.name || "N/A"}
                                icon={<BarChart3 className="h-4.5 w-4.5" />}
                                accentColor="#7c6df0"
                                delay={0.1}
                            />
                            <StatsCard
                                title="Top Country"
                                value={countryData[0]?.name || "N/A"}
                                icon={<Globe className="h-4.5 w-4.5" />}
                                accentColor="#00e5a0"
                                delay={0.15}
                            />
                        </div>
     
                        {/* Global Traffic Map */}
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
                                        system · global heat map
                                    </span>
                                </div>
                            </div>

                            <CardHeader className="pb-4 pt-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-[#00e5a0]">
                                        <Globe className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Global Traffic Map</CardTitle>
                                        <CardDescription className="text-zinc-500 text-xs font-light">Interactive heat map of project events globally</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-2">
                                <GlobalMapSection countryData={cityData} />
                            </CardContent>
                        </Card>

                        {/* Peak Traffic */}
                        <div className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
                            <Charts
                                title="Peak Traffic"
                                description="Busiest hour per day across your site"
                                data={analytics?.peakTrafficOnDateAndHour}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Events Chart */}
                            <ChartSection
                                title="Top Events"
                                description="Most frequently tracked events"
                                data={eventData}
                                icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
                                colorScheme="blue"
                            />

                            {/* Countries Chart */}
                            <ChartSection
                                title="Geographic Distribution"
                                description="Events by country"
                                data={countryData}
                                icon={<Globe className="h-5 w-5 text-emerald-500" />}
                                colorScheme="emerald"
                            />

                             {/* Cities Chart */}
                            <ChartSection
                                title="Cities"
                                description="Events by city"
                                data={cityData}
                                icon={<Building className="h-5 w-5 text-purple-500" />}
                                colorScheme="purple"
                            />

                            {/* OS Chart */}
                            <ChartSection
                                title="Operating System"
                                description="Events by Operating System"
                                data={osData}
                                icon={<Monitor className="h-5 w-5 text-purple-500" />}
                                colorScheme="purple"
                            />
                            
                            {/* Devices Chart */}
                            <ChartSection
                                title="Device Types"
                                description="Events by device"
                                data={deviceData}
                                icon={<Smartphone className="h-5 w-5 text-purple-500" />}
                                colorScheme="purple"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-6">
                        <InsightsAnalytics
                            analytics={analytics}
                            logs={logs}
                            userJourneys={userJourneys}
                            userJourneysLoading={userJourneysLoading}
                            hasMoreJourneys={hasMoreJourneys}
                            loadingMoreJourneys={loadingMoreJourneys}
                            onLoadMoreJourneys={() => {
                                const nextPage = journeysPage + 1;
                                setJourneysPage(nextPage);
                                fetchUserJourneys(nextPage, true);
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-6">
                        <Card className="rounded-xl overflow-hidden bg-[#0d0d12] border-[#1e1e2e]">
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
                                        system · live log monitor
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
                                    <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                                        STREAM_OK
                                    </span>
                                </div>
                            </div>

                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 pt-4 px-6">
                                <div>
                                    <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Live Event Logs</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs font-light">Real-time feed of events ingested by this project.</CardDescription>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-2 w-full sm:w-auto">
                                    <Input 
                                        placeholder="Search logs by userIds ..." 
                                        maxLength = {50}
                                        onChange={handleSearch}
                                        className="h-9 bg-[#13131a] border-[#1e1e2e] text-white rounded-lg px-3 focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:ring-offset-0 focus-visible:border-[#00e5a0] font-mono text-xs placeholder:text-zinc-600 w-full sm:w-60"    
                                    />
                                    <Select
                                    value={selectedFilter}
                                    onValueChange={(value) => {
                                        if(value==="all"){
                                            setSelectedFilter("");
                                        }else{
                                            setSelectedFilter(value);
                                        }
                                        setPage(1);
                                        fetchLogs(1);
                                    }}
                                    >
                                    <SelectTrigger className="w-full md:max-w-[120px] truncate sm:w-auto h-9 bg-[#13131a] border-[#1e1e2e] text-white rounded-lg px-3 focus:ring-1 focus:ring-[#00e5a0] font-mono text-xs">
                                        <SelectValue placeholder="Filter logs" />
                                    </SelectTrigger>

                                    <SelectContent className="bg-[#0d0d12] border-[#1e1e2e] text-zinc-300 font-mono text-xs w-[200px]" align="center">
                                         <SelectItem value="all" className="focus:bg-white/5 focus:text-[#00e5a0] cursor-pointer">All</SelectItem>
                                        {logFilter.length === 0 ? (
                                        <div className="p-4 text-xs text-zinc-500">
                                            No log filters available.
                                        </div>
                                        ) : (
                                        logFilter.map((eventName: string) => (
                                            <SelectItem
                                                key={eventName}
                                                value={eventName}
                                                className="focus:bg-white/5 focus:text-[#00e5a0] cursor-pointer"
                                            >
                                                {eventName}
                                            </SelectItem>
                                        ))
                                        )}
                                    </SelectContent>
                                    </Select>
                                    <Button onClick={() => { setPage(1); fetchLogs(1); }} variant="outline" size="sm" className="gap-2 cursor-pointer h-9 rounded-lg w-full sm:w-auto justify-center font-mono text-xs bg-white/5 border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] transition-all duration-300 text-zinc-300">
                                        <List className="h-3.5 w-3.5" /> Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                {logsLoading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Skeleton key={index} className="h-12 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                                        ))}
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 font-mono text-xs">
                                        <Database className="h-8 w-8 mb-4 opacity-50 text-[#00e5a0]" />
                                        <p className="text-white font-medium uppercase tracking-wider">No events recorded yet.</p>
                                        <p className="text-zinc-600 font-light mt-1">Integrate the SDK to start seeing logs here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <ScrollArea className="h-[500px] w-full rounded-lg border border-[#1e1e2e] bg-[#0d0d12]">
                                            <div className="min-w-[800px]">
                                                <Table>
                                                    <TableHeader className="bg-[#13131a] sticky top-0 z-10 border-b border-[#1e1e2e]">
                                                        <TableRow className="border-[#1e1e2e] hover:bg-transparent">
                                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Event</TableHead>
                                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">User ID</TableHead>
                                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Device / OS</TableHead>
                                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Location</TableHead>
                                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Metadata</TableHead>
                                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Time</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {logs.map((log) => (
                                                            <TableRow key={log._id} className="border-b border-[#1e1e2e] hover:bg-white/[0.01] transition">
                                                                <TableCell>
                                                                    <Badge variant="outline" className="bg-[#00e5a0]/5 text-[#00e5a0] border-[#00e5a0]/20 rounded-md font-mono text-[10px] h-5">
                                                                        {log.eventName}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-zinc-400 text-xs font-mono truncate max-w-[150px]">
                                                                    {log.userId || log.anonymousId || "-"}
                                                                </TableCell>
                                                                <TableCell className="text-xs text-zinc-400 font-mono">
                                                                    {log.device?.deviceType} / {log.device?.os}
                                                                </TableCell>
                                                                <TableCell className="text-xs text-zinc-400">
                                                                    {log.location && log.location?.city !== "Unknown" ? `${log.location.city}, ${log.location.country}` : log.location?.country}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <pre className="text-[10px] text-zinc-500 max-w-[200px] truncate bg-[#13131a] p-1.5 rounded border border-[#1e1e2e] font-mono">
                                                                        {JSON.stringify(log.metadata)}
                                                                    </pre>
                                                                </TableCell>
                                                                <TableCell className="text-xs text-zinc-400 font-mono whitespace-nowrap">
                                                                    {log.timestamp && new Date(log.timestamp).toLocaleString()}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <ScrollBar orientation="horizontal" />
                                        </ScrollArea>
                                        
                                        {hasMoreLogs && (
                                            <div className="flex justify-center mt-4">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => {
                                                        const nextPage = page + 1;
                                                        setPage(nextPage);
                                                        fetchLogs(nextPage, true);
                                                    }}
                                                    disabled={loadingMore}
                                                    className="font-mono text-xs h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] transition-all duration-300 text-zinc-300"
                                                >
                                                    {loadingMore ? "Loading..." : "Load More"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai-analyst" className="space-y-6">
                        <Card className="rounded-xl overflow-hidden bg-[#0d0d12] border-[#1e1e2e] flex flex-col h-[550px]">
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
                                        system · ai-analyst console
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#7c6df0]" />
                                    <span className="font-mono text-[9px] text-[#7c6df0] uppercase tracking-wider">
                                        ONLINE
                                    </span>
                                </div>
                            </div>

                            <CardHeader className="border-b border-[#1e1e2e] pb-4 pt-4 px-6 bg-[#13131a]/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-[#7c6df0]/10 border border-[#7c6df0]/20 text-[#7c6df0]">
                                        <WandSparkles className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">AI Project Analyst</CardTitle>
                                        <CardDescription className="text-zinc-500 text-xs font-light">Ask questions about your event logs in plain English.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${msg.role === "user" ? "bg-[#7c6df0]/15 text-[#7c6df0] border-[#7c6df0]/25" : "bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20"}`}>
                                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`max-w-[80%] rounded-xl p-4 text-xs font-mono leading-relaxed border ${msg.role === "user" ? "bg-[#7c6df0]/10 border-[#7c6df0]/20 text-zinc-200" : "bg-[#13131a] border-[#1e1e2e] text-zinc-300"}`}>
                                            <div className="prose prose-sm prose-invert max-w-none prose-p:my-0 leading-relaxed text-xs" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="max-w-[80%] rounded-xl p-4 text-sm bg-[#13131a] border border-[#1e1e2e] text-zinc-400 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-4 border-t border-[#1e1e2e] bg-[#13131a]/50">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Ask anything about your events..."
                                        maxLength={50}
                                        className="flex-1 bg-[#13131a] border border-[#1e1e2e] rounded-lg px-4 py-6 focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:ring-offset-0 focus-visible:border-[#00e5a0] text-white font-mono text-xs placeholder:text-zinc-600"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        disabled={chatLoading}
                                    />
                                   <Button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="
                                        group
                                        px-5 py-6 cursor-pointer
                                        transition-all duration-200
                                        flex items-center gap-2 rounded-lg font-mono text-xs font-semibold border-0
                                    "
                                    style={{ background: "#00e5a0", color: "#000" }}
                                    >
                                    <Send
                                        className="
                                        w-3.5 h-3.5
                                        transition-transform duration-200
                                        group-hover:translate-x-1
                                        group-hover:-translate-y-0.5
                                        "
                                    />
                                    Send
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function StatsCard({ 
    title, 
    value, 
    icon, 
    delay = 0.05,
    accentColor = "#00e5a0"
}: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    delay?: number;
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
    colorScheme = "blue"
}: {
    title: string;
    description: string;
    data: ChartData[];
    icon: React.ReactNode;
    colorScheme?: keyof typeof PALETTES;
}) {
    const palette = PALETTES[colorScheme];
    const config: ChartConfig = {
        value: {
            label: "Events",
            color: palette[0],
        },
    };

    return (
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
                                    {data.map((item, index) => (
                                        <Cell key={`cell-${index}-${item.name}`} fill={palette[index % palette.length]}/>
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
    );
}

// --- GLOBAL WORLD MAP COMPONENT ---

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CityMarker {
    name: string;
    count: number;
    coordinates: [number, number];
}

interface RsmGeographyFeature {
    rsmKey: string;
    properties: {
        name?: string;
        [key: string]: unknown;
    };
    geometry?: Record<string, unknown>;
    [key: string]: unknown;
}

function GlobalMapSection({ countryData }: { countryData: ChartData[] }) {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ coordinates: [33, 20] as [number, number], zoom: 2 });
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
    const [cityMarkers, setCityMarkers] = useState<CityMarker[]>([]);
    const [loadingMap, setLoadingMap] = useState(true);

    const maxCount = useMemo(() => {
        if (countryData.length === 0) return 0;
        return Math.max(...countryData.map(c => c.value));
    }, [countryData]);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchCityCoordinates = async () => {
            if (!countryData || countryData.length === 0) {
                setLoadingMap(false);
                return;
            }
            
            const markers: CityMarker[] = [];
            
            for (const city of countryData) {
                // Skip if Unknown
                if (!city.name || city.name === "Unknown") continue;
                try {
                    // Slight delay to respect free geocoding API rate limits
                    await new Promise(r => setTimeout(r, 200)); 
                    const res = await axios.get(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city.name)}&format=json&limit=1`);
                    if (res.data && res.data.length > 0) {
                        markers.push({
                            name: city.name,
                            count: city.value,
                            coordinates: [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)]
                        });
                    }
                } catch (err) {
                    console.error("Geocoding error for", city.name, err);
                }
            }
            setCityMarkers(markers);
            setLoadingMap(false);
        };
        
        fetchCityCoordinates();
    }, [countryData]);

    const handleZoomIn = () => {
        if (position.zoom >= 8) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleReset = () => {
        setPosition({ coordinates: [0, 20], zoom: 1 });
    };

    const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
        setPosition(newPosition);
    };

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center h-[380px] bg-zinc-950/20 rounded-md border border-border/30 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#00e5a0]" />
                <p className="text-xs text-muted-foreground animate-pulse">Loading global maps...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* Map Column */}
            <div className="lg:col-span-2 relative border border-[#1e1e2e] bg-[#0d0d12] rounded-lg p-2 h-[380px] overflow-hidden flex items-center justify-center group select-none">
                {loadingMap && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#13131a] px-3 py-1.5 rounded-full border border-[#1e1e2e] text-[10px] text-zinc-500 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin text-[#00e5a0]" />
                        Plotting cities...
                    </div>
                )}
                <ComposableMap
                    projection="geoEqualEarth"
                    projectionConfig={{
                        scale: 140
                    }}
                    width={800}
                    height={400}
                    style={{ width: "100%", height: "100%", maxHeight: "360px" }}
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMoveEnd={handleMoveEnd}
                    >
                        {/* Render base map geometries */}
                        <Geographies geography={geoUrl}>
                            {({ geographies }: { geographies: RsmGeographyFeature[] }) =>
                                geographies.map((geo: RsmGeographyFeature) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#13131a"
                                        stroke="#1e1e2e"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#1c1c27", outline: "none" },
                                            pressed: { outline: "none" }
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {/* Render City Markers */}
                        {cityMarkers.map((marker, idx) => {
                            const factor = maxCount > 0 ? marker.count / maxCount : 0.5;
                            // scale radius between 3 and 12 based on count
                            const radius = 1 + factor * 6;
                            return (
                                <Marker 
                                    key={idx} 
                                    coordinates={marker.coordinates}
                                    onMouseEnter={(e: React.MouseEvent<SVGElement>) => {
                                        setTooltipContent(`${marker.name}: ${marker.count} event(s)`);
                                    }}
                                    onMouseMove={(e: React.MouseEvent<SVGElement>) => {
                                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                                    }}
                                    onMouseLeave={() => {
                                        setTooltipContent(null);
                                        setTooltipPosition(null);
                                    }}
                                >
                                    <circle 
                                        r={radius} 
                                        fill="#00e5a0" 
                                        stroke="#059669" 
                                        strokeWidth={1.2}
                                        className="transition-all duration-300 hover:fill-[#05d594] hover:stroke-[#00e5a0] cursor-pointer shadow-[0_0_8px_rgba(0,229,160,0.6)]"
                                        style={{ opacity: 0.85 }}
                                    />
                                </Marker>
                            );
                        })}
                    </ZoomableGroup>
                </ComposableMap>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleZoomIn}
                        className="w-full h-8 p-0 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-zinc-300 hover:bg-white/5 font-mono text-sm select-none cursor-pointer"
                    >
                        +
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleZoomOut}
                        className="w-full h-8 p-0 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-zinc-300 hover:bg-white/5 font-mono text-sm select-none cursor-pointer"
                    >
                        −
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleReset}
                        className="px-2 h-8 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-zinc-400 hover:bg-white/5 text-[9px] font-mono tracking-wider select-none cursor-pointer uppercase"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="border border-[#1e1e2e] bg-[#0d0d12] rounded-lg p-4 flex flex-col h-[380px]">
                <h3 className="text-xs font-mono font-semibold mb-4 text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#00e5a0]" />
                    Top Cities Breakdown
                </h3>
                <ScrollArea className="flex-1 pr-2">
                    {countryData.length > 0 ? (
                        <div className="space-y-4">
                            {countryData.map((item, index) => {
                                const percentage = maxCount > 0 ? (item.value / maxCount) * 100 : 0;
                                return (
                                    <div key={item.name} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-xs font-mono">
                                            <span className="font-light text-zinc-300 truncate max-w-[150px]">
                                                {index + 1}. {item.name}
                                            </span>
                                            <span className="text-[#00e5a0] font-semibold">
                                                {item.value} hits
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#13131a] h-2 rounded-full overflow-hidden border border-[#1e1e2e]">
                                            <div
                                                className="bg-[#00e5a0] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,229,160,0.4)]"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 font-mono text-xs p-4 gap-2">
                            <Globe className="w-8 h-8 opacity-30 animate-pulse text-[#00e5a0]" />
                            <span>No geographic data available yet.</span>
                            <span className="text-[10px] opacity-60">Events will show up here as they are logged.</span>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Glowing Mouse Hover Tooltip */}
            {tooltipContent && tooltipPosition && (
                <div
                    className="fixed z-50 pointer-events-none bg-[#0d0d12] border border-[#1e1e2e] backdrop-blur-md px-3 py-2 rounded-lg shadow-2xl text-xs font-mono text-zinc-300 flex items-center gap-2"
                    style={{
                        left: tooltipPosition.x + 15,
                        top: tooltipPosition.y + 15,
                    }}
                >
                    <span className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse shadow-[0_0_8px_rgba(0,229,160,0.8)]" />
                    {tooltipContent}
                </div>
            )}
        </div>
    );
}



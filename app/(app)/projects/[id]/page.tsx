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
    blue: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
    purple: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
    emerald: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
};

export default function ProjectDashboardPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [project, setProject] = useState<Project | null>(null);
    const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
    const [logs, setLogs] = useState<EventLog[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMoreLogs, setHasMoreLogs] = useState<boolean>(true);
   
    
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [copied, setCopied] = useState(false);

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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${id}/logs?page=${pageNum}&limit=10`, {
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
        } finally {
            setLogsLoading(false);
            setLoadingMore(false);
        }
    };

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

                // Fetch Initial Logs
                fetchLogs(1);

                // Fetch Grouped User Journeys
                setJourneysPage(1);
                fetchUserJourneys(1);
            } catch (error) {
                console.error("Error fetching project data:", error);
                toast.error("Failed to load project dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [id, session?.access_token, status]);

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

    const formatHourRange = (hour: number) => {
        const format = (h: number) => {
            const period = h >= 12 ? "PM" : "AM";
            const hour12 = h % 12 || 12;
            return `${hour12} ${period}`;
        };
        return `${format(hour)} - ${format((hour + 1) % 24)}`;
    };

    const eventData = useMemo(() => processData(analytics?.topEvents), [analytics]);
    const countryData = useMemo(() => processData(analytics?.countries), [analytics]);
    const cityData = useMemo(() => processData(analytics?.cities), [analytics]);
    const osData = useMemo(() => processData(analytics?.os), [analytics]);
    const deviceData = useMemo(() => processData(analytics?.devices), [analytics]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-[200px] rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-md" />
                    <Skeleton className="h-32 rounded-md" />
                    <Skeleton className="h-32 rounded-md" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
                <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-20 max-w-6xl">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 hover:bg-muted rounded-md gap-2 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {project.name}
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-xl">
                            {project.description || "Manage your tracking events and analyze user behavior."}
                        </p>
                    </div>
                </div>
            </motion.div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-sm w-full overflow-x-auto scrollbar-none flex-nowrap justify-start h-12!">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-card cursor-pointer rounded-sm flex-shrink-0">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-card cursor-pointer rounded-sm flex-shrink-0">Analytics</TabsTrigger>
                    <TabsTrigger value="insights" className="data-[state=active]:bg-card cursor-pointer rounded-sm flex-shrink-0">Insights</TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-card cursor-pointer rounded-sm flex-shrink-0">Live Logs</TabsTrigger>
                    <TabsTrigger value="ai-analyst" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 cursor-pointer rounded-sm flex-shrink-0">
                        AI Analyst
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Card className="rounded-md border-border/50 bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Integration Setup</CardTitle>
                            <CardDescription>Use this API Key to send events from your application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-sm font-medium mb-2">Project API Key</p>
                                <div className="flex items-center gap-2 max-w-md md:max-w-lg">
                                    <code className="flex-1 p-3 bg-muted rounded-md border border-border/50 text-indigo-400 font-mono text-sm break-all">
                                        {project.projectApiKey}
                                    </code>
                                    <Button onClick={copyApiKey} variant="outline" className="h-[46px] px-4 cursor-pointer">
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-2">SDK Example</p>
                                <div className="bg-[#0d1117] border border-border/50 rounded-md p-4 overflow-x-auto">
                                    <pre className="text-sm text-zinc-300 font-mono">
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
                            icon={<Database className="h-5 w-5 text-indigo-400" />}
                        />
                        <StatsCard
                            title="Top Event"
                            value={eventData[0]?.name || "N/A"}
                            icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
                        />
                        <StatsCard
                            title="Top Country"
                            value={countryData[0]?.name || "N/A"}
                            icon={<Globe className="h-5 w-5 text-emerald-400" />}
                        />
                    </div>
 
                    {/* Global Traffic Map */}
                    <Card className="rounded-md border-border/50 overflow-hidden bg-card/50 backdrop-blur-xl">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-muted border border-border/50">
                                    <Globe className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle>Global Traffic Map</CardTitle>
                                    <CardDescription>Interactive heat map of project events globally</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <GlobalMapSection countryData={cityData} />
                        </CardContent>
                    </Card>

                     <Charts
                            title="Peak Traffic"
                            description="Busiest hour per day across your site"
                            data={analytics?.peakTrafficOnDateAndHour}
                           
                        />

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
                    <Card className="rounded-md overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Live Event Logs</CardTitle>
                                <CardDescription>Real-time feed of events ingested by this project.</CardDescription>
                            </div>
                            <Button onClick={() => { setPage(1); fetchLogs(1); }} variant="outline" size="sm" className="gap-2 cursor-pointer rounded-sm w-full sm:w-auto justify-center">
                                <List className="h-4 w-4" /> Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {logsLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Skeleton key={index} className="h-12 rounded-md bg-muted" />
                                    ))}
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Database className="h-8 w-8 mb-4 opacity-50" />
                                    <p>No events recorded yet.</p>
                                    <p className="text-sm">Integrate the SDK to start seeing logs here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <ScrollArea className="h-[500px] w-full rounded-md border border-border/50">
                                        <div className="min-w-[800px]">
                                            <Table>
                                                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                                                    <TableRow>
                                                        <TableHead>Event</TableHead>
                                                        <TableHead>User ID</TableHead>
                                                        <TableHead>Device / OS</TableHead>
                                                        <TableHead>Location</TableHead>
                                                        <TableHead>Metadata</TableHead>
                                                        <TableHead>Time</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {logs.map((log) => (
                                                        <TableRow key={log._id} className="border-b border-border/50 hover:bg-muted/20">
                                                            <TableCell>
                                                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 rounded-sm">
                                                                    {log.eventName}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm font-mono">
                                                                {log.userId || log.anonymousId || "-"}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {log.device?.deviceType} / {log.device?.os}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {log.location && log.location?.city !== "Unknown" ? `${log.location.city}, ${log.location.country}` : log.location?.country}
                                                            </TableCell>
                                                            <TableCell>
                                                                <pre className="text-[10px] text-zinc-400 max-w-[200px] truncate bg-muted/50 p-1.5 rounded border border-border/50">
                                                                    {JSON.stringify(log.metadata)}
                                                                </pre>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
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
                    <Card className="rounded-md overflow-hidden bg-card/50 backdrop-blur-xl border-border/50 flex flex-col h-[400px]">
                        <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                                    <WandSparkles className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <CardTitle>AI Project Analyst</CardTitle>
                                    <CardDescription>Ask questions about your event logs in plain English.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 ">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-xl p-4 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border/50 text-foreground"}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 leading-relaxed text-xs" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="max-w-[80%] rounded-xl p-4 text-sm bg-muted/50 border border-border/50 text-foreground flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <div className="p-4 border-t border-border/50 bg-muted/20">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                                className="flex gap-2"
                            >
                                <Input
                                    type="text"
                                    placeholder="Ask anything about your events..."
                                    maxLength={50}
                                    className="flex-1 bg-background border border-border/50 rounded-md px-4 py-6 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={chatLoading}
                                />
                               <Button
                                type="submit"
                                disabled={chatLoading || !chatInput.trim()}
                                className="
                                    group
                                    bg-black text-white dark:bg-white dark:text-black
                                    px-4 py-6 cursor-pointer
                                    transition-all duration-200
                                    flex items-center gap-2
                                "
                                >
                                <Send
                                    className="
                                    w-4 h-4
                                    transition-transform duration-200
                                    group-hover:translate-x-1.5
                                    group-hover:-translate-y-1
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
    );
}

function StatsCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
    return (    
        <Card className="border-border/50 rounded-md bg-card/50 backdrop-blur-xl h-[120px]">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
                    <h2 className="text-lg font-bold">{value}</h2>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border/50">
                    {icon}
                </div>
            </CardContent>
        </Card>
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
        <Card className="rounded-md border-border/50 overflow-hidden bg-card/50 backdrop-blur-xl h-full">
            <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted border border-border/50">
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
                                    width={100}
                                
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
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
                        <div className="flex items-center justify-center h-full text-muted-foreground">
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
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs text-muted-foreground animate-pulse">Loading global maps...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* Map Column */}
            <div className="lg:col-span-2 relative border border-border/50 rounded-md p-2 h-[380px] overflow-hidden flex items-center justify-center group select-none">
                {loadingMap && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50 text-[10px] text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
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
                                        fill="#18181b"
                                        stroke="#27272a"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#27272a", outline: "none" },
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
                                        fill="#10b981" 
                                        stroke="#065f46" 
                                        strokeWidth={1.2}
                                        className="transition-all duration-300 hover:fill-[#34d399] hover:stroke-[#10b981] cursor-pointer"
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
                        className="w-full h-8 p-0 rounded bg-background/80 border border-border/50 hover:bg-muted font-bold text-lg select-none cursor-pointer"
                    >
                        +
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleZoomOut}
                        className="w-full    h-8 p-0 rounded bg-background/80 border border-border/50 hover:bg-muted font-bold text-lg select-none cursor-pointer"
                    >
                        −
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleReset}
                        className="px-2 h-8 rounded bg-background/80 border border-border/50 hover:bg-muted text-[10px] font-semibold uppercase tracking-wider select-none cursor-pointer"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="border border-border/50 rounded-md  p-4 flex flex-col h-[380px]">
                <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    Top Cities Breakdown
                </h3>
                <ScrollArea className="flex-1 pr-2">
                    {countryData.length > 0 ? (
                        <div className="space-y-4">
                            {countryData.map((item, index) => {
                                const percentage = maxCount > 0 ? (item.value / maxCount) * 100 : 0;
                                return (
                                    <div key={item.name} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-foreground truncate max-w-[150px]">
                                                {index + 1}. {item.name}
                                            </span>
                                            <span className="text-muted-foreground font-mono font-semibold">
                                                {item.value} hits
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border/30">
                                            <div
                                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs p-4 gap-2">
                            <Globe className="w-8 h-8 opacity-30 animate-pulse text-emerald-500" />
                            <span>No geographic data available yet.</span>
                            <span className="text-[10px] opacity-60">Events will show up here as they are logged.</span>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Glowing Mouse Hover Tooltip */}
            {tooltipContent && tooltipPosition && (
                <div
                    className="fixed z-50 pointer-events-none bg-background/95 border border-border/80 backdrop-blur-md px-3 py-2 rounded-md shadow-2xl text-xs font-semibold text-foreground flex items-center gap-2"
                    style={{
                        left: tooltipPosition.x + 15,
                        top: tooltipPosition.y + 15,
                    }}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {tooltipContent}
                </div>
            )}
        </div>
    );
}

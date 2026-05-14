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
    MousePointerClick,
    Smartphone,
    Monitor,
    Link2,
} from "lucide-react";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

interface UrlStats {
    _id: string;
    shortUrl: string;
    longUrl: string;
    count: number;
    location: string[];
    devices: string[];
    browsers: string[];
    os: string[];
    referrer: string[];
    createdAt: string;
}

interface ChartData {
    name: string;
    value: number;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];

export default function ShowStatsPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<UrlStats | null>(null);
    const [loading, setLoading] = useState(true);

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
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [id, session, status]);

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
    const locationData = useMemo(() => processData(stats?.location), [stats]);
    const referrerData = useMemo(() => processData(stats?.referrer), [stats]);

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
                    className="mb-4 hover:bg-white/5 rounded-xl gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to URLs
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">URL Statistics</h1>
                        <p className="text-zinc-400 flex items-center gap-2 text-sm">
                            <Link2 className="h-4 w-4 text-blue-400" />
                            {stats.shortUrl}
                        </p>
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
                    value={stats.count}
                    icon={<MousePointerClick className="h-5 w-5 text-blue-400" />}
                    delay={0.1}
                />
                <StatsCard
                    title="Top Location"
                    value={locationData[0]?.name || "N/A"}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Devices Chart */}
                <ChartSection
                    title="Devices"
                    description="User distribution by device type"
                    data={deviceData}
                    icon={<Smartphone className="h-5 w-5 text-blue-400" />}
                    delay={0.4}
                />

                {/* Browsers Chart */}
                <ChartSection
                    title="Browsers"
                    description="Most used browsers for this link"
                    data={browserData}
                    icon={<Globe className="h-5 w-5 text-orange-400" />}
                    delay={0.5}
                />

                {/* OS Chart */}
                <ChartSection
                    title="Operating Systems"
                    description="User OS distribution"
                    data={osData}
                    icon={<Monitor className="h-5 w-5 text-purple-400" />}
                    delay={0.6}
                />

                {/* Locations Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="rounded-3xl border-white/10 overflow-hidden h-full">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <Globe className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle>Top Locations</CardTitle>
                                    <CardDescription>Where your clicks are coming from</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {locationData.length > 0 ? (
                                    locationData.slice(0, 6).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-zinc-300">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-emerald-500 h-full rounded-full" 
                                                        style={{ width: `${(item.value / stats.count) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono font-bold text-zinc-500 w-8 text-right">
                                                    {item.value}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-zinc-500 py-10">No location data yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
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
            <Card className="border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl h-[200px] overflow-y-auto">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{title}</p>
                        <h2 className="text-3xl font-bold">{value}</h2>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        {icon}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ChartSection({ title, description, data, icon, delay }: { title: string; description: string; data: ChartData[]; icon: React.ReactNode; delay: number }) {
    const config: ChartConfig = {
        value: {
            label: "Clicks",
            color: "#3b82f6",
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="rounded-3xl border-white/10 overflow-hidden h-full">
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
                    <div className="h-[250px] w-full">
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
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

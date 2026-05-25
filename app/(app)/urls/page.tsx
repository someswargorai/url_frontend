"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Globe,
    MousePointerClick,
    Link2,
    Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UrlAnalytics {
    _id: string;
    shortUrl: string;
    longUrl: string;
    countGraph: {
        count: number;
        timestamp: string;
    }[];
    campaignId:{
        _id:string;
        name:string;
    }
    createdAt: string;
    location: string[];
    device: string[];
    userIps: string[];
}

export default function AnalyticsPage() {

    const [urls, setUrls] = useState<UrlAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [page,setPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/url/analytics?page=${page}&limit=${5}`, {
                    headers: {
                        "Authorization": `Bearer ${session?.access_token}`
                    }
                });

                const newUrls = response.data?.urls || [];

                setUrls(prev => 
                    page === 1 
                    ? newUrls        
                    : [...prev, ...newUrls]
                );
                setTotalPages(response.data?.pagination?.totalPages || 1);
            } catch (error) {
                console.error(error);
                if (axios?.isAxiosError(error)) {
                    const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                    toast.error(message); 
                }
            } finally {
                setLoading(false);
            }
        };
        if (status === "authenticated") {
            fetchAnalytics();
        }
    }, [session?.access_token, status, page]);

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
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
                            URL <span style={{ color: "#00e5a0" }}>Analytics Directory</span>
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-xl font-light leading-relaxed">
                            Monitor all your shortened URLs, live click streams, and detailed conversion analytics in real-time.
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total URLs"
                        value={urls.length}
                        icon={<Link2 className="h-4.5 w-4.5" />}
                        loading={loading}
                        accentColor="#00e5a0"
                    />

                    <StatsCard
                        title="Total Clicks"
                        value={urls.reduce((acc, curr) => acc + (curr.countGraph?.length || 0), 0)}
                        icon={<MousePointerClick className="h-4.5 w-4.5" />}
                        loading={loading}
                        accentColor="#7c6df0"
                    />

                    <StatsCard
                        title="Analytics Enabled"
                        value={urls.filter((url) => url.location?.length || url.device?.length).length}
                        icon={<Eye className="h-4.5 w-4.5" />}
                        loading={loading}
                        accentColor="#00e5a0"
                    />
                </div>

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
                                system · urls analytics list
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
                            <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                                CONNECTED
                            </span>
                        </div>
                    </div>

                    <CardHeader className="pb-4 pt-4 px-6">
                        <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Your Shortened URLs</CardTitle>
                        <CardDescription className="text-zinc-500 text-xs font-light">View all the URLs you have shortened and inspect detailed analytics.</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6">
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-16 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : urls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center font-mono text-xs">
                                <Globe className="h-10 w-10 mb-4 opacity-50 text-[#00e5a0] animate-pulse" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">No URLs Found</h2>
                                <p className="text-zinc-500 font-light max-w-md">
                                    You have not shortened any URLs yet. Start shortening your links to track conversion analytics!
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-[#13131a] border-b border-[#1e1e2e]">
                                        <TableRow className="border-[#1e1e2e] hover:bg-transparent">
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Short URL</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Campaign</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Destination</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Clicks</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Created</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase text-center">
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {urls.map((url, index) => (
                                            <TableRow
                                                key={url._id}
                                                className="border-b border-[#1e1e2e] hover:bg-white/[0.01] transition"
                                            >
                                                <TableCell className="font-mono text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#00e5a0] to-[#7c6df0] font-semibold max-w-[200px] truncate">
                                                    {url.shortUrl}
                                                </TableCell>
                                                <TableCell>
                                                    {url?.campaignId ? (
                                                        <Link href={`/campaigns/${url.campaignId._id}`}>
                                                            <Badge variant="outline" className="bg-[#7c6df0]/5 text-[#7c6df0] border-[#7c6df0]/20 rounded-md font-mono text-[10px] h-5 cursor-pointer hover:bg-[#7c6df0]/10 transition-colors">
                                                                {url.campaignId.name}
                                                            </Badge>
                                                        </Link>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-500/5 text-yellow-500 border-yellow-500/10 rounded-md font-mono text-[10px] h-5">
                                                            No Campaign
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell className="max-w-[300px] truncate text-zinc-400 font-light hover:text-[#00e5a0] transition-colors">
                                                    <Link href={url.longUrl} target="_blank" className="font-mono text-xs">
                                                        {url.longUrl}
                                                    </Link>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge variant="outline" className="bg-[#00e5a0]/5 text-[#00e5a0] border-[#00e5a0]/20 rounded-md font-mono text-[10px] h-5">
                                                        {url.countGraph?.length || 0} Clicks
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-zinc-400 text-xs font-mono">
                                                    {new Date(url.createdAt).toLocaleDateString()}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button
                                                        onClick={() => router.push(`/show-stats/${url?._id}`)}
                                                        className="h-8 px-3.5 bg-white/5 border border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] cursor-pointer rounded-lg font-mono text-[10px] text-zinc-300 transition-all duration-200"
                                                        size="sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                        View Analytics
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {page < totalPages && (
                            <div className="flex justify-center mt-4">
                                <Button 
                                    className="font-mono text-xs h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] transition-all duration-300 text-zinc-300 cursor-pointer"
                                    onClick={() => setPage(prev => prev + 1)}
                                >
                                    Load More
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon,
    loading,
    accentColor = "#00e5a0",
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    loading?: boolean;
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
                        {loading ? (
                            <Skeleton className="h-8 w-16 mt-2 bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                        ) : (
                            <h2 className="font-mono font-semibold text-3xl tracking-tight" style={{ color: accentColor }}>
                                {value}
                            </h2>
                        )}
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

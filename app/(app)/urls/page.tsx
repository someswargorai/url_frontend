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

interface UrlAnalytics {
    _id: string;
    shortUrl: string;
    longUrl: string;
    count: number;
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

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/url/analytics`, {
                    headers: {
                        "Authorization": `Bearer ${session?.access_token}`
                    }
                });

                setUrls(response.data?.url || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (status === "authenticated") {
            fetchAnalytics();
        }
    }, [session, status]);

    return (
        <div className="min-h-screen ">

            <div className="relative z-10 container mx-auto px-4 py-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                URL Analytics Dashboard
                            </h1>
                            <p className="text-zinc-400 mt-1 text-xs md:text-xs">
                                Monitor all your shortened URLs and detailed click analytics.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatsCard
                        title="Total URLs"
                        value={urls.length}
                        icon={<Link2 className="h-5 w-5 text-blue-400" />}
                    />

                    <StatsCard
                        title="Total Clicks"
                        value={urls.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                        icon={<MousePointerClick className="h-5 w-5 text-purple-400" />}
                    />

                    <StatsCard
                        title="Analytics Enabled"
                        value={urls.filter((url) => url.location?.length || url.device?.length).length}
                        icon={<Eye className="h-5 w-5 text-emerald-400" />}
                    />
                </div>

                <Card className="rounded-md overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl">Your Shortened URLs</CardTitle>
                        <CardDescription>
                            View all the URLs you have shortened and inspect analytics.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-16 rounded-2xl bg-white/10"
                                    />
                                ))}
                            </div>
                        ) : urls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Globe className="h-16 w-16 text-zinc-600 mb-4" />
                                <h2 className="text-2xl font-semibold mb-2">
                                    No URLs Found
                                </h2>
                                <p className="text-zinc-400 max-w-md">
                                    You have not shortened any URLs yet.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <Table>
                                    <TableHeader className="bg-white">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead>Short URL</TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Clicks</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-center">
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {urls.map((url, index) => (
                                            <motion.tr
                                                key={url._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-white/10  transition"
                                            >
                                                <TableCell className="font-medium text-blue-400 max-w-[200px] truncate">
                                                    {url.shortUrl}
                                                </TableCell>

                                                <TableCell className="max-w-[300px] truncate text-zinc-500 hover:underline">
                                                    <Link href={url.longUrl} target="_blank">
                                                        {url.longUrl}
                                                    </Link>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge className="">
                                                        {url.count || 0} Clicks
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-zinc-400">
                                                    {new Date(url.createdAt).toLocaleDateString()}
                                                </TableCell>

                                                <TableCell className="text-center pl-4">
                                                    <Button
                                                        onClick={() => router.push(`/show-stats/${url?._id}`)}
                                                        className="rounded-xl cursor-pointer"
                                                    >
                                                        View Analytics
                                                    </Button>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </TableBody>
                                </Table>
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
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-zinc-400 text-sm">{title}</p>
                        <h2 className="text-4xl font-bold mt-2">{value}</h2>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        {icon}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

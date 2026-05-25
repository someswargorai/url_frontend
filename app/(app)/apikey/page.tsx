"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Copy, Trash2, Plus, Eye, EyeOff, Key, Shield, Clock, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ApiKey {
    _id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed: string | null;
    status: "active" | "inactive";
    plan: string;
}

export default function ApikeyPage() {
    const { data: session, status } = useSession();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
    const [newKeyName, setNewKeyName] = useState("");

    // UI states
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [justCreated, setJustCreated] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/apikey`, {
                    headers: {
                        "Authorization": `Bearer ${session?.access_token}`
                    }
                });
                setApiKeys(response.data?.apiKeys || []);
            } catch (error) {
                console.error("Error fetching API keys:", error);
                if (axios?.isAxiosError(error)) {
                    const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                    toast.error(message);
                }
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchApiKeys();
        }
    }, [session?.access_token, status]);

    const toggleVisibility = (keyString: string) => {
        setVisibleKeys((prev) => ({ ...prev, [keyString]: !prev[keyString] }));
    };

    const maskKey = (key: string) => {
        if (!key) return "";
        const prefix = key.slice(0, 10);
        const suffix = key.slice(-4);
        return `${prefix}${"•".repeat(20)}${suffix}`;
    };

    const copyKey = (key: ApiKey) => {
        navigator.clipboard.writeText(key.key);
        setCopiedId(key.key);
        toast.success("API key copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) return;
        try {
            setActionLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/apikey`,
                { name: newKeyName.trim() },
                {
                    headers: {
                        "Authorization": `Bearer ${session?.access_token}`
                    }
                }
            );

            const newKey = response.data.apiKey;
            setApiKeys((prev) => [newKey, ...prev]);
            setJustCreated(newKey.key);
            setVisibleKeys((prev) => ({ ...prev, [newKey.key]: true }));
            setCreateDialogOpen(false);
            setNewKeyName("");
            toast.success("New API key generated successfully.");
            setTimeout(() => setJustCreated(null), 5000);
        } catch (error) {
            console.error("Error creating key:", error);
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteKey = async () => {
        if (!keyToDelete) return;
        try {
            setActionLoading(true);
            await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/apikey/${keyToDelete}`, {
                headers: {
                    "Authorization": `Bearer ${session?.access_token}`
                }
            });

            setApiKeys((prev) => prev.filter((k) => k.key !== keyToDelete));
            setDeleteDialogOpen(false);
            setKeyToDelete(null);
            toast.success("API key deleted successfully.");
        } catch (error) {
            console.error("Error deleting key:", error);
            if (axios?.isAxiosError(error)) {
                const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
                toast.error(message);
            }
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background grid */}
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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
                            API <span style={{ color: "#00e5a0" }}>Key Management</span>
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-xl font-light leading-relaxed">
                            Manage authentication keys for programmatic API access. Keep them secret, keep them safe.
                        </p>
                    </div>

                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="h-11 px-5 rounded-lg cursor-pointer font-mono text-xs font-semibold border-0 transition-all duration-300 gap-2"
                        style={{ background: "#00e5a0", color: "#000" }}
                    >
                        <Plus className="h-4 w-4" />
                        Generate Key
                    </Button>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Active Keys"
                        value={apiKeys.filter(k => k.status === "active").length}
                        icon={<Shield className="h-4.5 w-4.5" />}
                        loading={loading}
                        accentColor="#00e5a0"
                    />
                    <StatsCard
                        title="Total Requests"
                        value="--"
                        icon={<Zap className="h-4.5 w-4.5" />}
                        loading={loading}
                        accentColor="#7c6df0"
                    />
                    <StatsCard
                        title="Last Activity"
                        value={apiKeys.some(k => k.lastUsed) ? "Recent" : "Never"}
                        icon={<Clock className="h-4.5 w-4.5" />}
                        loading={loading}
                        accentColor="#00e5a0"
                    />
                </div>

                {/* Main card — terminal style */}
                <Card className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
                    {/* Terminal topbar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 shrink-0 mr-1">
                                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                                    <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                                ))}
                            </div>
                            <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                                system · api keys list
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
                        <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Your API Keys</CardTitle>
                        <CardDescription className="text-zinc-500 text-xs font-light">
                            Use these keys to authenticate API requests from your applications.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6">
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                                ))}
                            </div>
                        ) : apiKeys.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center font-mono text-xs">
                                <Key className="h-10 w-10 mb-4 opacity-50 text-[#00e5a0] animate-pulse" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">No API Keys Found</h2>
                                <p className="text-zinc-500 font-light max-w-md mb-6 leading-relaxed">
                                    You don&apos;t have any API keys yet. Generate one to authenticate your applications.
                                </p>
                                <Button
                                    onClick={() => setCreateDialogOpen(true)}
                                    className="h-9 px-4 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-semibold text-xs border-0 transition-all duration-300"
                                >
                                    Generate First Key
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-[#13131a] border-b border-[#1e1e2e]">
                                        <TableRow className="border-[#1e1e2e] hover:bg-transparent">
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Name</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase min-w-[300px]">Key</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Plan</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Created</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Last Used</TableHead>
                                            <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {apiKeys.map((apiKey, index) => (
                                            <motion.tr
                                                key={apiKey.key}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-[#1e1e2e] hover:bg-white/[0.01] transition"
                                            >
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono text-xs text-white font-semibold">{apiKey.name}</span>
                                                        {justCreated === apiKey.key && (
                                                            <Badge variant="outline" className="w-fit h-4 text-[9px] bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30 px-1.5 font-mono">
                                                                NEW
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`font-mono text-[10px] px-3 py-1.5 rounded-md border truncate flex-1 ${justCreated === apiKey.key ? "border-[#00e5a0]/40 text-[#00e5a0] bg-[#00e5a0]/5" : "border-[#1e1e2e] text-zinc-400 bg-[#13131a]"} ${visibleKeys[apiKey.key] ? "text-zinc-200" : ""}`}>
                                                            {visibleKeys[apiKey.key] ? apiKey.key : maskKey(apiKey.key)}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 shrink-0 cursor-pointer"
                                                            onClick={() => toggleVisibility(apiKey.key)}
                                                        >
                                                            {visibleKeys[apiKey.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-8 w-8 shrink-0 cursor-pointer ${copiedId === apiKey.key ? "text-[#00e5a0]" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                                                            onClick={() => copyKey(apiKey)}
                                                        >
                                                            {copiedId === apiKey.key ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-[#7c6df0]/10 text-[#7c6df0] border-[#7c6df0]/20 rounded-md font-mono text-[9px] h-5"
                                                    >
                                                        {apiKey.plan}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-zinc-400 text-xs font-mono">
                                                    {format(new Date(apiKey.createdAt), "MMM d, yyyy")}
                                                </TableCell>

                                                <TableCell className="text-zinc-400 text-xs font-mono">
                                                    {apiKey.lastUsed ? format(new Date(apiKey.lastUsed), "MMM d, yyyy") : "Never"}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 cursor-pointer rounded-lg transition-all duration-200"
                                                        onClick={() => {
                                                            setKeyToDelete(apiKey.key);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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

                {/* Security notice */}
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="font-mono text-[11px] text-amber-500/80 leading-relaxed">
                        <span className="font-semibold text-amber-400">Security reminder:</span> Never share API keys in public repositories or client-side code. Treat them like passwords.
                    </p>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#0d0d12] border-[#1e1e2e] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="font-mono text-sm uppercase tracking-wider text-white">Generate New API Key</DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs font-light">
                            Create a new authentication key for your application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="key-name" className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                                Key Name
                            </Label>
                            <Input
                                id="key-name"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g. Production Web App"
                                className="bg-[#13131a] border-[#1e1e2e] text-white focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:border-[#00e5a0] font-mono text-xs h-10 px-3.5 rounded-lg"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && newKeyName.trim() && !actionLoading) {
                                        handleCreateKey();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="font-mono text-[10px] text-amber-500/80 leading-relaxed">
                                The new key will only be fully visible immediately after creation. Store it somewhere safe.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                            disabled={actionLoading}
                            className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateKey}
                            disabled={!newKeyName.trim() || actionLoading}
                            className="h-9 px-4 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono text-xs font-semibold border-0 transition-all duration-300"
                        >
                            {actionLoading ? "Generating..." : "Generate Key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0d0d12] border-[#1e1e2e] rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-mono text-sm uppercase tracking-wider text-white">Revoke API Key</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 text-xs font-light leading-relaxed">
                            This will permanently delete the API key. Any applications currently using this key will lose access immediately. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={actionLoading}
                            className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteKey();
                            }}
                            disabled={actionLoading}
                            className="h-9 px-4 rounded-lg cursor-pointer bg-red-500/80 hover:bg-red-500 text-white font-mono text-xs font-semibold border-0 transition-all duration-300"
                        >
                            {actionLoading ? "Revoking..." : "Revoke Key"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="group relative">
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

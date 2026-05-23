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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="min-h-screen">
            <div className="relative z-10 container mx-auto px-4 py-5 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Manage authentication keys for API access. Keep them secure.
                            </p>
                        </div>
                    </div>
                    <Button  onClick={() => setCreateDialogOpen(true)} className="rounded-md py-5 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Create Key
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Active Keys"
                        value={apiKeys.filter(k => k.status === 'active').length}
                        icon={<Shield className="h-5 w-5 text-indigo-400" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Requests"
                        value={"--"}
                        icon={<Zap className="h-5 w-5 text-emerald-400" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Last Activity"
                        value={apiKeys.some(k => k.lastUsed) ? "Recent" : "Never"}
                        icon={<Clock className="h-5 w-5 text-amber-400" />}
                        loading={loading}
                    />
                </div>

                <Card className="rounded-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="text-lg">Your API Keys</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted/50" />
                                ))}
                            </div>
                        ) : apiKeys.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Key className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                                <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                                    You don&apos;t have any API keys yet. Create one to authenticate your applications.
                                </p>
                                <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                                    Generate First Key
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[200px]">Name</TableHead>
                                            <TableHead className="min-w-[300px]">Key</TableHead>
                                            <TableHead className="w-[150px]">Created</TableHead>
                                            <TableHead className="w-[150px]">Last Used</TableHead>
                                            <TableHead className="text-right w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {apiKeys.map((apiKey, index) => (
                                            <motion.tr
                                                key={apiKey.key}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={justCreated === apiKey.key ? "bg-primary/5 hover:bg-primary/10" : ""}
                                            >
                                                <TableCell>
                                                    <div className="flex gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{apiKey.name}</span>
                                                            {justCreated === apiKey.key && (
                                                                <Badge variant="outline" className="h-5 text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-1.5">
                                                                    New
                                                                </Badge>
                                                            )}
                                                        </div>


                                                            <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-muted/50 text-muted-foreground">{apiKey.plan}</Badge>

                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`font-mono text-xs px-3 py-1.5 rounded-md bg-muted/50 border truncate flex-1 ${justCreated === apiKey.key ? 'border-primary/40 text-primary' : 'border-border/50 text-muted-foreground'} ${visibleKeys[apiKey.key] ? 'text-foreground' : ''}`}>
                                                            {visibleKeys[apiKey.key] ? apiKey.key : maskKey(apiKey.key)}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                                                            onClick={() => toggleVisibility(apiKey.key)}
                                                        >
                                                            {visibleKeys[apiKey.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-8 w-8 shrink-0 ${copiedId === apiKey.key ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}
                                                            onClick={() => copyKey(apiKey)}
                                                        >
                                                            {copiedId === apiKey.key ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {format(new Date(apiKey.createdAt), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {apiKey.lastUsed ? format(new Date(apiKey.lastUsed), "MMM d, yyyy") : "Never"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            setKeyToDelete(apiKey.key);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

                <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-500/90 leading-relaxed">
                        <strong className="font-semibold">Security reminder:</strong> Never share API keys in public repositories or client-side code. Treat them like passwords.
                    </p>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Generate New API Key</DialogTitle>
                        <DialogDescription>
                            Create a new authentication key for your application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Key Name
                            </label>
                            <Input
                                id="name"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g. Production Web App"
                                className="col-span-3"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && newKeyName.trim() && !actionLoading) {
                                        handleCreateKey();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 mt-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-500/90 leading-relaxed">
                                The new key will only be fully visible immediately after creation.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateKey} disabled={!newKeyName.trim() || actionLoading}>
                            {actionLoading ? "Generating..." : "Generate Key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the API key. Any applications currently using this key will lose access immediately. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteKey();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={actionLoading}
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
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    loading?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 rounded-md overflow-hidden shadow-sm h-[140px]">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">{title}</p>
                        {loading ? (
                            <Skeleton className="h-8 w-16 mt-2 bg-muted" />
                        ) : (
                            <h2 className="text-xl font-bold mt-1 text-foreground">{value}</h2>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-muted border border-border/50 shadow-inner">
                        {icon}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

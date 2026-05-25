"use client";

import { useCallback, useEffect, useState } from "react";
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
  Database,
  Plus,
  LayoutDashboard,
  Calendar,
  Key,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Project {
  _id: string;
  name: string;
  description: string;
  projectApiKey: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/project`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          },
        );
        setProjects(response.data?.projects || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProjects();
    }
  }, [session?.access_token, status]);

  const handleCreateProject = async () => {
    if (!createName.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setCreateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/project`,
        {
          name: createName,
          description: createDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      toast.success("Project created successfully!");
      setProjects([response.data.project, ...projects]);
      setIsCreateOpen(false);
      setCreateName("");
      setCreateDesc("");
    } catch (error) {
      if (axios?.isAxiosError(error)) {
        const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
        toast.error(message); 
      }
    } finally {
      setCreateLoading(false);
    }
  };

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
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
              Projects <span style={{ color: "#00e5a0" }}>Event Ingestion</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl font-light leading-relaxed">
              Create projects to get API keys and track custom behavioral events within your applications in real-time.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-5 rounded-lg cursor-pointer font-mono text-xs font-semibold border-0 transition-all duration-300 gap-2"
            style={{ background: "#00e5a0", color: "#000" }}
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCard
            title="Active Projects"
            value={projects.length}
            icon={<Database className="h-4.5 w-4.5" />}
            loading={loading}
            accentColor="#00e5a0"
          />

          <StatsCard
            title="Total Events Tracked"
            value={"Auto"}
            icon={<Globe className="h-4.5 w-4.5" />}
            loading={loading}
            accentColor="#7c6df0"
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
                system · projects list
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
            <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Your Tracking Projects</CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-light">Select a project to view its API key, live logs, and analytics.</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center font-mono text-xs">
                <Database className="h-10 w-10 mb-4 opacity-50 text-[#00e5a0] animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">No Projects Found</h2>
                <p className="text-zinc-500 font-light max-w-md mb-6 leading-relaxed">
                  You don&apos;t have any tracking projects yet. Create one to get started sending custom events!
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="h-9 px-4 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-semibold text-xs border-0 transition-all duration-300"
                >
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#13131a] border-b border-[#1e1e2e]">
                    <TableRow className="border-[#1e1e2e] hover:bg-transparent">
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Project Name</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Description</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">API Key</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Created</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {projects.map((project, index) => (
                      <TableRow
                        key={project._id}
                        className="border-b border-[#1e1e2e] hover:bg-white/[0.01] transition"
                      >
                        <TableCell>
                          <span className="font-mono text-xs text-white font-semibold">{project.name}</span>
                        </TableCell>

                        <TableCell className="max-w-[300px] truncate text-zinc-400 text-xs font-light">
                          {project.description || "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-[#00e5a0]/5 text-[#00e5a0] border-[#00e5a0]/20 rounded-md font-mono text-[10px] h-5 cursor-pointer hover:bg-[#00e5a0]/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(project.projectApiKey);
                              toast.success("API Key copied to clipboard!");
                            }}
                          >
                            {project.projectApiKey}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-zinc-400 text-xs font-mono">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            onClick={() => router.push(`/projects/${project._id}`)}
                            className="h-8 px-3.5 bg-white/5 border border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] cursor-pointer rounded-lg font-mono text-[10px] text-zinc-300 transition-all duration-200"
                            size="sm"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                            Dashboard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Project Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0d0d12] border-[#1e1e2e] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider text-white">Create Event Tracking Project</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-light">
              Create a project to generate an API key for your application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Project Name</Label>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. My Next.js SaaS"
                className="bg-[#13131a] border-[#1e1e2e] text-white focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:border-[#00e5a0] font-mono text-xs h-10 px-3.5 rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Description (Optional)</Label>
              <Textarea
                id="desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="What app is this for?"
                className="bg-[#13131a] border-[#1e1e2e] text-white focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:border-[#00e5a0] font-mono text-xs min-h-24 p-3 rounded-lg resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createLoading}
              className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={createLoading || !createName.trim()}
              className="h-9 px-4 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono text-xs font-semibold border-0 transition-all duration-300"
            >
              {createLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

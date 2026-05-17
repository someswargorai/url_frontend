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
      console.error(error);
      toast.error("Failed to create project.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="relative z-10 container mx-auto px-4 py-5 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects (Event Tracking)</h1>
              <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                Create projects to get API keys and track custom developer events within your applications.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md py-5 px-3 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatsCard
            title="Active Projects"
            value={projects.length}
            icon={<Database className="h-5 w-5 text-indigo-400" />}
            loading={loading}
          />

          <StatsCard
            title="Total Events Tracked"
            value={"Auto"}
            icon={<Globe className="h-5 w-5 text-purple-400" />}
            loading={loading}
          />
        </div>

        <Card className="rounded-md overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Your Tracking Projects</CardTitle>
            <CardDescription>
              Select a project to view its API key, live logs, and analytics.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-md bg-muted" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="h-10 w-10 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  No Projects Found
                </h2>
                <p className="text-muted-foreground max-w-md mb-6 text-sm">
                  You don&apos;t have any tracking projects yet. Create one to start sending custom events!
                </p>
                <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="rounded-md overflow-hidden border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>Project Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {projects.map((project, index) => (
                      <motion.tr
                        key={project._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition"
                      >
                        <TableCell>
                          <span className="font-semibold">{project.name}</span>
                        </TableCell>

                        <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">
                          {project.description || "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-sm bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-mono text-xs cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(project.projectApiKey);
                              toast.success("API Key copied to clipboard!");
                            }}
                          >
                            {project.projectApiKey}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-center pl-4">
                          <Button
                            onClick={() =>
                              router.push(`/projects/${project._id}`)
                            }
                            className="rounded-sm cursor-pointer hover:bg-primary/90"
                            size="sm"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
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

      {/* Create Project Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Event Tracking Project</DialogTitle>
            <DialogDescription>
              Create a project to generate an API key for your application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. My Next.js SaaS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Textarea
                id="desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="What app is this for?"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={createLoading || !createName.trim()}
              className="cursor-pointer"
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
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/50 backdrop-blur-xl border-border/50 rounded-md overflow-hidden shadow-sm h-[140px]">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-2 bg-muted" />
            ) : (
              <h2 className="text-xl font-bold mt-1 text-foreground">
                {value}
              </h2>
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

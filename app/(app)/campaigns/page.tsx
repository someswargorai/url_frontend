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
  Plus,
  BarChart3,
  Calendar,
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

interface Campaign {
  _id: string;
  name: string;
  description: string;
  isDefault: boolean;
  totalClicks: number;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/campaign`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );
      setCampaigns(response.data?.campaigns || []);
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

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        fetchCampaigns();
      }, 0);
    }
  }, [session?.access_token, status]);

  const handleCreateCampaign = async () => {
    if (!createName.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    try {
      setCreateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/campaign`,
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

      toast.success("Campaign created successfully!");
      setCampaigns([response.data.campaign, ...campaigns]);
      setIsCreateOpen(false);
      setCreateName("");
      setCreateDesc("");
      fetchCampaigns();
    } catch (error) {
      console.error(error);
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
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
                Campaigns
              </h1>
              <p className="text-zinc-400 mt-2 text-sm max-w-lg font-light leading-relaxed">
                Group your links into marketing campaigns to track macro-level
                performance across sources.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-lg h-11 px-5 font-mono text-xs border-0 font-semibold cursor-pointer gap-2 transition-all duration-300 hover:shadow-[0_0_16px_rgba(0,229,160,0.2)]"
            style={{ background: "#00e5a0", color: "#000" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Create Campaign
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCard
            title="Total Campaigns"
            value={campaigns.length}
            icon={<Globe className="h-4.5 w-4.5" />}
            loading={loading}
            accentColor="#00e5a0"
          />

          <StatsCard
            title="Total Campaign Clicks"
            value={campaigns.reduce(
              (acc, curr) => acc + (curr.totalClicks || 0),
              0,
            )}
            icon={<MousePointerClick className="h-4.5 w-4.5" />}
            loading={loading}
            accentColor="#7c6df0"
          />
        </div>

        <Card className="rounded-xl overflow-hidden bg-[#0d0d12] border-[#1e1e2e]">
          {/* Terminal topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
            <div className="flex items-center gap-2">
              {/* macOS window control dots */}
              <div className="flex items-center gap-1.5 shrink-0 mr-1">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                system · marketing campaigns
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#00e5a0]" />
              <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          <CardHeader className="pb-4 pt-4 px-6">
            <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Your Campaigns</CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-light">
              Select a campaign to view aggregated insights and charts.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="h-10 w-10 text-zinc-600 mb-4" />
                <h2 className="text-base font-mono font-semibold mb-2 text-white uppercase tracking-wider">
                  No Campaigns Found
                </h2>
                <p className="text-zinc-500 max-w-sm mb-6 text-xs font-light">
                  You don&apos;t have any marketing campaigns yet. Create one to
                  group your short links!
                </p>
                <Button 
                  onClick={() => setIsCreateOpen(true)} 
                  variant="outline"
                  className="font-mono text-xs h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] hover:border-[#00e5a0] text-zinc-300 transition-all duration-300 cursor-pointer"
                >
                  Create First Campaign
                </Button>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-[#1e1e2e]">
                <Table>
                  <TableHeader className="bg-[#13131a]">
                    <TableRow className="border-[#1e1e2e] hover:bg-transparent">
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Campaign Name</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Description</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Total Clicks</TableHead>
                      <TableHead className="text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Created</TableHead>
                      <TableHead className="text-center text-zinc-500 font-mono text-[9px] tracking-wider uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-[#0d0d12]">
                    {campaigns.map((campaign, index) => (
                      <motion.tr
                        key={campaign._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="border-b border-[#1e1e2e] hover:bg-white/[0.01] transition"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-white">
                              {campaign.name}
                            </span>
                            {campaign.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] h-5 px-1.5 bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="max-w-[250px] truncate text-zinc-400 text-xs font-light">
                          {campaign.description || "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-md bg-[#00e5a0]/5 border-[#00e5a0]/20 text-[#00e5a0] font-mono text-[10px] h-5"
                          >
                            {campaign.totalClicks || 0} Clicks
                          </Badge>
                        </TableCell>

                        <TableCell className="text-zinc-400 text-xs font-mono">
                          <span className="flex items-center gap-2 font-light">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>

                        <TableCell className="text-center pl-4">
                          <Button
                            onClick={() =>
                              router.push(`/campaigns/${campaign._id}`)
                            }
                            className="rounded-lg font-mono text-[10px] h-8 px-3 cursor-pointer bg-white/5 border border-[#1e1e2e] hover:border-[#00e5a0] hover:bg-[#00e5a0]/10 hover:text-[#00e5a0] transition-all duration-300 text-zinc-300"
                            size="sm"
                          >
                            <BarChart3 className="w-3.5 h-3.5 mr-2" />
                            View Insights
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

      {/* Create Campaign Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          showCloseButton={false}
          className="
            sm:max-w-[425px] 
            border border-[#1e1e2e] 
            bg-[#0d0d12] 
            text-white 
            rounded-xl 
            shadow-2xl 
            overflow-hidden 
            p-0
          "
        >
          {/* top accent glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent" />

          {/* Dialog Header with terminal layout */}
          <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[#13131a] z-50">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0 mr-1">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
              <DialogTitle className="font-mono text-xs text-[#00e5a0] uppercase tracking-widest">
                Create Campaign
              </DialogTitle>
            </div>
          </div>

          <div className="grid gap-4 py-6 px-6 font-mono text-xs">
            <p className="text-zinc-400 text-xs leading-relaxed font-light font-sans mb-1">
              Group links together to track overall marketing performance.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-400 font-mono text-[10px] tracking-wider uppercase">Campaign Name</Label>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Black Friday 2026"
                className="h-10 bg-[#13131a] border-[#1e1e2e] text-white rounded-lg px-3 focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:ring-offset-0 focus-visible:border-[#00e5a0] font-mono text-xs placeholder:text-zinc-600"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-zinc-400 font-mono text-[10px] tracking-wider uppercase">Description (Optional)</Label>
              <Textarea
                id="desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Describe the goal of this campaign..."
                className="resize-none h-24 bg-[#13131a] border-[#1e1e2e] text-white rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:ring-offset-0 focus-visible:border-[#00e5a0] font-mono text-xs placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e1e2e] bg-[#13131a]/50">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createLoading}
              className="font-mono text-xs h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={createLoading || !createName.trim()}
              className="font-mono text-xs h-9 px-4 rounded-lg border-0 font-semibold cursor-pointer"
              style={{ background: "#00e5a0", color: "#000" }}
            >
              {createLoading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
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
  value: number;
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
      <Card className="bg-[#0d0d12] border-[#1e1e2e] rounded-xl overflow-hidden transition-all duration-300 relative h-[130px]">
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
              <Skeleton className="h-8 w-16 mt-2 bg-[#13131a] border border-[#1e1e2e] animate-pulse" />
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

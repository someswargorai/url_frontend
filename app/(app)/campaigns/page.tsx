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
              <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
              <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                Group your links into marketing campaigns to track macro-level
                performance across sources.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md py-5 px-3 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatsCard
            title="Total Campaigns"
            value={campaigns.length}
            icon={<Globe className="h-5 w-5 text-blue-400" />}
            loading={loading}
          />

          <StatsCard
            title="Total Campaign Clicks"
            value={campaigns.reduce(
              (acc, curr) => acc + (curr.totalClicks || 0),
              0,
            )}
            icon={<MousePointerClick className="h-5 w-5 text-purple-400" />}
            loading={loading}
          />
        </div>

        <Card className="rounded-md overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Your Campaigns</CardTitle>
            <CardDescription>
              Select a campaign to view aggregated insights and charts.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-md bg-muted" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  No Campaigns Found
                </h2>
                <p className="text-muted-foreground max-w-md mb-6 text-sm">
                  You don&apos;t have any marketing campaigns yet. Create one to
                  group your short links!
                </p>
                <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                  Create First Campaign
                </Button>
              </div>
            ) : (
              <div className="rounded-md overflow-hidden border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Total Clicks</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {campaigns.map((campaign, index) => (
                      <motion.tr
                        key={campaign._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {campaign.name}
                            </span>
                            {campaign.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 px-1.5 bg-muted"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">
                          {campaign.description || "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-sm bg-primary/5 border-primary/20 text-primary"
                          >
                            {campaign.totalClicks || 0} Clicks
                          </Badge>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-center pl-4">
                          <Button
                            onClick={() =>
                              router.push(`/campaigns/${campaign._id}`)
                            }
                            className="rounded-sm cursor-pointer hover:bg-primary/90"
                            size="sm"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Group links together to track overall marketing performance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Black Friday 2026"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Textarea
                id="desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Describe the goal of this campaign..."
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
              onClick={handleCreateCampaign}
              disabled={createLoading || !createName.trim()}
              className="cursor-pointer"
            >
              {createLoading ? "Creating..." : "Create Campaign"}
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
  value: number;
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
              <h2 className="text-3xl font-bold mt-1 text-foreground">
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

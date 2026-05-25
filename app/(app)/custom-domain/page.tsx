"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface DomainRecord {
  _id: string;
  domain: string;
  isValid: boolean;
  isDefault: boolean;
  verificationToken: string;
  createdAt: string;
}

export default function CustomDomainPage() {
  const { data: session, status } = useSession();
  const [domainRecord, setDomainRecord] = useState<DomainRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Form and Action states
  const [domainInput, setDomainInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getTxtRecordHost = (domainName: string) => {
    if (!domainName) return "_shorty_host";
    const parts = domainName.split(".");
    if (parts.length <= 2) {
      return "_shorty_host";
    }

    // Check if it's a multi-part TLD (like .co.uk, .com.au, .net.in)
    const ccTLDs = ["uk", "in", "jp", "us", "au", "br", "nz", "ca", "za"];
    const sldTypes = ["co", "com", "org", "net", "gov", "edu", "ac"];

    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];

    let rootDomainPartsCount = 2;
    if (ccTLDs.includes(lastPart) && sldTypes.includes(secondLastPart)) {
      rootDomainPartsCount = 3;
    }

    // If the total parts are less than or equal to rootDomainPartsCount, it's a root domain
    if (parts.length <= rootDomainPartsCount) {
      return "_shorty_host";
    }

    // The subdomain part is everything before the root domain parts
    const subdomainParts = parts.slice(0, parts.length - rootDomainPartsCount);
    return `_shorty_host.${subdomainParts.join(".")}`;
  };

  const getCnameRecordHost = (domainName: string) => {
    if (!domainName) return "links";
    const parts = domainName.split(".");
    if (parts.length <= 2) {
      return "links";
    }

    // Check if it's a multi-part TLD (like .co.uk, .com.au, .net.in)
    const ccTLDs = ["uk", "in", "jp", "us", "au", "br", "nz", "ca", "za"];
    const sldTypes = ["co", "com", "org", "net", "gov", "edu", "ac"];

    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];

    let rootDomainPartsCount = 2;
    if (ccTLDs.includes(lastPart) && sldTypes.includes(secondLastPart)) {
      rootDomainPartsCount = 3;
    }

    if (parts.length <= rootDomainPartsCount) {
      return "links";
    }

    const subdomainParts = parts.slice(0, parts.length - rootDomainPartsCount);
    return subdomainParts.join(".");
  };

  const fetchDomain = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/domain`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );
      if (response.data.success && response.data.domain) {
        setDomainRecord(response.data.domain);
      } else {
        setDomainRecord(null);
      }
    } catch (error) {
      console.error("Error fetching domain:", error);
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
      const timer = setTimeout(() => {
        fetchDomain();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [session?.access_token, status]);

  const handleAddDomain = async () => {
    if (!domainInput.trim()) {
      toast.error("Please enter a domain name.");
      return;
    }

    // Simple validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    const cleaned = domainInput
      .trim()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/$/, "");
    if (!domainRegex.test(cleaned)) {
      toast.error(
        "Please enter a valid domain name (e.g. links.mydomain.com).",
      );
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/domain`,
        { domain: cleaned },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (response.data.success) {
        setDomainRecord(response.data.domain);
        setAddDialogOpen(false);
        setDomainInput("");
        toast.success(
          response.data.message || "Domain registered successfully!",
        );
      }
    } catch (error) {
      console.error("Error adding domain:", error);
      if (axios?.isAxiosError(error)) {
        const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainRecord) return;
    try {
      setActionLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/domain/verify`,
        { domainId: domainRecord._id },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (response.data.success) {
        setDomainRecord(response.data.domain);
        toast.success("Domain successfully verified!");
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      if (axios?.isAxiosError(error)) {
        const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDomain = async () => {
    if (!domainRecord) return;

    try {
      setActionLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/domain/${domainRecord._id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (response.data.success) {
        setDomainRecord(null);
        setDeleteDialogOpen(false);
        toast.success("Domain deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      if (axios?.isAxiosError(error)) {
        const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const isSubdomain = (domain: string) => {
    if (!domain) return false;
    const parts = domain.split(".");
    if (parts.length <= 2) {
      return false;
    }

    // Check if it's a multi-part TLD (like .co.uk, .com.au, .net.in)
    const ccTLDs = ["uk", "in", "jp", "us", "au", "br", "nz", "ca", "za"];
    const sldTypes = ["co", "com", "org", "net", "gov", "edu", "ac"];

    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];

    let rootDomainPartsCount = 2;
    if (ccTLDs.includes(lastPart) && sldTypes.includes(secondLastPart)) {
      rootDomainPartsCount = 3;
    }

    return parts.length > rootDomainPartsCount;
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
              Custom <span style={{ color: "#00e5a0" }}>Domains</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl font-light leading-relaxed">
              Brand your short URLs with your own custom domain for higher CTR and professional identity.
            </p>
          </div>

          {domainRecord === null && !loading && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="h-11 px-5 rounded-lg cursor-pointer font-mono text-xs font-semibold border-0 transition-all duration-300 gap-2"
              style={{ background: "#00e5a0", color: "#000" }}
            >
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          )}
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCard
            title="Custom Domains"
            value={domainRecord ? "1 / 1" : "0 / 1"}
            icon={<Globe className="h-4.5 w-4.5" />}
            loading={loading}
            accentColor="#00e5a0"
          />

          <StatsCard
            title="Domain Status"
            value={domainRecord ? (domainRecord.isValid ? "Verified" : "Pending") : "Not Configured"}
            icon={domainRecord ? (domainRecord.isValid ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5 animate-pulse" />) : <Globe className="h-4.5 w-4.5" />}
            loading={loading}
            accentColor={domainRecord ? (domainRecord.isValid ? "#00e5a0" : "#febc2e") : "#7c6df0"}
          />
        </div>

        {/* Configuration Terminal Container */}
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
                system · domains config
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
            <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">Domain Configuration</CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-light">Set up and verify your DNS settings to route short URLs to your custom branding.</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
                ))}
              </div>
            ) : domainRecord === null ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center font-mono text-xs">
                <Globe className="h-10 w-10 mb-4 opacity-50 text-[#00e5a0] animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">No Custom Domain</h2>
                <p className="text-zinc-500 font-light max-w-md mb-6 leading-relaxed">
                  You don&apos;t have any custom domains set up. Add your own domain to start generating fully branded, premium links.
                </p>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="h-9 px-4 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-semibold text-xs border-0 transition-all duration-300"
                >
                  Configure Custom Domain
                </Button>
              </div>
            ) : (
              /* Configuration Settings Panel */
              <div className="space-y-6">
                {/* Domain Header Area */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1e1e2e] pb-4 gap-4">
                  <div>
                    <h3 className="font-mono text-base text-white font-semibold flex items-center gap-3">
                      {domainRecord.domain}
                      {domainRecord.isValid ? (
                        <Badge className="bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20 rounded-md font-mono text-[10px] h-5">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-[#febc2e]/10 text-[#febc2e] border-[#febc2e]/20 rounded-md font-mono text-[10px] h-5"
                        >
                          <Clock className="h-3 w-3 mr-1 animate-pulse" /> Pending Verification
                        </Badge>
                      )}
                    </h3>
                    <p className="text-zinc-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
                      Registered on {new Date(domainRecord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-8 px-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg font-mono text-[10px] transition-all duration-200"
                    disabled={actionLoading}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove Domain
                  </Button>
                </div>

                {/* Instructions Section */}
                {!domainRecord.isValid ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-[#febc2e]/5 border border-[#febc2e]/10 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[#febc2e] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#febc2e]">
                          Domain Verification Required
                        </h4>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed">
                          Before we can route traffic through your custom
                          domain, you must verify ownership. Configure the
                          following DNS records in your domain registrar (e.g.
                          GoDaddy, Namecheap, Cloudflare).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-mono text-xs text-white uppercase tracking-wider">
                        Step 1: Point your domain to our hosting server
                      </h4>
                      <p className="text-xs text-zinc-400 font-light">
                        Depending on whether this is a root domain or subdomain,
                        add <span className="font-semibold text-white">one</span> of the
                        following records to connect your domain:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option A: Root Domain */}
                        <div
                          className={`p-4 rounded-lg border bg-[#13131a]/60 ${
                            isSubdomain(domainRecord.domain)
                              ? "opacity-40 border-[#1e1e2e]"
                              : "border-[#1e1e2e] shadow-lg shadow-black/10"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] text-white uppercase tracking-wider">
                              Option A: For Root Domain
                            </span>
                            {!isSubdomain(domainRecord.domain) && (
                              <Badge
                                variant="secondary"
                                className="bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20 rounded-md font-mono text-[9px] h-4.5 px-1.5"
                              >
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <div className="bg-[#0d0d12] border border-[#1e1e2e] rounded-lg p-3 text-[11px] font-mono space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block font-light">Type</span>
                                <span className="text-white">A</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#1e1e2e]/50 pt-2">
                              <div>
                                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block font-light">Host / Name</span>
                                <span className="text-white">@ <span className="text-zinc-500 text-[10px] font-light">(or blank)</span></span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#1e1e2e]/50 pt-2">
                              <div>
                                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block font-light">Value / IP Address</span>
                                <span className="text-white">76.76.21.21</span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer rounded-md"
                                onClick={() => copyToClipboard("76.76.21.21")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Option B: Subdomain */}
                        <div
                          className={`p-4 rounded-lg border bg-[#13131a]/60 ${
                            isSubdomain(domainRecord.domain)
                              ? "border-[#1e1e2e] shadow-lg shadow-black/10"
                              : "opacity-40 border-[#1e1e2e]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] text-white uppercase tracking-wider">
                              Option B: For Subdomain
                            </span>
                            {isSubdomain(domainRecord.domain) && (
                              <Badge
                                variant="secondary"
                                className="bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20 rounded-md font-mono text-[9px] h-4.5 px-1.5"
                              >
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <div className="bg-[#0d0d12] border border-[#1e1e2e] rounded-lg p-3 text-[11px] font-mono space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block font-light">Type</span>
                                <span className="text-white">CNAME</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#1e1e2e]/50 pt-2">
                              <div>
                                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block font-light">Host / Name</span>
                                <span className="text-white">{getCnameRecordHost(domainRecord.domain)}</span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer rounded-md"
                                onClick={() =>
                                  copyToClipboard(
                                    getCnameRecordHost(domainRecord.domain),
                                  )
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#1e1e2e]/50 pt-2">
                              <div>
                                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block font-light">Value / Target</span>
                                <span className="text-white">cname.vercel-dns.com</span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer rounded-md"
                                onClick={() =>
                                  copyToClipboard("cname.vercel-dns.com")
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <h4 className="font-mono text-xs text-white uppercase tracking-wider">
                        Step 2: Add Ownership Verification TXT Record
                      </h4>
                      <p className="text-xs text-zinc-400 font-light">
                        Add this TXT record to prove ownership of the domain. It
                        must exactly match the value below:
                      </p>

                      <div className="p-4 rounded-lg border border-[#1e1e2e] bg-[#13131a]/60">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block font-light">
                              Record Type
                            </span>
                            <div className="bg-[#0d0d12] border border-[#1e1e2e] rounded-lg p-3 text-xs font-mono text-white">
                              TXT
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block font-light">
                              Host / Name
                            </span>
                            <div className="bg-[#0d0d12] border border-[#1e1e2e] rounded-lg p-3 text-xs font-mono text-white flex items-center justify-between">
                              <span className="truncate">{getTxtRecordHost(domainRecord.domain)}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer rounded-md shrink-0 ml-1"
                                onClick={() => copyToClipboard(getTxtRecordHost(domainRecord.domain))}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block font-light">
                              Value
                            </span>
                            <div className="bg-[#0d0d12] border border-[#1e1e2e] rounded-lg p-3 text-xs font-mono text-white flex items-center justify-between overflow-hidden">
                              <span className="truncate mr-2">
                                {domainRecord.verificationToken}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer rounded-md shrink-0"
                                onClick={() =>
                                  copyToClipboard(
                                    domainRecord.verificationToken,
                                  )
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-[#1e1e2e]">
                      <Button
                        variant="outline"
                        onClick={fetchDomain}
                        className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer"
                        disabled={actionLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-1.5" /> Sync Status
                      </Button>
                      <Button
                        onClick={handleVerifyDomain}
                        className="h-9 px-5 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono text-xs font-semibold border-0 transition-all duration-300"
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? "Verifying..."
                          : "Verify DNS Configuration"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Verified / Active State Description */
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-[#00e5a0]/5 border border-[#00e5a0]/15 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#00e5a0]/10 flex items-center justify-center text-[#00e5a0] shrink-0 border border-[#00e5a0]/25">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-[#00e5a0]">
                          Your domain is active!
                        </h4>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-2xl">
                          Congratulations! Your custom branded domain{" "}
                          <span className="font-semibold text-white">
                            {domainRecord.domain}
                          </span>{" "}
                          is verified and routing traffic. Shortlinks created on
                          your account will now leverage this custom domain for
                          higher click-through rates and professional look.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#1e1e2e]">
                      <h4 className="font-mono text-xs text-white uppercase tracking-wider">
                        Active Configurations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-[#13131a]/60 border border-[#1e1e2e] space-y-1">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-light">
                            Assigned Domain
                          </span>
                          <p className="text-xs text-white font-mono font-semibold flex items-center gap-1.5">
                            {domainRecord.domain}{" "}
                            <ExternalLink
                              className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-[#00e5a0] transition-colors"
                              onClick={() =>
                                window.open(
                                  `https://${domainRecord.domain}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            />
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-[#13131a]/60 border border-[#1e1e2e] space-y-1">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-light">
                            Default Domain Routing
                          </span>
                          <p className="text-xs font-mono font-semibold flex items-center gap-1.5 text-[#00e5a0]">
                            Active
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Add Domain Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0d0d12] border-[#1e1e2e] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider text-white">Add Custom Domain</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-light">
              Enter the custom domain or subdomain you want to use for shortening URLs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="domain" className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                Domain Name
              </label>
              <Input
                id="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. links.mydomain.com or brand.co"
                className="bg-[#13131a] border-[#1e1e2e] text-white focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus-visible:border-[#00e5a0] font-mono text-xs h-10 px-3.5 rounded-lg animate-none"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    domainInput.trim() &&
                    !actionLoading
                  ) {
                    handleAddDomain();
                  }
                }}
              />
              <p className="text-[10px] text-zinc-500 font-light leading-relaxed mt-1">
                Note: Do not include http://, https://, or www. Just enter the bare domain or subdomain.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={actionLoading}
              className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDomain}
              disabled={!domainInput.trim() || actionLoading}
              className="h-9 px-4 rounded-lg cursor-pointer bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono text-xs font-semibold border-0 transition-all duration-300"
            >
              {actionLoading ? "Adding..." : "Add Domain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete / Revoke Custom Domain Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0d0d12] border-[#1e1e2e] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-wider text-white">Disconnect Custom Domain</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-light">
              Are you sure you want to remove this domain? Doing so will immediately disrupt traffic routing and cause all active branded shortlinks associated with this domain to stop working. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              disabled={actionLoading}
              className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDomain();
              }}
              className="h-9 px-4 rounded-lg cursor-pointer bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold border-0 transition-all duration-300"
              disabled={actionLoading}
            >
              {actionLoading ? "Disconnecting..." : "Disconnect Domain"}
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

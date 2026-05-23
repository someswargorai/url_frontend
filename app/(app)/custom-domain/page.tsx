"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
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
    <div className="min-h-screen">
      <div className="relative z-10 container mx-auto px-4 py-5 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Custom Domains
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Brand your short URLs with your own custom domain.
              </p>
            </div>
          </div>
          {domainRecord === null && !loading && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="rounded-md py-5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          )}
        </motion.div>

        {/* Main Content */}
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[250px] w-full rounded-md bg-muted/50" />
          </div>
        ) : domainRecord === null ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-xl border border-dashed border-border/60 bg-card/40 backdrop-blur-md"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              No Custom Domain Configured
            </h3>
            <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
              You don&apos;t have any custom domains set up. Add your own domain
              to start generating fully branded, premium links.
            </p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              size="lg"
              className="rounded-md px-6 py-6 cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-1" /> Configure Custom Domain
            </Button>
          </motion.div>
        ) : (
          // Configuration/Status Panel
          <div className="grid grid-cols-1 gap-8">
            {/* Domain Card */}
            <Card className="rounded-md border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b bg-muted/10 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-3">
                    {domainRecord.domain}
                    {domainRecord.isValid ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5 rounded-sm flex items-center gap-1"
                      >
                        <Clock className="h-3.5 w-3.5 animate-pulse" /> Pending
                        Verification
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Registered on{" "}
                    {new Date(domainRecord.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={actionLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                {/* Instructions Section */}
                {!domainRecord.isValid ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-amber-500">
                          Domain Verification Required
                        </h4>
                        <p className="text-xs text-amber-500/90 leading-relaxed">
                          Before we can route traffic through your custom
                          domain, you must verify ownership. Configure the
                          following DNS records in your domain registrar (e.g.
                          GoDaddy, Namecheap, Cloudflare).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground">
                        Step 1: Point your domain to our hosting server
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Depending on whether this is a root domain or subdomain,
                        add <span className="font-semibold">one</span> of the
                        following records to connect your domain:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option A: Root Domain */}
                        <div
                          className={`p-4 rounded-lg border bg-muted/20 ${
                            isSubdomain(domainRecord.domain)
                              ? "opacity-50"
                              : "border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-foreground">
                              Option A: For Root Domain (e.g. mydomain.com)
                            </span>
                            {!isSubdomain(domainRecord.domain) && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <div className="bg-background/80 border rounded p-3 text-xs font-mono space-y-2 relative">
                            <div>
                              <span className="text-muted-foreground">
                                Type:
                              </span>{" "}
                              A
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Host/Name:
                              </span>{" "}
                              @ (or blank)
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-muted-foreground">
                                  Value:
                                </span>{" "}
                                76.76.21.21
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard("76.76.21.21")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Option B: Subdomain */}
                        <div
                          className={`p-4 rounded-lg border bg-muted/20 ${
                            isSubdomain(domainRecord.domain)
                              ? "border-border/80"
                              : "opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-foreground">
                              Option B: For Subdomain (e.g. links.mydomain.com)
                            </span>
                            {isSubdomain(domainRecord.domain) && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <div className="bg-background/80 border rounded p-3 text-xs font-mono space-y-2 relative">
                            <div>
                              <span className="text-muted-foreground">
                                Type:
                              </span>{" "}
                              CNAME
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-muted-foreground">
                                  Host/Name:
                                </span>{" "}
                                {getCnameRecordHost(domainRecord.domain)}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() =>
                                  copyToClipboard(
                                    getCnameRecordHost(domainRecord.domain),
                                  )
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-muted-foreground">
                                  Value:
                                </span>{" "}
                                cname.vercel-dns.com
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
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
                      <h4 className="text-sm font-bold text-foreground">
                        Step 2: Add Ownership Verification TXT Record
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Add this TXT record to prove ownership of the domain. It
                        must exactly match the value below:
                      </p>

                      <div className="p-4 rounded-lg border border-border bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-xs text-muted-foreground font-semibold">
                              Record Type
                            </span>
                            <div className="bg-background/80 border rounded p-2 text-xs font-mono">
                              TXT
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-xs text-muted-foreground font-semibold">
                              Host / Name
                            </span>
                            <div className="bg-background/80 border rounded p-2 text-xs font-mono flex items-center justify-between">
                              <span>{getTxtRecordHost(domainRecord.domain)}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(getTxtRecordHost(domainRecord.domain))}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-xs text-muted-foreground font-semibold">
                              Value
                            </span>
                            <div className="bg-background/80 border rounded p-2 text-xs font-mono flex items-center justify-between">
                              <span className="truncate max-w-[150px]">
                                {domainRecord.verificationToken}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
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

                    <div className="pt-6 flex justify-end gap-3 border-t border-border/40">
                      <Button
                        variant="outline"
                        onClick={fetchDomain}
                        className="gap-2 cursor-pointer"
                        disabled={actionLoading}
                      >
                        <RefreshCw className="h-4 w-4" /> Sync Status
                      </Button>
                      <Button
                        onClick={handleVerifyDomain}
                        className="bg-black hover:bg-black text-white px-6 cursor-pointer"
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? "Verifying..."
                          : "Verify DNS Configuration"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Verified/Active State Description
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-base font-bold text-foreground">
                          Your domain is active!
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                          Congratulations! Your custom branded domain{" "}
                          <span className="font-semibold text-foreground">
                            {domainRecord.domain}
                          </span>{" "}
                          is verified and routing traffic. Shortlinks created on
                          your account will now leverage this custom domain for
                          higher CTR and professional branding.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <h4 className="text-sm font-semibold">
                        Active Configurations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Assigned Domain
                          </span>
                          <p className="text-sm font-semibold flex items-center gap-1.5">
                            {domainRecord.domain}{" "}
                            <ExternalLink
                              className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                              onClick={() =>
                                window.open(
                                  `https://${domainRecord.domain}`,
                                  "_blank",
                                )
                              }
                            />
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Default Domain Routing
                          </span>
                          <p className="text-sm font-semibold flex items-center gap-1.5 text-emerald-500">
                            Active
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create / Add Domain Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
            <DialogDescription>
              Enter the custom domain or subdomain you want to use for
              shortening URLs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="domain" className="text-sm font-medium">
                Domain Name
              </label>
              <Input
                id="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. links.mydomain.com or brand.co"
                className="col-span-3"
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
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                Note: Do not include http://, https://, or www. Just enter the
                bare domain or subdomain.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDomain}
              disabled={!domainInput.trim() || actionLoading}
              className="bg-black hover:bg-black text-white px-6"
            >
              {actionLoading ? "Adding..." : "Add Domain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete / Revoke Custom Domain Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Custom Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this domain? Doing so will immediately disrupt traffic routing and cause all active branded shortlinks associated with this domain to stop working. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDomain();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

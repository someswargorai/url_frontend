"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import axios from "axios";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Zap,
  Crown,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  CalendarDays,
  CreditCard,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

type Subscription = {
  _id: string;
  email: string;
  plan: string;
  polarCustomerId: string;
  renewsAt: string;
  subscribedAt: string;
  subscriptionId: string;
  subscriptionStatus: "active" | "canceled" | "expired";
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  highlight: boolean;
  badge: string | null;
  featured: boolean;
  cta: string;
  checkoutLink: string | null;
  features: string[];
  missing: string[];
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started, no card required",
    icon: <Zap className="h-4.5 w-4.5" />,
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-500",
    badge: null,
    featured: false,
    checkoutLink: null,
    cta: "Get started free",
    highlight: false,
    features: [
      "10 short links",
      "5 campaigns",
      "Base62 short code generation",
      "Instant Redis-cached redirects",
      "Public & private link visibility",
      "QR code generation & download",
      "QR scan tracking",
      "Funnel & retention analytics",
      "Revenue tracking",
      "User journey analytics",
      "AI assistant",
      "Click analytics (total, unique, trends)",
      "Geographic analytics (country, city)",
      "Device & browser analytics",
      "Traffic source & referrer tracking",
      "Basic event tracking",
      "Weekly email reports",
      "JWT authentication",
    ],
    missing: [
      "Only 10 short links (vs 60 in Base)",
      "Only 5 campaigns (vs 10 in Base)",
      "Custom domains",
      "API keys & SDK access",
      "Campaign management & ROI (Only 5 campaigns)",
      "Priority support",
    ],
  },
  {
    name: "Base Plan",
    price: "₹190",
    period: "month",
    description: "For individuals who need more",
    icon: <Crown className="h-4.5 w-4.5" />,
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "Most popular",
    featured: true,
    highlight: true,
    checkoutLink: process.env.NEXT_PUBLIC_POLAR_BASE_CHECKOUT_LINK!,
    cta: "Get Base plan",
    features: [
      "60 short links",
      "10 campaigns",
      "5 projects (isolated workspaces)",
      "1 custom domain",
      "1 API key & SDK access",
      "Base62 short code generation",
      "Custom aliases & slugs",
      "Instant Redis-cached redirects",
      "Public & private link visibility",
      "QR code generation & download",
      "QR scan tracking",
      "Full click analytics dashboard",
      "Geographic analytics (country, region, city)",
      "Device, browser & OS analytics",
      "Traffic source & referrer tracking",
      "Custom event tracking",
      "Funnel analytics & conversion tracking",
      "Retention analytics (Day-1, Day-7, Day-30)",
      "Revenue tracking from event metadata",
      "Campaign ROI & attribution",
      "User journey analytics",
      "Activity feed & event timeline",
      "DAU & engagement analytics",
      "Weekly automated email reports",
      "AI floating assistant",
      "Priority support",
    ],
    missing: [
      "Only 60 short links (vs 120 in Pro)",
      "Only 10 campaigns (vs 20 in Pro)",
      "Only 1 Api key (vs 2 in Pro) with no SDK access",
      "Multiple API keys",
      "Dedicated support",
    ],
  },
  {
    name: "Pro Plan",
    price: "₹475",
    period: "month",
    description: "For teams and power users",
    icon: <Sparkles className="h-4.5 w-4.5" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: null,
    featured: false,
    highlight: false,
    checkoutLink: process.env.NEXT_PUBLIC_POLAR_PRO_CHECKOUT_LINK!,
    cta: "Get Pro plan",
    features: [
      "120 short links",
      "20 campaigns",
      "20 projects (isolated workspaces)",
      "1 custom domain",
      "2 API keys & SDK access",
      "Everything in Base plan",
      "Base62 short code generation",
      "Custom aliases & slugs",
      "Instant Redis-cached redirects",
      "Public & private link visibility",
      "QR code generation & download",
      "QR scan tracking",
      "Full click analytics dashboard",
      "Geographic analytics (country, region, city)",
      "Device, browser & OS analytics",
      "Traffic source & referrer tracking",
      "Custom event tracking",
      "Funnel analytics & conversion tracking",
      "Retention analytics (Day-1, Day-7, Day-30)",
      "Revenue tracking from event metadata",
      "Campaign ROI & attribution",
      "User journey analytics",
      "Activity feed & event timeline",
      "DAU & engagement analytics",
      "Weekly automated email reports",
      "AI floating assistant",
      "Dedicated support",
      "RabbitMQ-backed email processing",
      "Scalable background job processing",
    ],
    missing: [],
  },
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a:
      "Yes. Cancel from the customer portal and you'll keep access until the end of your current billing period. No questions asked.",
  },
  {
    q: "What happens when I upgrade mid-cycle?",
    a:
      "Polar prorates the difference automatically. You only pay for the days remaining in your billing period.",
  },
  {
    q: "Is my payment information secure?",
    a:
      "All payments are processed by Stripe via Polar. We never store your card details on our servers.",
  },
  {
    q: "Can I switch from Base to Pro?",
    a:
      "Yes. Open the customer portal, select your new plan, and the change takes effect immediately with prorated billing.",
  },
  {
    q: "Do you offer refunds?",
    a:
      "We offer a 7-day refund window for new subscriptions. Contact support with your order ID and we'll process it promptly.",
  },
];

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BillingSkeleton() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
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
      </div>

      <div className="space-y-8 container mx-auto px-4 max-w-5xl relative z-10 py-10">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
          <Skeleton className="h-4 w-72 bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl bg-[#13131a]/80 border border-[#1e1e2e] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // fetch active subscription
  useEffect(() => {
    const fetch = async () => {
      if (!session?.access_token) return;
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription/get-active-subscription`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        if (res.data?.success) setSubscription(res.data.plan ?? null);
      } catch (error) {
        if (axios?.isAxiosError(error)) {
          const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [session?.access_token]);

  // open Polar customer portal (upgrade / cancel / billing)
  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription/customer-portal`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } },
      );
      window.open(res.data.url, "_blank");
    } catch (error) {
      if (axios?.isAxiosError(error)) {
        const message = error?.response?.data?.error ?? error?.response?.data?.message ?? "Something went wrong";
        toast.error(message);
      }
    } finally {
      setPortalLoading(false);
    }
  };

  // open Polar embed checkout
  const openCheckout = async (link: string) => {
    const themeColor = theme === "light" ? "light" : "dark";
    try {
      await PolarEmbedCheckout.create(link, { theme: themeColor });
    } catch {
      toast.error("Couldn't open checkout", {
        description: "Please try again in a moment.",
      });
    }
  };

  const handlePlanAction = async (plan: Plan) => {
    if (subscription?.polarCustomerId) {
      await openPortal();
      return;
    }
    if (plan.checkoutLink) {
      await openCheckout(plan.checkoutLink);
    }
  };

  const isActive = (planName: string) =>
    subscription?.plan?.toLowerCase() === planName.toLowerCase() &&
    subscription?.subscriptionStatus === "active";

  const hasActiveSub = subscription?.subscriptionStatus === "active";

  if (loading) return <BillingSkeleton />;

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

      <div className="relative z-10 container mx-auto px-4 py-8 pb-20 max-w-5xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold tracking-tight dark:text-white font-mono" style={{ letterSpacing: "-1px" }}>
            Billing & <span style={{ color: "#00e5a0" }}>Plan</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl font-light leading-relaxed">
            Manage your subscription, upgrades, and billing details securely.
          </p>
        </motion.div>

        {/* Current plan card inside terminal container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
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
                  system · active billing
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
              <CardTitle className="font-mono text-sm text-white uppercase tracking-wider flex items-center justify-between">
                <span>Current Plan Details</span>
                {subscription ? (
                  <Badge
                    variant="outline"
                    className={`capitalize font-mono text-[10px] h-5 rounded-md ${
                      subscription.subscriptionStatus === "active"
                        ? "bg-[#00e5a0]/5 text-[#00e5a0] border-[#00e5a0]/20"
                        : subscription.subscriptionStatus === "canceled"
                        ? "bg-[#febc2e]/5 text-[#febc2e] border-[#febc2e]/20"
                        : "bg-[#ff5f57]/5 text-[#ff5f57] border-[#ff5f57]/20"
                    }`}
                  >
                    {subscription.subscriptionStatus}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-zinc-500/5 text-zinc-400 border-zinc-500/20 font-mono text-[10px] h-5 rounded-md">
                    Free
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-2">
              {subscription ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 rounded-lg bg-[#13131a]/60 border border-[#1e1e2e] space-y-1">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Crown className="h-3 w-3" /> Plan Tier
                    </p>
                    <p className="text-sm font-mono font-semibold text-white capitalize">
                      {subscription.plan}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#13131a]/60 border border-[#1e1e2e] space-y-1">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" /> Subscribed
                    </p>
                    <p className="text-sm font-mono font-semibold text-white">
                      {fmt(subscription.subscribedAt)}
                    </p>
                  </div>
                  {subscription?.subscriptionStatus !== "canceled" && (
                    <div className="p-4 rounded-lg bg-[#13131a]/60 border border-[#1e1e2e] space-y-1">
                      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3" /> Renews On
                      </p>
                      <p className="text-sm font-mono font-semibold text-[#00e5a0]">
                        {subscription.renewsAt ? fmt(subscription.renewsAt) : "—"}
                      </p>
                    </div>
                  )}
                  <div className="p-4 rounded-lg bg-[#13131a]/60 border border-[#1e1e2e] space-y-1">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="h-3 w-3" /> Cycle
                    </p>
                    <p className="text-sm font-mono font-semibold text-white">Monthly</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-zinc-400 text-xs py-2 bg-[#13131a]/30 border border-[#1e1e2e]/50 p-4 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-[#7c6df0] shrink-0" />
                  <span>You&apos;re currently on the free tier. Upgrade below to unlock custom domains, API key access, and advanced real-time analytics.</span>
                </div>
              )}

              {subscription && subscription?.subscriptionStatus !== "canceled" && (
                <div className="mt-6 pt-6 border-t border-[#1e1e2e] flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="h-9 px-4 rounded-lg bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white font-mono text-xs font-semibold cursor-pointer gap-2"
                  >
                    {portalLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Manage billing & invoices
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="h-9 px-4 rounded-lg bg-red-950/10 border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300 font-mono text-xs font-semibold cursor-pointer gap-2"
                  >
                    Cancel subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing/Plan Tiers Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00e5a0]">
              Available subscription tiers
            </span>
            <div className="flex-1 h-px bg-[#1e1e2e]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => {
              const current = isActive(plan.name);

              const accentColor =
                plan.name === "Free"
                  ? "#7c6df0"
                  : plan.name === "Base Plan"
                  ? "#00e5a0"
                  : "#febc2e";

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  className="group relative h-full flex flex-col"
                >
                  <Card
                    className={`relative flex flex-col w-full h-full transition-all duration-300 rounded-xl overflow-hidden bg-[#0d0d12] ${
                      current
                        ? "border-[#00e5a0] ring-1 ring-[#00e5a0]/30 shadow-lg shadow-[#00e5a0]/5"
                        : "border-[#1e1e2e] hover:border-[#1e1e2e]/80"
                    }`}
                  >
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

                    {/* Plan Badge if highlighted */}
                    {plan.badge && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[#00e5a0]/15 text-[#00e5a0] border-[#00e5a0]/25 rounded-md font-mono text-[9px] h-4.5 px-2 uppercase tracking-wide">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pt-6 pb-4 px-6 border-b border-[#1e1e2e]/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="p-2 rounded-lg border transition-colors duration-300 shrink-0"
                          style={{
                            background: "rgba(19, 19, 26, 0.6)",
                            borderColor: current ? "#00e5a0" : "#1e1e2e",
                            color: accentColor,
                          }}
                        >
                          {plan.icon}
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold text-white">{plan.name}</p>
                          <p className="text-[10px] text-zinc-500 font-light leading-relaxed">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold font-mono tracking-tight" style={{ color: accentColor }}>
                          {plan.price}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          {plan.period === "forever"
                            ? "/ forever"
                            : `/ ${plan.period}`}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 px-6 pt-5 pb-5 flex flex-col">
                      <ScrollArea className="h-44 pr-2">
                        <div className="space-y-3">
                          {plan.features.map((f) => (
                            <div key={f} className="flex items-start gap-2.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#00e5a0] shrink-0 mt-0.5" />
                              <span className="text-xs text-zinc-300 font-light">{f}</span>
                            </div>
                          ))}
                          {plan.missing.map((f) => (
                            <div key={f} className="flex items-start gap-2.5 opacity-30">
                              <XCircle className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-zinc-400 font-light">{f}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    <div className="px-6 pb-6 pt-2">
                      {isActive(plan.name) ? (
                        <Button
                          className="w-full h-10 text-xs bg-[#00e5a0]/5 text-[#00e5a0] border border-[#00e5a0]/20 rounded-lg font-mono font-semibold cursor-default hover:bg-[#00e5a0]/5"
                          disabled
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                          Active plan
                        </Button>
                      ) : plan.name === "Free" ? (
                        <Button
                          variant="outline"
                          disabled={!!subscription?.polarCustomerId}
                          className="w-full h-10 text-xs rounded-lg font-mono font-semibold bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          {subscription?.polarCustomerId
                            ? "Manage via portal"
                            : "Current"}
                        </Button>
                      ) : (
                        <Button
                          variant={plan.highlight ? "default" : "outline"}
                          onClick={() => handlePlanAction(plan)}
                          disabled={portalLoading}
                          className={`w-full h-10 text-xs rounded-lg font-mono font-semibold cursor-pointer gap-2 transition-all duration-300 ${
                            plan.highlight
                              ? "bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black border-0"
                              : "bg-white/5 border-[#1e1e2e] text-zinc-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {portalLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : subscription?.polarCustomerId ? (
                            <>
                              {subscription?.plan.toLowerCase() === plan.name.toLowerCase() ? "Manage plan" : `Switch to ${plan.name}`}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              Get {plan.name}
                              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── FAQ Accordion ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#1e1e2e]" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Frequently asked questions
            </span>
            <div className="flex-1 h-px bg-[#1e1e2e]" />
          </div>

          <Accordion type="single" collapsible className="space-y-2 border-none">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-[#1e1e2e] rounded-xl px-5 bg-[#0d0d12] data-[state=open]:border-[#00e5a0]/40 transition-colors"
              >
                <AccordionTrigger className="text-xs font-mono text-white py-4 hover:no-underline gap-3 [&>svg]:hidden items-center group">
                  <span className="font-mono text-[10px] text-zinc-500 min-w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-left font-semibold uppercase tracking-wider">{item.q}</span>
                  <div className="w-5 h-5 rounded-full border border-[#1e1e2e] group-hover:border-[#00e5a0]/50 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-zinc-500 group-data-[state=open]:text-[#00e5a0] text-xs leading-none transition-transform duration-200 group-data-[state=open]:rotate-45">+</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-zinc-400 font-light leading-relaxed pb-4 pl-8">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* ── Support footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center font-mono text-[10px] text-zinc-500 pb-6"
        >
          Questions about billing?{" "}
          <a
            href="mailto:support@yourapp.com"
            className="underline underline-offset-2 hover:text-white transition-colors"
          >
            Contact support
          </a>{" "}
          · Powered by{" "}
          <a
            href="https://polar.sh"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-[#00e5a0] transition-colors"
          >
            Polar
          </a>
        </motion.div>
      </div>
    </div>
  );
}

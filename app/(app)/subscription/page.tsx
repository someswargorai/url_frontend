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
    icon: <Zap className="h-6 w-6" />,
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
    icon: <Crown className="h-6 w-6" />,
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
    icon: <Sparkles className="h-6 w-6" />,
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

function statusColor(status: string) {
  if (status === "active")
    return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
  if (status === "canceled")
    return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
  return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800";
}

function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
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
      } catch(error){
        // no subscription yet — that's fine
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
    } catch(error) {
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

  // add this after openCheckout
  const handlePlanAction = async (plan: Plan) => {
    // has polarCustomerId = ever bought before → always use portal
    if (subscription?.polarCustomerId) {
      await openPortal();
      return;
    }
    // never bought → open checkout
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
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
     
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Billing & plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription, upgrades, and billing details.
        </p>
      </motion.div>

      {/* ── Current plan card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="border overflow-hidden">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Current plan</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Your active subscription details
                </CardDescription>
              </div>
              {subscription ? (
                <Badge
                  variant="outline"
                  className={`capitalize text-xs px-3 py-1 ${statusColor(
                    subscription.subscriptionStatus,
                  )}`}
                >
                  {subscription.subscriptionStatus}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs px-3 py-1">
                  Free
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-3">
            {subscription ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" /> Plan
                  </p>
                  <p className="font-semibold capitalize">
                    {subscription.plan}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Subscribed on
                  </p>
                  <p className="font-semibold">
                    {fmt(subscription.subscribedAt)}
                  </p> 
                </div>
                {subscription?.subscriptionStatus!=="canceled" && 
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Renews on
                  </p>
                  <p className="font-semibold">
                    {subscription.renewsAt ? fmt(subscription.renewsAt) : "—"}
                  </p>
                </div>}

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Billing
                  </p>
                  <p className="font-semibold">Monthly</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground text-sm py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                You&apos;re on the free plan. Upgrade below to unlock more
                features.
              </div>
            )}

            {subscription && subscription?.subscriptionStatus!=="canceled" && (
              <>
                <Separator className="my-6" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="gap-2 rounded-sm! cursor-pointer"
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
                    size="sm"
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="rounded-sm! gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900 cursor-pointer"
                  >
                    Cancel subscription
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Plan cards ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Available plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const current = isActive(plan.name);
            const isFree = plan.name === "Free";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              >
                <Card
                  className={`relative flex flex-col h-full transition-all duration-200 ${
                    current
                      ? "border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/40"
                      :  !hasActiveSub
                      ? "border-violet-400 dark:border-violet-600 ring-1 ring-violet-400/30"
                      : "border"
                  }`}
                >
                
                  <CardHeader className="pt-3 pb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          plan.name === "Free"
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            : plan.name === "Base"
                            ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <span className="size-2!">{plan.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.period === "forever"
                          ? "/ free forever"
                          : `/ ${plan.period}`}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-2.5 pb-5">
                    <ScrollArea className="h-40">
                        {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2 mt-2 first:mt-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs">{f}</span>
                        </div>
                        ))}
                        {plan.missing.map((f) => (
                        <div
                            key={f}
                            className="flex items-start gap-2 opacity-35 mt-2 first:mt-0"
                        >
                            <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="text-xs">{f}</span>
                        </div>
                        ))}
                    </ScrollArea>
                  </CardContent>

                  <div className="px-6 pb-6">
                    {isActive(plan.name) ? (
                      <Button
                        className="w-full h-10 text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 cursor-default"
                        disabled
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                        Active plan
                      </Button>
                    ) : plan.name === "Free" ? (
                      <Button
                        variant="outline"
                        className="w-full h-10 text-xs"
                        disabled={!!subscription?.polarCustomerId}
                      >
                        {subscription?.polarCustomerId
                          ? "Manage via portal"
                          : "Current"}
                      </Button>
                    ) : (
                      <Button
                        className={`w-full h-10 text-xs gap-2 group ${
                          plan.highlight
                            ? "bg-violet-600 hover:bg-violet-700 text-white"
                            : ""
                        }`}
                        variant={plan.highlight ? "default" : "outline"}
                        onClick={() => handlePlanAction(plan)}
                        disabled={portalLoading}
                      >
                        {portalLoading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : subscription?.polarCustomerId ? (
                          <>
                           {subscription?.plan.toLowerCase() === plan.name.toLowerCase() ? "Manage current plan" : `Switch to ${plan.name}`}
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

     

      {/* ── FAQ ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        >
        {/* section label with lines */}
        <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Frequently asked questions
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>

        <Accordion type="single" collapsible className="space-y-2 border-none">
            {FAQ.map((item, i) => (
            <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-xl px-5 bg-card data-[state=open]:border-border/80 transition-colors"
            >
                <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline gap-3 [&>svg]:hidden">
                <span className="text-[11px] font-semibold text-muted-foreground/50 min-w-[20px]">
                    {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-left">{item.q}</span>
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0">
                    <span className="text-muted-foreground text-xs leading-none transition-transform duration-200 group-data-[state=open]:rotate-45">+</span>
                </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pl-8">
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
        className="text-center text-xs text-muted-foreground pb-6"
      >
        Questions about billing?{" "}
        <a
          href="mailto:support@yourapp.com"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Contact support
        </a>{" "}
        · Powered by{" "}
        <a
          href="https://polar.sh"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Polar
        </a>
      </motion.div>
    </div>
  );
}

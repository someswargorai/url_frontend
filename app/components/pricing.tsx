"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Zap, Crown, Sparkles, BadgeCheck } from "lucide-react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const plans = [
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
    features: ["10 short links", "Basic analytics", "QR code generator"],
    missing: ["Custom domains", "Priority support", "Campaign tracking"],
  },
  {
    name: "Base Plan",
    price: "₹95",
    period: "month",
    description: "For individuals who need more",
    icon: <Crown className="h-6 w-6" />,
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "Most popular",
    featured: true,
    checkoutLink: process.env.NEXT_PUBLIC_POLAR_BASE_CHECKOUT_LINK,
    cta: "Get Base plan",
    features: [
      "Unlimited short links",
      "Full analytics dashboard",
      "QR code generator",
      "Custom branded codes",
      "Priority support",
    ],
    missing: ["Campaign tracking"],
  },
  {
    name: "Pro Plan",
    price: "₹300",
    period: "month",
    description: "For teams and power users",
    icon: <Sparkles className="h-6 w-6" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: null,
    featured: false,
    checkoutLink: process.env.NEXT_PUBLIC_POLAR_PRO_CHECKOUT_LINK,
    cta: "Get Pro plan",
    features: [
      "Everything in Base",
      "Custom domains",
      "Campaign tracking",
      "Team access",
      "API access",
      "Dedicated support",
    ],
    missing: [],
  },
];

type Subscription = {
  _id: string;
  email: string;
  __v: number;
  createdAt: string;
  plan: string;
  polarCustomerId: string;
  renewsAt: string;
  subscribedAt: string;
  subscriptionId: string;
  subscriptionStatus: string;
  updatedAt: string;
  userId: string;
};

export function PricingSection() {
  const { theme } = useTheme();
  const { status, data: session } = useSession();
  const router = useRouter();
  const [activePlan, setActivePlan] = useState<Subscription>();

  useEffect(() => {
    const fetchSubscriptionPlan = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription/get-active-subscription`,
          { headers: { Authorization: `Bearer ${session?.access_token}` } }
        );
        if (response?.data?.success) {
          setActivePlan(response.data.plan);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (session?.access_token) fetchSubscriptionPlan();
  }, [session?.access_token]);

  const isCurrentPlan = (planName: string) => {
    return (
      (activePlan?.plan?.toLowerCase() === planName.toLowerCase() &&
      activePlan?.subscriptionStatus === "active") 
    );
  };

  const getButtonLabel = (plan: (typeof plans)[0]) => {
    if (status !== "authenticated") return plan.cta;
    if (isCurrentPlan(plan.name)) return "Current plan";
    if (activePlan?.subscriptionStatus === "active") return `Switch to ${plan.name}`;
    if(plan.name === "Free" && activePlan === null) return "Current Plan"
    return plan.cta;
  };

  const handleClick = async (plan: (typeof plans)[0]) => {
  if (status !== "authenticated") {
    router.push("/login");
    return;
  }

  // already has active subscription → open portal to upgrade/cancel
  if (activePlan?.subscriptionStatus === "active") {
    await openCustomerPortal();
    return;
  }

  // no subscription yet → open checkout
  if (!plan.checkoutLink) return;
  const themeColor = theme === "light" ? "light" : "dark";
  try {
    const checkout = await PolarEmbedCheckout.create(plan.checkoutLink, {
      theme: themeColor,
    });
    return checkout;
  } catch (error) {
    console.error("Failed to open checkout", error);
  }
};

  const openCustomerPortal = async () => {
  if (!activePlan?.polarCustomerId) return;

  try {
    // 1. call your backend to get a customer portal session URL
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription/customer-portal`,
      {},
      { headers: { Authorization: `Bearer ${session?.access_token}` } }
    );

    const { url } = response.data;

    // 2. open the portal URL in a new tab
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to open customer portal", error);
  }
};


  return (
    <section id="pricing" className="py-24 relative">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg">
              Start free. Upgrade when you need more. Cancel anytime.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => {
            const current = isCurrentPlan(plan.name);
            const label = getButtonLabel(plan);

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative flex flex-col overflow-hidden h-full",
                    plan.featured
                      ? "border-violet-500 border-2 shadow-xl shadow-violet-500/10"
                      : "border shadow-sm",
                    current && "ring-2 ring-green-500 border-green-500"
                  )}
                >
                  {/* current plan banner */}
                  {current && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                      <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-1 rounded-b-lg flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Current plan
                      </span>
                    </div>
                  )}

                  {/* most popular banner */}
                  {plan.badge && !current && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                      <span className="bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-1 rounded-b-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className={cn("pt-8 pb-4", (plan.badge || current) && "pt-10")}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("p-2 rounded-xl", plan.iconBg)}>
                        <span className={plan.iconColor}>{plan.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">
                        {plan.period === "forever" ? "free forever" : `/ ${plan.period}`}
                      </span>
                    </div>

                    {/* renews at info */}
                    {current && activePlan?.renewsAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Renews on{" "}
                        {new Date(activePlan.renewsAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 px-6 pb-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.missing.map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5 opacity-40">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className="px-6 pb-6">
                    <Button
                      className={cn(
                        "w-full h-11 font-semibold group",
                        plan.featured && !current
                          ? "bg-violet-600 hover:bg-violet-700 text-white"
                          : "",
                        current
                          ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                          : ""
                      )}
                      disabled={current || (plan.name === "Free" && activePlan === null)}
                      variant={plan.featured && !current ? "default" : "outline"}
                      onClick={() => handleClick(plan)}
                    >
                      {label}
                      {!current && (
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include SSL, uptime monitoring, and 99.9% availability. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
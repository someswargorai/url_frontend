"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Link2,
  Shield,
  Fingerprint,
  MousePointer2,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Custom Shortcodes",
    description:
      "Create branded links like shorty.com/my-awesome-link instead of random strings.",
    icon: <Fingerprint className="h-6 w-6" />,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Lightning Redirects",
    description:
      "Built on a global edge network to ensure your users never wait for a page to load.",
    icon: <Zap className="h-6 w-6" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Secure by Design",
    description:
      "Automatic HTTPS, malware scanning, and anti-phishing protection for every link.",
    icon: <Shield className="h-6 w-6" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Smart Targeting",
    description:
      "Route users to different destinations based on their device or geographic location.",
    icon: <MousePointer2 className="h-6 w-6" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Bulk Management",
    description:
      "Shorten hundreds of links at once through our intuitive dashboard or developer API.",
    icon: <Link2 className="h-6 w-6" />,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "AI Enhancements",
    description:
      "Our AI suggests the best shortcode names based on your original URL content.",
    icon: <Sparkles className="h-6 w-6" />,
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
  },
];

export function FeaturesSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-10 px-2 md:px-10">
      {features.map((feature, index) => (
        <motion.div
         key={index}
        initial={{ y: 200, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        >
          <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-primary/5">
            <CardContent className="p-8">
              {/* Icon Container */}
              <div
                className={cn(
                  "mb-6 inline-flex rounded-2xl p-3 transition-all duration-300 group-hover:scale-110",
                  feature.bgColor,
                  feature.color
                )}
              >
                {feature.icon}
              </div>

              <h3 className="mb-3 text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
                {feature.title}
              </h3>

              <p className="leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Glow */}
              <div
                className={cn(
                  "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-20",
                  feature.bgColor
                )}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
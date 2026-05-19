"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MousePointer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  ChevronRight,
  MapPin,
  Smartphone,
  Monitor,
  Bell,
  Clock,
  Target,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// --- INTERFACES ---
interface EventLog {
  _id: string;
  eventName: string;
  userId?: string;
  anonymousId?: string;
  device?: {
    deviceType?: string;
    os?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
  metadata?: Record<string, string>;
  timestamp?: string;
  source?: {
    referrer?: string;
  };
}

interface ProjectAnalytics {
  totalEvents: number;
  topEvents: { count: number; _id: string }[];
  countries: { count: number; _id: string }[];
  cities: { count: number; _id: string }[];
  os: { count: number; _id: string }[];
  devices: { count: number; _id: string }[];
  activeUsers?: number;
  todayActiveUsers?: number;
  activeUsersGrowth?: number;
  activePaths?: { path: string; count: number }[];
  engagementMetrics?: { engagementRate: string; avgDepth: string };
  todayEvents?: number;
  eventGrowth?: number;
  revenueData?: {
    totalRevenue: number;
    campaignAttribution: {
      source: string;
      count: number;
      revenue: string;
      conversion: string;
    }[];
  };
  funnelAnalysis?: {
    name: string;
    count: number;
    todayCount?: number;
    growth?: number;
    conversionFromPrevious: string;
  }[];
}

interface UserJourney {
  userId: string;
  deviceType: string;
  os: string;
  country: string;
  city: string;
  events: EventLog[];
  rageClicks: number;
  lastActive: string;
  sessionDurationMs: number;
}

interface InsightsProps {
  analytics: ProjectAnalytics | null;
  logs: EventLog[];
  userJourneys?: UserJourney[];
  userJourneysLoading?: boolean;
  hasMoreJourneys?: boolean;
  loadingMoreJourneys?: boolean;
  onLoadMoreJourneys?: () => void;
}

export default function InsightsAnalytics({
  analytics,
  logs,
  userJourneys = [],
  userJourneysLoading = false,
  hasMoreJourneys = false,
  loadingMoreJourneys = false,
  onLoadMoreJourneys,
}: InsightsProps) {
  // --- STATE ---
  const [activeSection, setActiveSection] = useState<
    "funnels" | "session_replay" | "revenue" | "developer" | "ai_insights"
  >("funnels");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // --- 1. DYNAMIC REAL-TIME VISITORS ---
  const dynamicActiveUsers = analytics?.activeUsers || 0;

  // Active pages/events distribution from API
  const dynamicActivePaths = analytics?.activePaths || [];

  // --- 2. DYNAMIC FUNNEL BUILDING ---
  const funnelAnalysis = useMemo(() => analytics?.funnelAnalysis || [], [
    analytics?.funnelAnalysis,
  ]);

  const overallConversion = useMemo(() => {
    if (funnelAnalysis.length < 2) return "0.0%";
    const firstCount = funnelAnalysis[0].count;
    const lastCount = funnelAnalysis[funnelAnalysis.length - 1].count;
    return firstCount > 0
      ? ((lastCount / firstCount) * 100).toFixed(1) + "%"
      : "0.0%";
  }, [funnelAnalysis]);

  const biggestDropStep = useMemo(() => {
    if (funnelAnalysis.length < 2) return "N/A";
    let maxDrop = -1;
    let stepName = "";
    for (let i = 0; i < funnelAnalysis.length - 1; i++) {
      const drop = funnelAnalysis[i].count - funnelAnalysis[i + 1].count;
      if (drop > maxDrop) {
        maxDrop = drop;
        stepName = `'${funnelAnalysis[i].name}' ➔ '${
          funnelAnalysis[i + 1].name
        }'`;
      }
    }
    return stepName;
  }, [funnelAnalysis]);

  // --- 4. DYNAMIC UTM & REVENUE ATTRIBUTION ---
  const dynamicRevenueData = analytics?.revenueData || {
    totalRevenue: 0,
    campaignAttribution: [],
  };

  // --- 5. DYNAMIC EXPERIENCE & ENGAGEMENT METRICS ---
  const dynamicEngagementMetrics = analytics?.engagementMetrics || {
    engagementRate: "0%",
    avgDepth: "0.0",
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Real-Time Active Users & Live Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Pulse Card */}
        <Card className="rounded-md border-border/50 relative backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Visitors
              </span>
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground font-mono pt-1">
              {dynamicActiveUsers}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-sans ">
              <span className="font-semibold text-foreground">
                Today: {analytics?.todayActiveUsers || 0}
              </span>
              {analytics?.activeUsersGrowth !== undefined && (
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  analytics.activeUsersGrowth >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {analytics.activeUsersGrowth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {analytics.activeUsersGrowth >= 0 ? "+" : ""}{analytics.activeUsersGrowth}% from yesterday
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2 mt-2 overflow-auto  h-16.25">
              {dynamicActivePaths.length > 0 ? (
                dynamicActivePaths.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs "
                  >
                    <span className="text-muted-foreground truncate max-w-[180px]">
                      {item.path}
                    </span>
                    <span className="font-semibold text-foreground font-mono">
                      {item.count} hit(s)
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground py-2 italic">
                  Waiting for events...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Smart Comparison 1: Total Events Growth */}
        <Card className="rounded-md border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              Project Load telemetry
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-foreground font-mono pt-1">
              {analytics?.totalEvents || 0}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-sans">
              <span className="font-semibold text-foreground">
                Today: {analytics?.todayEvents || 0}
              </span>
              {analytics?.eventGrowth !== undefined && (
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  analytics.eventGrowth >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {analytics.eventGrowth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {analytics.eventGrowth >= 0 ? "+" : ""}{analytics.eventGrowth}% from yesterday
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 text-xs text-muted-foreground mt-1">
            Total aggregated user interaction points logged in this project
            dashboard database dynamically.
          </CardContent>
        </Card>

        {/* Smart Comparison 2: Device Analytics */}
        <Card className="rounded-md border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              User Engagement Diagnostics
            </CardDescription>
            <CardTitle className="text-2xl font-bold flex items-baseline gap-2 font-mono">
              {dynamicEngagementMetrics.engagementRate}
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 font-sans">
                Multi-Event Sessions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 text-xs text-muted-foreground">
            Calculated in real-time from the full database. Average interactions
            optimized at{" "}
            <span className="text-foreground font-semibold">
              {dynamicEngagementMetrics.avgDepth} events
            </span>{" "}
            per unique session.
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border/50 pb-px overflow-x-auto scrollbar-none flex-nowrap -mx-4 px-4 md:-mx-0 md:px-0">
        <Button
          variant="ghost"
          onClick={() => setActiveSection("funnels")}
          className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all flex-shrink-0 ${
            activeSection === "funnels"
              ? " text-emerald-400 bg-emerald-500/[0.03]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="w-4 h-4" />
          Dynamic Funnels
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("session_replay")}
          className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all flex-shrink-0 ${
            activeSection === "session_replay"
              ? " text-emerald-400 bg-emerald-500/[0.03]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MousePointer className="w-4 h-4" />
          Timeline
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("revenue")}
          className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all flex-shrink-0 ${
            activeSection === "revenue"
              ? " text-emerald-400 bg-emerald-200/[0.03]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Referrer Attribution
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveSection("ai_insights")}
          className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all flex-shrink-0 ${
            activeSection === "ai_insights"
              ? " text-emerald-400 bg-emerald-500/[0.03]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="w-4 h-4" />
          Smart Recommendations
        </Button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* --- FUNNELS TAB (DYNAMIC) --- */}
        {activeSection === "funnels" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Interactive Funnel Steps */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-md border-border/50 bg-card/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Event Pipeline Funnel
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Dynamic acquisition flow computed from your project’s
                        top events
                      </CardDescription>
                    </div>
                    {funnelAnalysis.length >= 2 && (
                      <Badge variant="outline" className=" font-mono">
                        Conversion Ratio: {overallConversion}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {funnelAnalysis.length > 0 ? (
                    <div className="flex flex-col items-center max-w-lg mx-auto py-4 h-[300px] overflow-y-auto">
                      {funnelAnalysis.map((step, idx) => (
                        <div key={step.name} className="flex flex-col w-full">
                          {/* The Step Box */}
                          <div className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50 shadow-sm backdrop-blur-sm relative z-10 transition-transform hover:scale-[1.01]">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs  font-semibold shadow-inner">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-foreground text-sm tracking-wide">
                                {step.name}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs font-bold font-mono text-foreground bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 text-emerald-400">
                                {step.count.toLocaleString()}{" "}
                                <span className="text-[9px] font-sans text-muted-foreground ml-0.5 uppercase tracking-wider">
                                  total
                                </span>
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span>Today: {step.todayCount || 0}</span>
                                {step.growth !== undefined && (
                                  <span className={`font-semibold flex items-center gap-0.5 ${
                                    step.growth >= 0 ? "text-emerald-400" : "text-rose-400"
                                  }`}>
                                    {step.growth >= 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    {step.growth >= 0 ? "+" : ""}{step.growth}% from yesterday
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* The Drop-off Connector */}
                          {idx < funnelAnalysis.length - 1 && (
                            <div className="flex flex-col items-center justify-center -my-1 relative z-0">
                              <div className="w-px h-8 bg-border/80"></div>
                              <Badge
                                variant="outline"
                                className="bg-card text-[11px] text-muted-foreground border-border/60 py-1.5 px-3 z-10 shadow-sm flex items-center gap-1.5 font-medium tracking-wide"
                              >
                                <span className="text-emerald-500 text-sm">
                                  ↓
                                </span>
                                {funnelAnalysis[idx + 1].conversionFromPrevious}{" "}
                                conversion
                              </Badge>
                              <div className="w-px h-8 bg-border/80"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-xs gap-3">
                      <Target className="w-8 h-8 opacity-40 text-emerald-500" />
                      <span>
                        No events recorded yet to build conversion pipelines.
                      </span>
                      <p className="max-w-md text-[10px] opacity-70 leading-relaxed bg-zinc-300/40 p-3 border border-border/30 rounded">
                        To build custom funnels automatically, send different
                        sequential events using the SDK, for example:
                        <br />
                        <code className="text-emerald-400 block pt-1">
                          trackEvent(&quot;YOUR_API_KEY&quot;,
                          &quot;homepage_view&quot;)
                        </code>
                        <code className="text-emerald-400 block">
                          trackEvent(&quot;YOUR_API_KEY&quot;,
                          &quot;signup_completed&quot;)
                        </code>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Funnel Diagnostics Sidebar */}
            <div className="space-y-6">
              <Card className="rounded-md border-border/50 bg-card/30 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-emerald-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Funnel Bottlenecks
                </h4>
                <div className="space-y-4 text-xs text-muted-foreground">
                  <div className="p-3 border border-border/30 rounded space-y-2">
                    <p className="font-semibold text-foreground">
                      Highest Conversion Drop
                    </p>
                    {funnelAnalysis.length >= 2 ? (
                      <>
                        <p className="text-emerald-400 font-medium font-mono text-[11px]">
                          {biggestDropStep}
                        </p>
                        <p className="text-[10px] opacity-75">
                          This specific conversion boundary represents the
                          largest numeric loss in user flow throughout your
                          custom events list.
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground italic text-[11px]">
                        Insufficient sequential events to calculate bottlenecks.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- SESSION REPLAY LITE & TIMELINES TAB (DYNAMIC) --- */}
        {activeSection === "session_replay" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stacked User Journeys */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Grouped User Journey Timelines
                </h3>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground text-[10px]"
                >
                  Showing total pathways for {userJourneys.length} session(s)
                </Badge>
              </div>

              {userJourneys.length > 0 ? (
                <div className="space-y-4">
                  {userJourneys.map((journey) => {
                    const userKey = journey.userId;
                    const userLogs = journey.events;

                    // Find device and location from the first available log
                    const sampleLog = userLogs[0] || {};
                    const deviceType =
                      sampleLog.device?.deviceType ||
                      journey.deviceType ||
                      "Desktop";
                    const os =
                      sampleLog.device?.os || journey.os || "Unknown OS";
                    const country =
                      sampleLog.location?.country ||
                      journey.country ||
                      "Direct";
                    const city = sampleLog.location?.city || journey.city;

                    const rageClicksCount = journey.rageClicks || 0;
                    const hasUserRage = rageClicksCount > 0;

                    return (
                      <Card
                        key={userKey}
                        className="rounded-md border-border/50 bg-card/30 overflow-hidden relative"
                      >
                        {/* Top User Metadata Bar */}
                        <div className="p-4 bg-muted/20 border-b border-border/20 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 text-sm">
                              👤
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground font-mono truncate max-w-[200px] md:max-w-xs">
                                  {userKey}
                                </span>
                                {hasUserRage && (
                                  <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-[9px] font-semibold animate-pulse">
                                    ⚠️ RAGE DETECTED{" "}
                                    {rageClicksCount > 1
                                      ? `(${rageClicksCount})`
                                      : ""}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  {deviceType === "mobile" ? (
                                    <Smartphone className="w-3 h-3" />
                                  ) : (
                                    <Monitor className="w-3 h-3" />
                                  )}
                                  {os}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-emerald-400" />
                                  {city && city !== "Unknown"
                                    ? `${city}, ${country}`
                                    : country}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className="border-border text-muted-foreground font-mono text-[10px]"
                          >
                            {userLogs.length} event(s) in journey
                          </Badge>
                        </div>

                        {/* visual horizontal flowchart representation */}
                        <div className="p-4 overflow-x-auto w-full">
                          <div className="flex items-center gap-2 min-w-max py-2">
                            {userLogs.map((evt, idx) => {
                              const stepId = `${userKey}-${idx}`;
                              const isStepRage =
                                idx < userLogs.length - 2 &&
                                evt.eventName === userLogs[idx + 1].eventName &&
                                evt.eventName === userLogs[idx + 2].eventName;

                              const isConversion =
                                evt.eventName
                                  .toLowerCase()
                                  .includes("purchase") ||
                                evt.eventName
                                  .toLowerCase()
                                  .includes("signup") ||
                                evt.eventName.toLowerCase().includes("success");

                              return (
                                <React.Fragment key={evt._id}>
                                  {idx > 0 && (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                                  )}

                                  <button
                                    onClick={() =>
                                      setExpandedStep(
                                        expandedStep === stepId ? null : stepId,
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded border text-[10px] font-semibold tracking-wide transition-all uppercase flex-shrink-0 flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                                      expandedStep === stepId
                                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md font-bold"
                                        : isStepRage
                                        ? "bg-transparent text-rose-400 border-rose-500/20"
                                        : isConversion
                                        ? "bg-transparent text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                                        : "bg-transparent text-zinc-800 border-border/60 hover:text-foreground  hover:border-border"
                                    }`}
                                  >
                                    {isStepRage && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                                    )}
                                    {evt.eventName}
                                    <span className="text-[8px] opacity-60 font-mono">
                                      (
                                      {evt.timestamp
                                        ? new Date(
                                            evt.timestamp,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "-"}
                                      )
                                    </span>
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expandable Step Inspector Drawer */}
                        {expandedStep &&
                          expandedStep.startsWith(`${userKey}-`) &&
                          (() => {
                            const idx = parseInt(
                              expandedStep.split("-")[1],
                              10,
                            );
                            const stepLog = userLogs[idx];
                            if (!stepLog) return null;

                            return (
                              <div className="p-4 border-t border-border/20 space-y-3 animate-slideDown">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    Step {idx + 1} Payload Inspector
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    Time:{" "}
                                    {stepLog.timestamp
                                      ? new Date(
                                          stepLog.timestamp,
                                        ).toLocaleString()
                                      : "-"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="md:col-span-2 space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                      Metadata Parameters
                                    </p>
                                    <pre className="text-[10px] font-mono p-3 bg-zinc-950 rounded border border-border/30 text-zinc-300 overflow-x-auto">
                                      {JSON.stringify(
                                        stepLog.metadata || {},
                                        null,
                                        2,
                                      )}
                                    </pre>
                                  </div>
                                  <div className="space-y-2 text-[10px] text-muted-foreground">
                                    <div>
                                      <span className="font-semibold text-foreground">
                                        Event Key:
                                      </span>
                                      <p className="font-mono text-emerald-400 pt-0.5">
                                        {stepLog.eventName}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-foreground">
                                        Unique Log ID:
                                      </span>
                                      <p className="font-mono pt-0.5">
                                        {stepLog._id}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedStep(null)}
                                      className="h-7 text-[10px] text-muted-foreground hover:text-foreground mt-2 cursor-pointer border border-border/60 rounded"
                                    >
                                      Minimize Inspector
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                      </Card>
                    );
                  })}

                  {/* Load More Button */}
                  {hasMoreJourneys && (
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={onLoadMoreJourneys}
                        disabled={loadingMoreJourneys}
                        variant="outline"
                        size="sm"
                        className="gap-2 cursor-pointer border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-sm font-semibold text-xs py-2 px-4 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all duration-300"
                      >
                        {loadingMoreJourneys ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            Loading More...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Load More Journeys
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-xs p-4 bg-card/10 rounded border border-dashed border-border/50">
                  <MousePointer className="w-8 h-8 opacity-40 text-emerald-500 mb-2" />
                  <span>
                    No active user logs detected to trace user journeys.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- CAMPAIGN & UTM TAB (DYNAMIC) --- */}
        {activeSection === "revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Campaigns Table */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-md border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Referrer Shares
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Dynamic event counts split by organic referrers
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {dynamicRevenueData.campaignAttribution.length > 0 ? (
                    <ScrollArea className="w-full">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                            <th className="py-2.5">Campaign Source</th>
                            <th className="py-2.5">Dynamic Hits</th>
                            <th className="py-2.5">Attributed Revenue</th>
                            <th className="py-2.5">Traffic Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 font-medium">
                          {dynamicRevenueData.campaignAttribution.map((cam) => (
                            <tr
                              key={cam.source}
                              className="hover:bg-zinc-800/10"
                            >
                              <td className="py-3 text-foreground font-semibold flex items-center gap-2">
                                <Target className="w-3.5 h-3.5 text-emerald-400" />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="truncate max-w-[120px]">
                                        {cam.source}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{cam.source}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="py-3 font-mono font-semibold text-foreground">
                                {cam.count}
                              </td>
                              <td className="py-3 font-mono font-semibold text-emerald-400">
                                {cam.revenue}
                              </td>
                              <td className="py-3 font-mono text-muted-foreground">
                                {cam.conversion}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  ) : (
                    <div className="text-xs text-muted-foreground py-8 italic text-center">
                      No referrals loaded.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Attribution Guide */}
            <div className="space-y-6">
              <Card className="rounded-md border-border/50 bg-card/30 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  How to Track Campaigns
                </h4>
                <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    To enable fully dynamic campaigns or financial tracking in
                    this tab, pass custom campaign or payment parameters within
                    the metadata object:
                  </p>
                  <pre className="text-[10px] font-mono p-3 bg-zinc-950 rounded border border-border/40 text-emerald-400 overflow-x-auto">
                    {`await trackEvent("KEY", {
  event: "checkout",
  metadata: {
    utm_source: "google_ads",
    amount: 49 // tracks revenue
  }
})`}
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- SMART RECOMMENDATIONS TAB (DYNAMIC) --- */}
        {activeSection === "ai_insights" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Recommendations List */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="rounded-md border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Algorithmic Audits & Alerts
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Custom logic recommendations deduced from dynamic database
                    telemetry
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {analytics?.topEvents && analytics.topEvents.length > 0 ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-md flex items-start gap-3">
                        <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            Optimize Around Primary Action
                          </p>
                          <p className="text-[10px] text-muted-foreground pt-0.5">
                            Your primary event is{" "}
                            <span className="text-emerald-400 font-semibold font-mono">
                              &apos;{analytics.topEvents[0]?._id}&apos;
                            </span>
                            . It represents{" "}
                            {(
                              (analytics.topEvents[0]?.count /
                                analytics.totalEvents) *
                              100
                            ).toFixed(0)}
                            % of your overall project activity load.
                          </p>
                        </div>
                      </div>

                      {analytics.countries && analytics.countries.length > 0 && (
                        <div className="p-3 border border-border/30 rounded-md flex items-start gap-3 ">
                          <div className="p-1 rounded bg-zinc-800 text-emerald-400">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Target Regional Traffic
                            </p>
                            <p className="text-[10px] text-muted-foreground pt-0.5">
                              Your largest traffic regional segment is{" "}
                              <span className="text-emerald-400 font-semibold">
                                &apos;{analytics.cities[0]?._id}, {analytics.countries[0]?._id}&apos;
                              </span>
                              . Consider localizing onboarding documentation or
                              landing pages specifically for this market to
                              improve conversions.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground py-8 italic text-center">
                      Insufficient data to deduce custom audits.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
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
  ChevronDown,
  ChartArea,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RevenueAnalytics } from "./RevenueAnalytics";
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

export interface ProjectAnalytics {
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
  activeUsersTimelineDay?: { date: string; count: number }[];
  activeUsersTimelineWeek?: { date: string; count: number }[];
  activeUsersTimelineMonth?: { date: string; count: number }[];
  activeUsersTimelineYear?: { date: string; count: number }[];
  revenueTimelineDay?: { date: string; profit: number }[];
  revenueTimelineWeek?: { date: string; profit: number }[];
  revenueTimelineMonth?: { date: string; profit: number }[];
  revenueTimelineYear?: { date: string; profit: number }[];
  retentionData?: {
    todaysCount: number;
    yesterdayCount: number;
    sevenDayCount: number;
    thirtyDayCount: number;
    oneDayRetentionCount: number;
    oneDayRetentionRate: number;
    sevenDayRetentionCount: number;
    sevenDayRetentionRate: number;
    thirtyDayRetentionCount: number;
    thirtyDayRetentionRate: number;
  };
  peakTrafficOnDateAndHour:{
    _id: string;
    peakTraffic: number;
    peakHour: number;
  }[]
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

function TerminalBar({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 shrink-0 mr-1">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {right}
    </div>
  );
}

function InsightPanel({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`rounded-xl border-[#1e1e2e] bg-[#0d0d12] overflow-hidden ${className}`}>
      <TerminalBar label={label} />
      {children}
    </Card>
  );
}

export default function InsightsAnalytics({
  analytics,
  userJourneys = [],
  hasMoreJourneys = false,
  loadingMoreJourneys = false,
  onLoadMoreJourneys,
}: InsightsProps) {

  const [activeSection, setActiveSection] = useState<
    "funnels" | "session_replay" | "revenue" | "developer" | "ai_insights" | "engagement_analytics" | "active_users"
  >("funnels");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "year">("day");

  const activeUsersData = useMemo(() => {
    switch (timeframe) {
      case "day":
        return analytics?.activeUsersTimelineDay || [];
      case "week":
        return analytics?.activeUsersTimelineWeek || [];
      case "month":
        return analytics?.activeUsersTimelineMonth || [];
      case "year":
        return analytics?.activeUsersTimelineYear || [];
      default:
        return [];
    }
  }, [analytics, timeframe]);

  const formatDate = (dateStr: string, currentFrame: "day" | "week" | "month" | "year") => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    switch (currentFrame) {
      case "day":
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      case "week":
        return "Wk " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      case "month":
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      case "year":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

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
        <Card className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0 mr-1">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                system · active visitors
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00e5a0]"></span>
              </span>
              <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>
          <CardHeader className="pb-2 pt-4 px-6">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-light">Real-Time Visitors</span>
            <CardTitle className="text-3xl font-bold font-mono pt-1" style={{ color: "#00e5a0" }}>
              {dynamicActiveUsers}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 font-mono">
              <span className="font-semibold text-zinc-400">
                TODAY: {analytics?.todayActiveUsers || 0}
              </span>
              {analytics?.activeUsersGrowth !== undefined && (
                <span className={`font-semibold flex items-center gap-0.5 ${
                  analytics.activeUsersGrowth >= 0 ? "text-[#00e5a0]" : "text-rose-400"
                }`}>
                  {analytics.activeUsersGrowth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {analytics.activeUsersGrowth >= 0 ? "+" : ""}{analytics.activeUsersGrowth}%
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-6">
            <div className="space-y-2 mt-2 overflow-auto h-[70px]">
              {dynamicActivePaths.length > 0 ? (
                dynamicActivePaths.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-zinc-500 truncate max-w-[180px] font-light">
                      {item.path}
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {item.count} hits
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] font-mono text-zinc-600 py-2 italic font-light">
                  Waiting for events...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Smart Comparison 1: Total Events Growth */}
        <Card className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0 mr-1">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                system · telemetry
              </span>
            </div>
          </div>
          <CardHeader className="pb-2 pt-4 px-6">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-light">Total Events Ingested</span>
            <CardTitle className="text-3xl font-bold font-mono pt-1 text-white">
              {analytics?.totalEvents || 0}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 font-mono">
              <span className="font-semibold text-zinc-400">
                TODAY: {analytics?.todayEvents || 0}
              </span>
              {analytics?.eventGrowth !== undefined && (
                <span className={`font-semibold flex items-center gap-0.5 ${
                  analytics.eventGrowth >= 0 ? "text-[#00e5a0]" : "text-rose-400"
                }`}>
                  {analytics.eventGrowth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {analytics.eventGrowth >= 0 ? "+" : ""}{analytics.eventGrowth}%
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-6 text-[10px] text-zinc-500 font-mono leading-relaxed mt-1 font-light">
            Aggregated user interaction pathways logged in this project dashboard dynamically in real-time.
          </CardContent>
        </Card>

        {/* Smart Comparison 2: Device Analytics */}
        <Card className="rounded-xl border-[#1e1e2e] overflow-hidden bg-[#0d0d12]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] bg-[#13131a]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0 mr-1">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="h-4 w-px bg-[#1e1e2e] mx-1" />
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                system · diagnostics
              </span>
            </div>
          </div>
          <CardHeader className="pb-2 pt-4 px-6">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-light">Engagement Rate</span>
            <CardTitle className="text-2xl font-bold font-mono text-white flex items-baseline gap-2 pt-1">
              {dynamicEngagementMetrics.engagementRate}
              <span className="text-[#00e5a0] text-[9px] font-mono uppercase tracking-wider ml-1">
                Multi-Event Sessions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 px-6 text-[10px] text-zinc-500 font-mono leading-relaxed font-light">
            Calculated dynamically from live logs. Average user interaction depth optimized at <span className="text-white font-semibold">{dynamicEngagementMetrics.avgDepth} events</span> per unique session.
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-[#0d0d12] border border-[#1e1e2e] p-1.5 rounded-xl w-full flex overflow-x-auto scrollbar-none flex-no-wrap justify-start h-14 gap-2">
        <Button
          variant="ghost"
          onClick={() => setActiveSection("funnels")}
          className={`h-full px-4 rounded-lg font-mono text-xs uppercase transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === "funnels"
              ? "bg-[#13131a] text-[#00e5a0] border border-[#1e1e2e]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Dynamic Funnels
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("session_replay")}
          className={`h-full px-4 rounded-lg font-mono text-xs uppercase transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === "session_replay"
              ? "bg-[#13131a] text-[#00e5a0] border border-[#1e1e2e]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          Timeline
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("revenue")}
          className={`h-full px-4 rounded-lg font-mono text-xs uppercase transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === "revenue"
              ? "bg-[#13131a] text-[#00e5a0] border border-[#1e1e2e]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Revenue
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("ai_insights")}
          className={`h-full px-4 rounded-lg font-mono text-xs uppercase transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === "ai_insights"
              ? "bg-[#13131a] text-[#00e5a0] border border-[#1e1e2e]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Recommendations
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("engagement_analytics")}
          className={`h-full px-4 rounded-lg font-mono text-xs uppercase transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === "engagement_analytics"
              ? "bg-[#13131a] text-[#00e5a0] border border-[#1e1e2e]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ChartArea className="w-3.5 h-3.5" />
          Engagement
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveSection("active_users")}
          className={`h-full px-4 rounded-lg font-mono text-xs uppercase transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === "active_users"
              ? "bg-[#13131a] text-[#00e5a0] border border-[#1e1e2e]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Active Users
        </Button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* --- FUNNELS TAB (DYNAMIC) --- */}
        {activeSection === "funnels" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Interactive Funnel Steps */}
            <div className="lg:col-span-2 space-y-6">
              <InsightPanel label="funnels - event pipeline">
                <CardHeader className="px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">
                        Event Pipeline Funnel
                      </CardTitle>
                      <CardDescription className="text-zinc-500 text-xs font-light">
                        Dynamic acquisition flow computed from your project’s
                        top events
                      </CardDescription>
                    </div>
                    {funnelAnalysis.length >= 2 && (
                      <Badge variant="outline" className="border-[#00e5a0]/30 bg-[#00e5a0]/10 text-[#00e5a0] font-mono text-[10px]">
                        Conversion Ratio: {overallConversion}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                  {funnelAnalysis.length > 0 ? (
                    <div className="flex flex-col items-center max-w-lg mx-auto py-4 h-[300px] overflow-y-auto">
                      {funnelAnalysis.map((step, idx) => (
                        <div key={step.name} className="flex flex-col w-full">
                          {/* The Step Box */}
                          <div className="w-full flex items-center justify-between p-4 rounded-lg bg-[#13131a] border border-[#1e1e2e] shadow-sm backdrop-blur-sm relative z-10 transition-transform hover:scale-[1.01]">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20 flex items-center justify-center font-mono text-xs font-semibold shadow-inner">
                                {idx + 1}
                              </span>
                              <span className="font-mono font-semibold text-zinc-200 text-sm tracking-wide">
                                {step.name}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs font-bold font-mono bg-[#00e5a0]/10 px-2.5 py-1 rounded border border-[#00e5a0]/20 text-[#00e5a0]">
                                {step.count.toLocaleString()}{" "}
                                <span className="text-[9px] font-sans text-zinc-500 ml-0.5 uppercase tracking-wider">
                                  total
                                </span>
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                <span>Today: {step.todayCount || 0}</span>
                                {step.growth !== undefined && (
                                  <span className={`font-semibold flex items-center gap-0.5 ${
                                    step.growth >= 0 ? "text-[#00e5a0]" : "text-rose-400"
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
                              <div className="w-px h-8 bg-[#1e1e2e]"></div>
                              <Badge
                                variant="outline"
                                className="bg-[#0d0d12] text-[11px] text-zinc-400 border-[#1e1e2e] py-1.5 px-3 z-10 shadow-sm flex items-center gap-1.5 font-medium tracking-wide"
                              >
                                <span className="text-[#00e5a0] text-sm">
                                  ↓
                                </span>
                                {funnelAnalysis[idx + 1].conversionFromPrevious}{" "}
                                conversion
                              </Badge>
                              <div className="w-px h-8 bg-[#1e1e2e]"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 text-xs gap-3 font-mono">
                      <Target className="w-8 h-8 opacity-40 text-[#00e5a0]" />
                      <span>
                        No events recorded yet to build conversion pipelines.
                      </span>
                      <p className="max-w-md text-[10px] opacity-70 leading-relaxed bg-[#13131a] p-3 border border-[#1e1e2e] rounded-lg">
                        To build custom funnels automatically, send different
                        sequential events using the SDK, for example:
                        <br />
                        <code className="text-[#00e5a0] block pt-1">
                          trackEvent(&quot;YOUR_API_KEY&quot;,
                          &quot;homepage_view&quot;)
                        </code>
                        <code className="text-[#00e5a0] block">
                          trackEvent(&quot;YOUR_API_KEY&quot;,
                          &quot;signup_completed&quot;)
                        </code>
                      </p>
                    </div>
                  )}
                </CardContent>
              </InsightPanel>
            </div>

            {/* Funnel Diagnostics Sidebar */}
            <div className="space-y-6">
              <InsightPanel label="funnels - bottlenecks">
                <div className="p-5">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider mb-4 text-[#00e5a0] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Funnel Bottlenecks
                  </h4>
                  <div className="space-y-4 text-xs text-zinc-500">
                    <div className="p-3 border border-[#1e1e2e] bg-[#13131a] rounded-lg space-y-2">
                      <p className="font-semibold text-zinc-200">
                      Highest Conversion Drop
                    </p>
                    {funnelAnalysis.length >= 2 ? (
                      <>
                        <p className="text-[#00e5a0] font-medium font-mono text-[11px]">
                          {biggestDropStep}
                        </p>
                        <p className="text-[10px] opacity-75">
                          This specific conversion boundary represents the
                          largest numeric loss in user flow throughout your
                          custom events list.
                        </p>
                      </>
                    ) : (
                      <p className="text-zinc-500 italic text-[11px]">
                        Insufficient sequential events to calculate bottlenecks.
                      </p>
                    )}
                    </div>
                  </div>
                </div>
              </InsightPanel>
            </div>
          </div>
        )}

        {/* --- SESSION REPLAY LITE & TIMELINES TAB (DYNAMIC) --- */}
        {activeSection === "session_replay" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stacked User Journeys */}
            <div className="space-y-4">
              <InsightPanel label="timeline - grouped journeys">
                <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-[#00e5a0]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm text-white uppercase tracking-wider">
                        Grouped User Journey Timelines
                      </h3>
                      <p className="text-zinc-500 text-xs font-light">
                        Session pathways reconstructed from event order
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-[#1e1e2e] bg-[#13131a] text-zinc-400 text-[10px] font-mono"
                  >
                    {userJourneys.length} session(s)
                  </Badge>
                </div>
              </InsightPanel>

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
                        className="rounded-xl border-[#1e1e2e] bg-[#0d0d12] overflow-hidden relative"
                      >
                        {/* Top User Metadata Bar */}
                        <div className="p-4 bg-[#13131a] border-b border-[#1e1e2e] flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-[#00e5a0]/10 text-[#00e5a0] flex items-center justify-center font-bold border border-[#00e5a0]/20 text-sm">
                              👤
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-200 font-mono truncate max-w-[200px] md:max-w-xs">
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
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
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
                                  <MapPin className="w-3 h-3 text-[#00e5a0]" />
                                  {city && city !== "Unknown"
                                    ? `${city}, ${country}`
                                    : country}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className="border-[#1e1e2e] text-zinc-400 bg-[#0d0d12] font-mono text-[10px]"
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
                                    <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                  )}

                                  <button
                                    onClick={() =>
                                      setExpandedStep(
                                        expandedStep === stepId ? null : stepId,
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded border text-[10px] font-semibold tracking-wide transition-all uppercase flex-shrink-0 flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                                      expandedStep === stepId
                                        ? "bg-[#00e5a0] text-zinc-950 border-[#00e5a0] shadow-md font-bold"
                                        : isStepRage
                                        ? "bg-transparent text-rose-400 border-rose-500/20"
                                        : isConversion
                                        ? "bg-transparent text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                                        : "bg-[#13131a] text-zinc-400 border-[#1e1e2e] hover:text-white hover:border-[#00e5a0]/30"
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
                              <div className="p-4 border-t border-[#1e1e2e] bg-[#13131a]/50 space-y-3 animate-slideDown">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#00e5a0]" />
                                    Step {idx + 1} Payload Inspector
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono">
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
                                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">
                                      Metadata Parameters
                                    </p>
                                    <pre className="text-[10px] font-mono p-3 bg-[#0d0d12] rounded-lg border border-[#1e1e2e] text-zinc-300 overflow-x-auto">
                                      {JSON.stringify(
                                        stepLog.metadata || {},
                                        null,
                                        2,
                                      )}
                                    </pre>
                                  </div>
                                  <div className="space-y-2 text-[10px] text-zinc-500">
                                    <div>
                                      <span className="font-semibold text-zinc-200">
                                        Event Key:
                                      </span>
                                      <p className="font-mono text-[#00e5a0] pt-0.5">
                                        {stepLog.eventName}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-zinc-200">
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
                                      className="h-7 text-[10px] text-zinc-500 hover:text-white mt-2 cursor-pointer border border-[#1e1e2e] rounded bg-[#0d0d12]"
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
                        className="gap-2 cursor-pointer border-[#00e5a0]/30 text-[#00e5a0] hover:bg-[#00e5a0]/10 rounded-lg font-semibold text-xs py-2 px-4 shadow-[0_0_15px_rgba(0,229,160,0.05)] transition-all duration-300"
                      >
                        {loadingMoreJourneys ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#00e5a0] border-t-transparent rounded-full animate-spin" />
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
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 text-xs p-4 bg-[#0d0d12] rounded-xl border border-dashed border-[#1e1e2e] font-mono">
                  <MousePointer className="w-8 h-8 opacity-40 text-[#00e5a0] mb-2" />
                  <span>
                    No active user logs detected to trace user journeys.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- REVENUE & PROFIT TAB --- */}
        {activeSection === "revenue" && (
          <RevenueAnalytics
            revenueDay={analytics?.revenueTimelineDay || []}
            revenueWeek={analytics?.revenueTimelineWeek || []}
            revenueMonth={analytics?.revenueTimelineMonth || []}
            revenueYear={analytics?.revenueTimelineYear || []}
            totalRevenue={analytics?.revenueData?.totalRevenue || 0}
            campaignAttribution={analytics?.revenueData?.campaignAttribution || []}
          />
        )}

        {/* --- SMART RECOMMENDATIONS TAB (DYNAMIC) --- */}
        {activeSection === "ai_insights" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Recommendations List */}
            <div className="lg:col-span-3 space-y-6">
              <InsightPanel label="recommendations - audits">
                <CardHeader className="px-6 pt-5 pb-4">
                  <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">
                    Algorithmic Audits & Alerts
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs font-light">
                    Custom logic recommendations deduced from dynamic database
                    telemetry
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-6 pb-6 space-y-3">
                  {analytics?.topEvents && analytics.topEvents.length > 0 ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 border border-[#00e5a0]/20 bg-[#00e5a0]/5 rounded-lg flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200">
                            Optimize Around Primary Action
                          </p>
                          <p className="text-[10px] text-zinc-500 pt-0.5 leading-relaxed">
                            Your primary event is{" "}
                            <span className="text-[#00e5a0] font-semibold font-mono">
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
                        <div className="p-4 border border-[#1e1e2e] bg-[#13131a] rounded-lg flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-[#0d0d12] text-[#00e5a0] border border-[#1e1e2e]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-200">
                              Target Regional Traffic
                            </p>
                            <p className="text-[10px] text-zinc-500 pt-0.5 leading-relaxed">
                              Your largest traffic regional segment is{" "}
                              <span className="text-[#00e5a0] font-semibold">
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
                    <div className="text-xs text-zinc-500 py-8 italic text-center font-mono">
                      Insufficient data to deduce custom audits.
                    </div>
                  )}
                </CardContent>
              </InsightPanel>
            </div>
          </div>
        )}

        {/* --- ACTIVE USERS TIMELINE TAB --- */}
        {activeSection === "active_users" && (
          <div className="space-y-6 animate-fadeIn">
            <InsightPanel label="active users - trend">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-5 pb-4">
                <div>
                  <CardTitle className="font-mono text-sm text-white uppercase tracking-wider">
                    Active Users Trend
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs font-light">
                    Unique active users tracked over time
                  </CardDescription>
                </div>
                {/* Timeframe Selector tabs */}
                <div className="flex bg-[#13131a] border border-[#1e1e2e] p-1 rounded-lg gap-1 self-start sm:self-auto">
                  {(["day", "week", "month", "year"] as const).map((t) => (
                    <Button
                      key={t}
                      variant="ghost"
                      onClick={() => setTimeframe(t)}
                      className={`capitalize rounded-md text-[10px] font-mono font-semibold tracking-wider px-3 py-1.5 h-auto cursor-pointer transition-all ${
                        timeframe === t
                          ? "bg-[#0d0d12] text-[#00e5a0] border border-[#1e1e2e] shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300 border-transparent"
                      }`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-6 pb-6">
                <div className="h-[350px] w-full mt-4">
                  {activeUsersData && activeUsersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activeUsersData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="activeUsersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(tick) => formatDate(tick, timeframe)}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#71717a", fontSize: 10 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#71717a", fontSize: 10 }}
                        />
                        <RechartsTooltip
                          cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#0d0d12]/95 border border-[#1e1e2e] p-2.5 rounded-lg shadow-xl backdrop-blur-md">
                                  <p className="text-[9px] text-zinc-500 uppercase font-semibold">
                                    {formatDate(data.date, timeframe)}
                                  </p>
                                  <p className="text-xs font-bold text-[#00e5a0] font-mono mt-0.5">
                                    {data.count} <span className="text-[9px] text-zinc-400 font-sans font-medium">active user(s)</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#activeUsersGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 text-xs gap-2 font-mono">
                      <TrendingUp className="w-8 h-8 opacity-40 text-[#00e5a0]" />
                      <span>No active user data recorded for this period.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </InsightPanel>
          </div>
        )}

        {/* --- USER RETENTION (ENGAGEMENT ANALYTICS) TAB --- */}
        {activeSection === "engagement_analytics" && (() => {
          const retentionData = analytics?.retentionData || {
            yesterdayCount: 0,
            todaysCount: 0,
            oneDayRetentionCount: 0,
            oneDayRetentionRate: 0,
            sevenDayCount: 0,
            sevenDayRetentionCount: 0,
            sevenDayRetentionRate: 0,
            thirtyDayCount: 0,
            thirtyDayRetentionCount: 0,
            thirtyDayRetentionRate: 0
          };
          const yesterdayCount = retentionData.yesterdayCount || 0;
          const todaysCount = retentionData.todaysCount || 0;
          const oneDayRetentionCount = retentionData.oneDayRetentionCount || 0;
          // 1-Day retention rate
          const retentionRate = retentionData.oneDayRetentionRate || (yesterdayCount > 0 ? (oneDayRetentionCount / yesterdayCount) * 100 : 0);
          // 7-Day retention data
          const sevenDayCount = retentionData.sevenDayCount || 0;
          const sevenDayRetentionRate = retentionData.sevenDayRetentionRate || (sevenDayCount > 0 ? (retentionData.sevenDayRetentionCount / sevenDayCount) * 100 : 0);
          // 30-Day retention data
          const thirtyDayCount = retentionData.thirtyDayCount || 0;
          const thirtyDayRetentionRate = retentionData.thirtyDayRetentionRate || (thirtyDayCount > 0 ? (retentionData.thirtyDayRetentionCount / thirtyDayCount) * 100 : 0);
          

          const chartData = [
            { name: "Yesterday Active", count: yesterdayCount, fill: "#3f3f46" },
            { name: "Retained Today (1D)", count: oneDayRetentionCount, fill: "#10b981" },
            { name: "Today Total Active", count: todaysCount, fill: "#0ea5e9" }
          ];

          return (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Retention rate indicator */}
                <Card className="rounded-xl border-[#1e1e2e] bg-[#0d0d12] flex flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">User Retention Rate</h3>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      Percentage of yesterday&apos;s active users who returned today.
                    </p>
                  </div>
                  <div className="flex items-center gap-6 mt-6">
                    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                      {/* SVG Progress Circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-zinc-800"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-[#00e5a0] transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - retentionRate / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-base font-bold font-mono text-[#00e5a0]">
                        {retentionRate.toFixed(1)}%
                      </span>
                    </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">Cohort Status</div>
                        <div className="text-xs font-bold text-zinc-200 mt-1">
                        {retentionRate >= 50
                          ? "Excellent Retention"
                          : retentionRate >= 20
                          ? "Moderate Retention"
                          : yesterdayCount === 0
                          ? "No Baseline Data"
                          : "Needs Optimization"}
                      </div>
                    </div>
                  </div>
                </Card>
                  {/* 7-Day Retention Rate */}
                  <Card className="rounded-xl border-[#1e1e2e] bg-[#0d0d12] flex flex-col justify-between p-6">
                    <div>
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        7-Day Retention Rate
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        Percentage of users active 7 days ago who returned today.
                      </p>
                    </div>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" className="stroke-zinc-800" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            className="stroke-[#00e5a0] transition-all duration-1000 ease-out"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - sevenDayRetentionRate / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-base font-bold font-mono text-[#00e5a0]">
                          {sevenDayRetentionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Cohort Status
                        </div>
                        <div className="text-xs font-bold text-zinc-200 mt-1">
                          {sevenDayRetentionRate >= 50
                            ? "Excellent Retention"
                            : sevenDayRetentionRate >= 20
                            ? "Moderate Retention"
                            : sevenDayCount === 0
                            ? "No Baseline Data"
                            : "Needs Optimization"}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* 30-Day Retention Rate */}
                  <Card className="rounded-xl border-[#1e1e2e] bg-[#0d0d12] flex flex-col justify-between p-6">
                    <div>
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        30-Day Retention Rate
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        Percentage of users active 30 days ago who returned today.
                      </p>
                    </div>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" className="stroke-zinc-800" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            className="stroke-[#00e5a0] transition-all duration-1000 ease-out"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - thirtyDayRetentionRate / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-base font-bold font-mono text-[#00e5a0]">
                          {thirtyDayRetentionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Cohort Status
                        </div>
                        <div className="text-xs font-bold text-zinc-200 mt-1">
                          {thirtyDayRetentionRate >= 50
                            ? "Excellent Retention"
                            : thirtyDayRetentionRate >= 20
                            ? "Moderate Retention"
                            : thirtyDayCount === 0
                            ? "No Baseline Data"
                            : "Needs Optimization"}
                        </div>
                      </div>
                    </div>
                  </Card>
                {/* Retention Stats Bar Chart Card */}
                <InsightPanel label="engagement - retention breakdown" className="md:col-span-3">
                  <div className="p-6">
                    <div>
                      <h3 className="font-mono text-sm text-white uppercase tracking-wider">Active User Retention Breakdown</h3>
                      <p className="text-xs text-zinc-500 mt-0.5 font-light">
                        Visualizing active user sets from yesterday against retained users today.
                      </p>
                    </div>
                    <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} width={110} />
                        <RechartsTooltip
                          cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#0d0d12]/95 border border-[#1e1e2e] p-2.5 rounded-lg shadow-xl backdrop-blur-md">
                                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">{data.name}</p>
                                  <p className="text-xs font-bold text-[#00e5a0] font-mono mt-0.5">
                                    {data.count} <span className="text-[9px] text-zinc-400 font-sans font-medium">user(s)</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                </InsightPanel>
              </div>

              {/* Retention Cohort Diagnostics */}
              <InsightPanel label="engagement - diagnostics">
                <div className="p-6">
                  <h3 className="font-mono text-sm text-white uppercase tracking-wider mb-2">Retention Cohort Diagnostics</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This module measures user loyalty and engagement by cross-referencing <code className="text-[#00e5a0] font-mono">userId</code> and <code className="text-[#00e5a0] font-mono">anonymousId</code> sets active during the current 24-hour period against those active in the preceding 24 hours. The intersection of these groups gives you the quantity of returning (retained) users. High retention highlights sticky product mechanics, whereas low retention suggests a need for re-engagement strategies or optimized workflows.
                </p>
                </div>
              </InsightPanel>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

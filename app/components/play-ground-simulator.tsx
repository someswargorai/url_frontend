"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Copy,
  Crown,
  Database,
  Eye,
  EyeOff,
  FolderBookmark,
  Globe,
  KeyRound,
  Link2,
  MousePointerClick,
  Plus,
  Scissors,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InsightsAnalytics, { type ProjectAnalytics } from "@/components/InsightsAnalytics";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SidebarTab =
  | "shorten"
  | "campaigns"
  | "projects"
  | "my-urls"
  | "api-key"
  | "custom-domain"
  | "manage-subscription"
  | "documentation";

type ProjectTab = "overview" | "analytics" | "insights" | "logs" | "ai-analyst";

type ShortLink = {
  id: string;
  shortUrl: string;
  longUrl: string;
  campaign: string | null;
  clicks: number;
  createdAt: string;
  private: boolean;
};

type Campaign = {
  id: string;
  name: string;
  description: string;
  totalClicks: number;
  createdAt: string;
  isDefault?: boolean;
};

type Project = {
  id: string;
  name: string;
  description: string;
  key: string;
  createdAt: string;
  events: number;
};

type EventLog = {
  id: string;
  eventName: string;
  userId: string;
  city: string;
  device: string;
  timestamp: string;
};

const menuItems = [
  { title: "Shorten URL", value: "shorten", icon: Scissors },
  { title: "Campaigns", value: "campaigns", icon: Globe },
  { title: "Projects", value: "projects", icon: FolderBookmark },
  { title: "My URLs", value: "my-urls", icon: Link2 },
  { title: "Api Key", value: "api-key", icon: KeyRound },
  { title: "Custom Domain", value: "custom-domain", icon: Globe },
  { title: "Manage Subscription", value: "manage-subscription", icon: Wallet },
  { title: "Documentation", value: "documentation", icon: BookOpen },
] satisfies { title: string; value: SidebarTab; icon: typeof Scissors }[];

const clickSeries = [28, 44, 35, 72, 58, 91, 76, 112, 86, 126, 149, 132];
const citySeries = [
  { name: "Kolkata", value: 42 },
  { name: "London", value: 31 },
  { name: "Ashburn", value: 26 },
  { name: "Mumbai", value: 18 },
];

const playgroundInsightsAnalytics: ProjectAnalytics = {
  totalEvents: 232,
  todayEvents: 211,
  eventGrowth: 100,
  activeUsers: 4,
  todayActiveUsers: 4,
  activeUsersGrowth: 100,
  activePaths: [
    { path: "/homepage_view", count: 51 },
    { path: "/checkout_error", count: 50 },
    { path: "/add_to_cart", count: 39 },
  ],
  engagementMetrics: {
    engagementRate: "100%",
    avgDepth: "58.0",
  },
  topEvents: [
    { _id: "homepage_view", count: 51 },
    { _id: "checkout_error", count: 50 },
    { _id: "add_to_cart", count: 39 },
  ],
  countries: [
    { _id: "India", count: 92 },
    { _id: "United Kingdom", count: 54 },
    { _id: "United States", count: 38 },
  ],
  cities: [
    { _id: "Kolkata", count: 42 },
    { _id: "London", count: 31 },
    { _id: "Ashburn", count: 26 },
  ],
  os: [
    { _id: "Android", count: 76 },
    { _id: "macOS", count: 61 },
    { _id: "iOS", count: 44 },
  ],
  devices: [
    { _id: "mobile", count: 126 },
    { _id: "desktop", count: 106 },
  ],
  funnelAnalysis: [
    {
      name: "homepage_view",
      count: 51,
      todayCount: 47,
      growth: 100,
      conversionFromPrevious: "100.0%",
    },
    {
      name: "checkout_error",
      count: 50,
      todayCount: 45,
      growth: 100,
      conversionFromPrevious: "98.0%",
    },
    {
      name: "add_to_cart",
      count: 39,
      todayCount: 36,
      growth: 100,
      conversionFromPrevious: "78.0%",
    },
    {
      name: "purchase_completed",
      count: 25,
      todayCount: 21,
      growth: 74,
      conversionFromPrevious: "64.1%",
    },
  ],
  revenueData: {
    totalRevenue: 18750,
    campaignAttribution: [
      { source: "Launch Campaign", count: 18, revenue: "8550", conversion: "31%" },
      { source: "Docs Funnel", count: 9, revenue: "4275", conversion: "18%" },
      { source: "Direct Traffic", count: 7, revenue: "3325", conversion: "14%" },
    ],
  },
  retentionData: {
    todaysCount: 4,
    yesterdayCount: 4,
    sevenDayCount: 10,
    thirtyDayCount: 18,
    oneDayRetentionCount: 4,
    oneDayRetentionRate: 100,
    sevenDayRetentionCount: 7,
    sevenDayRetentionRate: 70,
    thirtyDayRetentionCount: 9,
    thirtyDayRetentionRate: 50,
  },
  activeUsersTimelineDay: [
    { date: "2026-05-24T08:00:00.000Z", count: 1 },
    { date: "2026-05-24T09:00:00.000Z", count: 2 },
    { date: "2026-05-24T10:00:00.000Z", count: 3 },
    { date: "2026-05-24T11:00:00.000Z", count: 4 },
  ],
  activeUsersTimelineWeek: [
    { date: "2026-05-18T00:00:00.000Z", count: 3 },
    { date: "2026-05-19T00:00:00.000Z", count: 5 },
    { date: "2026-05-20T00:00:00.000Z", count: 7 },
    { date: "2026-05-21T00:00:00.000Z", count: 9 },
    { date: "2026-05-22T00:00:00.000Z", count: 8 },
    { date: "2026-05-23T00:00:00.000Z", count: 11 },
    { date: "2026-05-24T00:00:00.000Z", count: 14 },
  ],
  activeUsersTimelineMonth: [
    { date: "2026-05-01T00:00:00.000Z", count: 11 },
    { date: "2026-05-08T00:00:00.000Z", count: 18 },
    { date: "2026-05-15T00:00:00.000Z", count: 24 },
    { date: "2026-05-22T00:00:00.000Z", count: 31 },
  ],
  activeUsersTimelineYear: [
    { date: "2026-01-01T00:00:00.000Z", count: 48 },
    { date: "2026-02-01T00:00:00.000Z", count: 61 },
    { date: "2026-03-01T00:00:00.000Z", count: 77 },
    { date: "2026-04-01T00:00:00.000Z", count: 95 },
    { date: "2026-05-01T00:00:00.000Z", count: 124 },
  ],
  revenueTimelineDay: [
    { date: "2026-05-24T08:00:00.000Z", profit: 950 },
    { date: "2026-05-24T09:00:00.000Z", profit: 1900 },
    { date: "2026-05-24T10:00:00.000Z", profit: 3800 },
    { date: "2026-05-24T11:00:00.000Z", profit: 5700 },
  ],
  revenueTimelineWeek: [
    { date: "2026-05-18T00:00:00.000Z", profit: 1900 },
    { date: "2026-05-19T00:00:00.000Z", profit: 2850 },
    { date: "2026-05-20T00:00:00.000Z", profit: 4750 },
    { date: "2026-05-21T00:00:00.000Z", profit: 6650 },
  ],
  revenueTimelineMonth: [
    { date: "2026-05-01T00:00:00.000Z", profit: 4750 },
    { date: "2026-05-08T00:00:00.000Z", profit: 8550 },
    { date: "2026-05-15T00:00:00.000Z", profit: 12350 },
    { date: "2026-05-22T00:00:00.000Z", profit: 18750 },
  ],
  revenueTimelineYear: [
    { date: "2026-01-01T00:00:00.000Z", profit: 9000 },
    { date: "2026-02-01T00:00:00.000Z", profit: 13500 },
    { date: "2026-03-01T00:00:00.000Z", profit: 16900 },
    { date: "2026-04-01T00:00:00.000Z", profit: 22100 },
    { date: "2026-05-01T00:00:00.000Z", profit: 28750 },
  ],
  peakTrafficOnDateAndHour: [
    { _id: "2026-05-24", peakTraffic: 58, peakHour: 11 },
  ],
};

const playgroundInsightLogs = [
  {
    _id: "evt_1",
    eventName: "homepage_view",
    userId: "user_1111",
    device: { deviceType: "mobile", os: "Android" },
    location: { country: "India", city: "Kolkata" },
    metadata: { path: "/", reason: "" },
    timestamp: "2026-05-24T11:52:00.000Z",
    source: { referrer: "github.com" },
  },
  {
    _id: "evt_2",
    eventName: "checkout_error",
    userId: "user_1111",
    device: { deviceType: "mobile", os: "Android" },
    location: { country: "India", city: "Kolkata" },
    metadata: { path: "", reason: "card_declined" },
    timestamp: "2026-05-24T11:54:00.000Z",
    source: { referrer: "github.com" },
  },
];

const playgroundUserJourneys = [
  {
    userId: "user_1111",
    deviceType: "mobile",
    os: "Android",
    country: "India",
    city: "Kolkata",
    events: playgroundInsightLogs,
    rageClicks: 0,
    lastActive: "2026-05-24T11:54:00.000Z",
    sessionDurationMs: 184000,
  },
  {
    userId: "user_2841",
    deviceType: "desktop",
    os: "macOS",
    country: "United Kingdom",
    city: "London",
    events: [
      {
        _id: "evt_3",
        eventName: "homepage_view",
        userId: "user_2841",
        device: { deviceType: "desktop", os: "macOS" },
        location: { country: "United Kingdom", city: "London" },
        metadata: { path: "/docs", reason: "" },
        timestamp: "2026-05-24T10:21:00.000Z",
        source: { referrer: "newsletter" },
      },
    ],
    rageClicks: 1,
    lastActive: "2026-05-24T10:21:00.000Z",
    sessionDurationMs: 96000,
  },
];

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function shortCodeFromUrl(url: string) {
  const cleaned = url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]
    .split(".")[0];

  return `${cleaned || "link"}-${Math.random().toString(36).slice(2, 5)}`;
}

const terminalDots = ["#ff5f57", "#febc2e", "#28c840"];

function TerminalBar({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1e1e2e] bg-[#13131a] px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="mr-1 flex shrink-0 items-center gap-1.5">
          {terminalDots.map((color) => (
            <span key={color} className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          ))}
        </div>
        <div className="mx-1 h-4 w-px bg-[#1e1e2e]" />
        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
     
    </div>
  );
}

function TerminalCard({
  label,
  children,
  className,
  right,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden rounded-xl border-[#1e1e2e] bg-[#0d0d12]", className)}>
      <TerminalBar label={label} right={right} />
      {children}
    </Card>
  );
}

function TerminalHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <CardHeader className="px-6 pb-4 pt-4">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a] p-2.5 text-[#00e5a0]">{icon}</div>
        ) : null}
        <div>
          <CardTitle className="font-mono text-sm uppercase tracking-wider text-white">{title}</CardTitle>
          {description ? <CardDescription className="text-xs font-light text-zinc-500">{description}</CardDescription> : null}
        </div>
      </div>
    </CardHeader>
  );
}

const playgroundPrimaryButton =
  "rounded-lg bg-[#00e5a0] px-5 py-5 font-mono text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_16px_rgba(0,229,160,0.14)] hover:bg-[#05d594]";

const playgroundOutlineButton =
  "rounded-lg border-[#1e1e2e] bg-[#13131a] px-5 py-5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:bg-[#1a1a24] hover:text-[#00e5a0]";

const playgroundFieldClass =
  "rounded-lg border-[#1e1e2e] bg-[#13131a] text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-[#00e5a0]/35";

const playgroundDialogContentClass =
  "overflow-hidden rounded-xl border-[#1e1e2e] bg-[#0d0d12] p-0 text-zinc-200 shadow-2xl sm:max-w-[425px]";

const playgroundLabelClass = "font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500";

function AnalyticsHighlight({
  title,
  description,
  icon,
  data = clickSeries,
  color = "bg-primary/80",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  data?: number[];
  color?: string;
}) {
  return (
    <TerminalCard label={`analytics - ${title.toLowerCase()}`}>
      <TerminalHeader title={title} description={description} icon={icon} />
      <CardContent className="px-6 pb-6 pt-2">
        <div className="flex h-[300px] items-end gap-2 rounded-lg border border-[#1e1e2e] bg-[#13131a] p-4">
          {data.map((value, index) => {
            const max = Math.max(...data);
            return (
              <div key={`${title}-${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn("w-full rounded-t-sm bg-[#00e5a0] transition-all shadow-[0_0_12px_rgba(0,229,160,0.25)]", color)}
                  style={{ height: `${Math.max(14, (value / max) * 245)}px` }}
                />
                <span className="font-mono text-[10px] text-zinc-500">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </TerminalCard>
  );
}

function BreakdownCard({
  title,
  description,
  icon,
  data,
  color = "bg-primary",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: { name: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <TerminalCard label={`segment - ${title.toLowerCase()}`} className="h-full">
      <TerminalHeader title={title} description={description} icon={icon} />
      <CardContent className="space-y-4 px-6 pb-6 pt-2">
        {data.map((item) => (
          <div key={`${title}-${item.name}`} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="max-w-[170px] truncate font-light text-zinc-300">{item.name}</span>
              <span className="font-semibold text-[#00e5a0]">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#1e1e2e] bg-[#13131a]">
              <div className={cn("h-full rounded-full bg-[#00e5a0] shadow-[0_0_8px_rgba(0,229,160,0.35)]", color)} style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </TerminalCard>
  );
}

function DashboardAnalyticsGrid({ mode }: { mode: "url" | "campaign" | "project" }) {
  const eventData = [
    { name: "homepage_view", value: 342 },
    { name: "purchase_completed", value: 128 },
    { name: "signup_success", value: 96 },
    { name: "referral_click", value: 74 },
  ];
  const deviceData = [
    { name: "mobile / Android", value: 78 },
    { name: "mobile / iOS", value: 64 },
    { name: "desktop / macOS", value: 47 },
    { name: "desktop / Windows", value: 31 },
  ];
  const browserData = [
    { name: "Chrome", value: 116 },
    { name: "Safari", value: 83 },
    { name: "Firefox", value: 38 },
    { name: "Edge", value: 22 },
  ];
  const referrerData = [
    { name: "Direct Traffic", value: 91 },
    { name: "github.com", value: 68 },
    { name: "producthunt.com", value: 55 },
    { name: "newsletter", value: 33 },
  ];

  const primaryTitle =
    mode === "project"
      ? "Global Event History"
      : mode === "campaign"
        ? "Aggregated Click History"
        : "Click History";

  const primaryDescription =
    mode === "project"
      ? "Hourly custom events received by the project."
      : mode === "campaign"
        ? "Activity across all links in this campaign."
        : "Minute-wise activity for this URL.";

  return (
    <div className="space-y-8">
      <AnalyticsHighlight
        title={primaryTitle}
        description={primaryDescription}
        icon={<BarChart3 className="h-5 w-5 text-indigo-400" />}
        data={mode === "project" ? [34, 58, 41, 86, 92, 131, 98, 155, 121, 178, 149, 196] : [12, 19, 32, 28, 51, 43, 67, 58, 74, 69, 88, 96]}
        color={mode === "url" ? "bg-blue-500" : "bg-indigo-500"}
      />

      {mode === "project" ? (
        <TerminalCard label="geo - global traffic map">
          <TerminalHeader title="Global Traffic Map" description="Interactive heat map of project events globally." icon={<Globe className="h-5 w-5" />} />
          <CardContent className="grid gap-6 px-6 pb-6 pt-2 lg:grid-cols-3">
            <div className="relative h-[320px] overflow-hidden rounded-lg border border-[#1e1e2e] bg-[#13131a] lg:col-span-2">
              <div className="absolute left-[18%] top-[34%] h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.8)]" />
              <div className="absolute left-[47%] top-[28%] h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]" />
              <div className="absolute left-[69%] top-[46%] h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_28px_rgba(52,211,153,0.9)]" />
              <div className="absolute inset-x-8 top-1/2 h-px bg-[#1e1e2e]" />
              <div className="absolute inset-y-8 left-1/2 w-px bg-[#1e1e2e]" />
              <div className="absolute bottom-4 left-4 rounded-full border border-[#1e1e2e] bg-[#0d0d12]/90 px-3 py-1.5 font-mono text-[10px] text-zinc-500">
                Plotting cities...
              </div>
            </div>
            <div className="h-[320px] rounded-lg border border-[#1e1e2e] bg-[#0d0d12] p-4">
              <h4 className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-white">
                <Globe className="h-4 w-4 text-[#00e5a0]" />
                Top Cities Breakdown
              </h4>
              <div className="space-y-4">
                {citySeries.map((city) => (
                  <div key={city.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-light text-zinc-300">{city.name}</span>
                      <span className="text-[#00e5a0]">{city.value} hits</span>
                    </div>
                    <div className="h-2 rounded-full border border-[#1e1e2e] bg-[#13131a]">
                      <div className="h-full rounded-full bg-[#00e5a0] shadow-[0_0_8px_rgba(0,229,160,0.35)]" style={{ width: `${city.value * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </TerminalCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {mode === "project" ? (
          <BreakdownCard title="Top Events" description="Most common custom events." icon={<Database className="h-5 w-5 text-indigo-400" />} data={eventData} color="bg-indigo-500" />
        ) : null}
        <BreakdownCard title="Devices" description="User distribution by device type." icon={<Eye className="h-5 w-5 text-blue-400" />} data={deviceData} color="bg-blue-500" />
        <BreakdownCard title="Browsers" description="Most used browsers." icon={<Globe className="h-5 w-5 text-orange-400" />} data={browserData} color="bg-orange-500" />
        <BreakdownCard title="Countries" description="Distribution by country." icon={<Globe className="h-5 w-5 text-emerald-400" />} data={citySeries} color="bg-emerald-500" />
        <BreakdownCard title="Referrers" description="Traffic sources and attribution." icon={<BarChart3 className="h-5 w-5 text-pink-400" />} data={referrerData} color="bg-pink-500" />
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="group relative h-[132px] overflow-hidden rounded-xl border-[#1e1e2e] bg-[#0d0d12] shadow-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00e5a0] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardContent className="flex h-full items-center justify-between p-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{title}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#00e5a0]">{value}</p>
        </div>
        <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a] p-3 text-[#00e5a0] shadow-inner">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function PageHeading({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00e5a0]/20 bg-[#00e5a0]/10 text-[#00e5a0]">
            {icon}
          </div>
        ) : null}
        <div>
          <h3 className="font-mono text-2xl font-bold tracking-tight text-white">{title}</h3>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function PlayGroundSimulator() {
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("projects");
  const [projectTab, setProjectTab] = useState<ProjectTab>("overview");
  const [url, setUrl] = useState("");
  const [campaignId, setCampaignId] = useState("launch");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [campaignDetailId, setCampaignDetailId] = useState<string | null>(null);
  const [projectDashboardId, setProjectDashboardId] = useState<string | null>(null);
  const [urlStatsId, setUrlStatsId] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [domainVerified, setDomainVerified] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [activePlan, setActivePlan] = useState<"Free" | "Base Plan" | "Pro Plan">("Free");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai" as const,
      text: "Hello! I am your AI Analyst for this project. Ask me about traffic, events, funnels, or top cities.",
    },
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "launch",
      name: "Launch Campaign",
      description: "Product Hunt, GitHub, and newsletter launch traffic.",
      totalClicks: 186,
      createdAt: "24 May 2026",
      isDefault: true,
    },
    {
      id: "docs",
      name: "Docs Funnel",
      description: "Developer documentation and SDK adoption links.",
      totalClicks: 91,
      createdAt: "20 May 2026",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "app",
      name: "Shorty Web App",
      description: "Event tracking for the main SaaS dashboard.",
      key: "pk_live_shorty_7k9v3b2x_demo",
      createdAt: "21 May 2026",
      events: 1240,
    },
    {
      id: "sdk",
      name: "SDK Sandbox",
      description: "Testing custom event ingestion from docs examples.",
      key: "pk_live_shorty_p8m2q1r5_demo",
      createdAt: "18 May 2026",
      events: 460,
    },
  ]);

  const [links, setLinks] = useState<ShortLink[]>([
    {
      id: "1",
      shortUrl: "shorty.in/launch",
      longUrl: "https://github.com/someswargorai/url_frontend",
      campaign: "Launch Campaign",
      clicks: 128,
      createdAt: "24 May 2026",
      private: false,
    },
    {
      id: "2",
      shortUrl: "shorty.in/docs",
      longUrl: "https://shorty.dev/docs/api",
      campaign: "Docs Funnel",
      clicks: 84,
      createdAt: "23 May 2026",
      private: true,
    },
    {
      id: "3",
      shortUrl: "shorty.in/pricing",
      longUrl: "https://shorty.dev/pricing",
      campaign: null,
      clicks: 42,
      createdAt: "22 May 2026",
      private: false,
    },
  ]);

  const [logs, setLogs] = useState<EventLog[]>([
    {
      id: "evt_01",
      eventName: "purchase_completed",
      userId: "user_1111",
      city: "Kolkata, India",
      device: "mobile / Android",
      timestamp: "11:52 AM",
    },
    {
      id: "evt_02",
      eventName: "homepage_view",
      userId: "user_2841",
      city: "London, United Kingdom",
      device: "desktop / macOS",
      timestamp: "11:49 AM",
    },
    {
      id: "evt_03",
      eventName: "signup_success",
      userId: "user_4412",
      city: "Ashburn, United States",
      device: "mobile / iOS",
      timestamp: "11:45 AM",
    },
  ]);

  const totals = useMemo(() => {
    const totalClicks = links.reduce((sum, item) => sum + item.clicks, 0);
    return {
      clicks: totalClicks,
      links: links.length,
      campaigns: campaigns.length,
      projects: projects.length,
      events: projects.reduce((sum, item) => sum + item.events, 0),
    };
  }, [campaigns.length, links, projects]);

  const selectedProject =
    projects.find((project) => project.id === projectDashboardId) ?? projects[0];

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const handleShorten = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return;

    const code = shortCodeFromUrl(url);
    const createdShortUrl = `shorty.in/${code}`;
    const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);

    const newLink: ShortLink = {
      id: `${Date.now()}`,
      shortUrl: createdShortUrl,
      longUrl: url,
      campaign: selectedCampaign?.name ?? null,
      clicks: 0,
      createdAt: todayLabel(),
      private: false,
    };

    setLinks((current) => [newLink, ...current]);
    setShortUrl(createdShortUrl);
    setUrl("");
  };

  const handleCreateCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCampaignName.trim()) return;

    setCampaigns((current) => [
      {
        id: `${Date.now()}`,
        name: newCampaignName.trim(),
        description: newCampaignDesc.trim() || "A demo campaign created inside the playground.",
        totalClicks: 0,
        createdAt: todayLabel(),
      },
      ...current,
    ]);
    setNewCampaignName("");
    setNewCampaignDesc("");
    setCreateCampaignOpen(false);
  };

  const handleCreateProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newProjectName.trim()) return;

    setProjects((current) => [
      {
        id: `${Date.now()}`,
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || "A demo event tracking workspace.",
        key: `pk_live_shorty_${Math.random().toString(36).slice(2, 12)}_demo`,
        createdAt: todayLabel(),
        events: 0,
      },
      ...current,
    ]);
    setNewProjectName("");
    setNewProjectDesc("");
    setCreateProjectOpen(false);
  };

  const handleSendChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatInput.trim()) return;

    const question = chatInput.trim();
    setChatMessages((current) => [
      ...current,
      { role: "user" as const, text: question },
      {
        role: "ai" as const,
        text:
          question.toLowerCase().includes("city") || question.toLowerCase().includes("traffic")
            ? "Kolkata is currently your top city with 42 demo events, followed by London. Mobile traffic is strongest on the Launch Campaign."
            : "Your demo project looks healthy: purchase_completed is converting well, homepage_view is the top event, and no unusual traffic spike is visible.",
      },
    ]);
    setChatInput("");
  };

  const addDemoEvent = () => {
    const events = ["homepage_view", "signup_success", "purchase_completed", "referral_click"];
    const cities = ["Kolkata, India", "London, United Kingdom", "Ashburn, United States"];
    const devices = ["mobile / Android", "desktop / macOS", "mobile / iOS"];

    setLogs((current) => [
      {
        id: `evt_${Date.now()}`,
        eventName: events[Math.floor(Math.random() * events.length)],
        userId: `user_${Math.floor(1000 + Math.random() * 8999)}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...current.slice(0, 7),
    ]);

    setProjects((current) =>
      current.map((project, index) =>
        index === 0 ? { ...project, events: project.events + 1 } : project,
      ),
    );
  };

  const renderShorten = () => (
    <div className="mx-auto max-w-3xl text-center">
      <Badge
        variant="secondary"
        className="mb-4 border-primary/10 bg-gray-50 px-4 py-3 text-xs text-primary transition-colors hover:bg-primary/20 dark:bg-transparent"
      >
        <span className="font-medium tracking-tight text-[#00e5a0]">
          More than just a link shortener
        </span>
      </Badge>
      <h3 className="mb-5 text-4xl font-extrabold tracking-tight">
        Shorten Links. <br />
        <span className="text-[#00e5a0]">
          Expand Reach.
        </span>
      </h3>
      <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground">
        Create short, branded links in seconds. Track performance, optimize for conversion,
        and take control of your digital presence.
      </p>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <TerminalCard label="shortener - create link">
          <CardContent className="p-6">
            <form onSubmit={handleShorten} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  type="url"
                  placeholder="Paste your long link here..."
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="h-14 flex-1 rounded-lg border-[#1e1e2e] bg-[#13131a] px-4 text-lg text-zinc-200 placeholder:text-sm focus-visible:ring-[#00e5a0]/40"
                />
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger className="h-14! w-full rounded-lg border-[#1e1e2e] bg-[#13131a] text-zinc-200 focus:ring-[#00e5a0]/40 md:w-[200px]">
                    <SelectValue placeholder="Select Campaign" />
                  </SelectTrigger>
                  <SelectContent className="max-h-44 overflow-y-auto" align="start">
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id} className="h-10!">
                        {campaign.name} {campaign.isDefault ? "(Default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="h-14 w-full rounded-lg bg-[#00e5a0] text-md font-bold text-black shadow-sm shadow-[#00e5a0]/20 transition-all hover:scale-[1.01] hover:bg-[#05d594] active:scale-[0.99]"
              >
                <Scissors className="mr-2 h-5 w-5" />
                Shorten Now
              </Button>
            </form>
          </CardContent>
        </TerminalCard>

        {shortUrl ? (
          <Card className="overflow-hidden rounded-xl border-[#00e5a0]/30 bg-[#00e5a0]/5 ring-1 ring-[#00e5a0]/20">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="rounded-lg bg-[#00e5a0]/10 p-2">
                  <Zap className="h-5 w-5 text-[#00e5a0]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Shortened Link
                  </p>
                  <p className="truncate font-mono text-xl font-bold tracking-tight text-[#00e5a0]">{shortUrl}</p>
                </div>
              </div>
              <Button
                size="lg"
                className="h-14 shrink-0 gap-2 rounded-lg bg-[#00e5a0] px-5 text-black hover:bg-[#05d594]"
                onClick={() => copyText(shortUrl, "shortUrl")}
              >
                {copied === "shortUrl" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied === "shortUrl" ? "Copied" : "Copy Link"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );

  const renderCampaigns = () => {
    const activeCampaign =
      campaigns.find((campaign) => campaign.id === campaignDetailId) ?? campaigns[0];

    if (campaignDetailId) {
      return (
        <div className="mx-auto max-w-6xl">
          <Button
            variant="ghost"
            className="mb-4 rounded-md gap-2"
            onClick={() => setCampaignDetailId(null)}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Campaigns
          </Button>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{activeCampaign.name} Insights</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {activeCampaign.description || "Aggregated insights for all links in this campaign."}
              </p>
            </div>
            <div className="w-fit rounded-md border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400">
              <Sparkles className="mr-2 inline h-4 w-4" />
              AI Campaign Insights
            </div>
          </div>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <StatsCard title="Total Campaign Clicks" value={activeCampaign.totalClicks} icon={<MousePointerClick className="h-5 w-5 text-indigo-400" />} />
            <StatsCard title="Top Country" value="India" icon={<Globe className="h-5 w-5 text-emerald-400" />} />
            <StatsCard title="Top Referrer" value="github.com" icon={<BarChart3 className="h-5 w-5 text-orange-400" />} />
          </div>
          <DashboardAnalyticsGrid mode="campaign" />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-6xl">
        <PageHeading
          title="Campaigns"
          description="Group your links into marketing campaigns to track macro-level performance across sources."
          action={
            <Button onClick={() => setCreateCampaignOpen(true)} className={playgroundPrimaryButton}>
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          }
        />

        <Dialog open={createCampaignOpen} onOpenChange={setCreateCampaignOpen}>
          <DialogContent className={playgroundDialogContentClass}>
            <TerminalBar label="campaigns - create" />
            <form onSubmit={handleCreateCampaign}>
              <DialogHeader className="px-6 pt-5">
                <DialogTitle className="font-mono text-base uppercase tracking-wider text-white">Create Campaign</DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Group links together to track overall marketing performance.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5">
                <div className="grid gap-2">
                  <label htmlFor="campaign-name" className={playgroundLabelClass}>
                    Campaign Name
                  </label>
                  <Input
                    id="campaign-name"
                    value={newCampaignName}
                    onChange={(event) => setNewCampaignName(event.target.value)}
                    placeholder="e.g. Black Friday 2026"
                    className={playgroundFieldClass}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="campaign-desc" className={playgroundLabelClass}>
                    Description (Optional)
                  </label>
                  <textarea
                    id="campaign-desc"
                    value={newCampaignDesc}
                    onChange={(event) => setNewCampaignDesc(event.target.value)}
                    placeholder="Describe the goal of this campaign..."
                    className={cn("min-h-24 resize-none px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]", playgroundFieldClass)}
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-[#1e1e2e] bg-[#13131a] px-6 py-4">
                <Button type="button" variant="outline" className={playgroundOutlineButton} onClick={() => setCreateCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={playgroundPrimaryButton} disabled={!newCampaignName.trim()}>
                  Create Campaign
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <StatsCard
            title="Total Campaigns"
            value={campaigns.length}
            icon={<Globe className="h-5 w-5 text-blue-400" />}
          />
          <StatsCard
            title="Total Campaign Clicks"
            value={campaigns.reduce((sum, campaign) => sum + campaign.totalClicks, 0)}
            icon={<MousePointerClick className="h-5 w-5 text-purple-400" />}
          />
        </div>

        <TerminalCard label="campaigns - list" className="mb-8">
          <TerminalHeader title="Your Campaigns" description="Select a campaign to view aggregated insights and charts." icon={<Globe className="h-5 w-5" />} />
          <CardContent className="px-6 pb-6 pt-2">
            <div className="overflow-x-auto rounded-lg border border-[#1e1e2e]">
              <Table className="min-w-[760px]">
                <TableHeader className="bg-[#13131a]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Campaign Name</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Description</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Total Clicks</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Created</TableHead>
                    <TableHead className="text-center font-mono text-[10px] uppercase tracking-widest text-zinc-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-zinc-200">{campaign.name}</span>
                          {campaign.isDefault ? (
                            <Badge variant="secondary" className="h-5 bg-muted px-1.5 text-[10px]">
                              Default
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate text-sm text-zinc-500">
                        {campaign.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-sm border-[#00e5a0]/20 bg-[#00e5a0]/5 text-[#00e5a0]"
                        >
                          {campaign.totalClicks} Clicks
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {campaign.createdAt}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="rounded-sm"
                          onClick={() => setCampaignDetailId(campaign.id)}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Insights
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </TerminalCard>

      </div>
    );
  };

  const renderProjects = () => {
    if (projectDashboardId) {
      return renderProjectDashboardPage();
    }

    return (
    <div className="mx-auto max-w-6xl">
      <PageHeading
        title="Projects (Event Tracking)"
        description="Create projects to get API keys and track custom developer events within your applications."
        action={
          <Button onClick={() => setCreateProjectOpen(true)} className={playgroundPrimaryButton}>
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        }
      />

      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className={playgroundDialogContentClass}>
          <TerminalBar label="projects - create" />
          <form onSubmit={handleCreateProject}>
            <DialogHeader className="px-6 pt-5">
              <DialogTitle className="font-mono text-base uppercase tracking-wider text-white">Create Event Tracking Project</DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Create a project to generate an API key for your application.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 px-6 py-5">
              <div className="grid gap-2">
                <label htmlFor="project-name" className={playgroundLabelClass}>
                  Project Name
                </label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="e.g. My Next.js SaaS"
                  className={playgroundFieldClass}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="project-desc" className={playgroundLabelClass}>
                  Description (Optional)
                </label>
                <textarea
                  id="project-desc"
                  value={newProjectDesc}
                  onChange={(event) => setNewProjectDesc(event.target.value)}
                  placeholder="What app is this for?"
                  className={cn("min-h-24 resize-none px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]", playgroundFieldClass)}
                />
              </div>
            </div>
            <DialogFooter className="border-t border-[#1e1e2e] bg-[#13131a] px-6 py-4">
              <Button type="button" variant="outline" className={playgroundOutlineButton} onClick={() => setCreateProjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className={playgroundPrimaryButton} disabled={!newProjectName.trim()}>
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <StatsCard
          title="Active Projects"
          value={projects.length}
          icon={<Database className="h-5 w-5 text-indigo-400" />}
        />
        <StatsCard
          title="Total Events Tracked"
          value={totals.events}
          icon={<Globe className="h-5 w-5 text-purple-400" />}
        />
      </div>

      <TerminalCard label="projects - list">
        <TerminalHeader title="Your Tracking Projects" description="Select a project to view its API key, live logs, and analytics." icon={<Database className="h-5 w-5" />} />
        <CardContent className="px-6 pb-6 pt-2">
          <div className="overflow-x-auto rounded-lg border border-[#1e1e2e]">
            <Table className="min-w-[780px]">
              <TableHeader className="bg-[#13131a]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Project Name</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Description</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">API Key</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Created</TableHead>
                  <TableHead className="text-center font-mono text-[10px] uppercase tracking-widest text-zinc-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-white/[0.02]">
                    <TableCell className="font-mono font-semibold text-zinc-200">{project.name}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm text-zinc-500">
                      {project.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="max-w-[220px] cursor-pointer truncate rounded-sm border-[#00e5a0]/20 bg-[#00e5a0]/10 font-mono text-xs text-[#00e5a0]"
                        onClick={() => copyText(project.key, project.id)}
                      >
                        {copied === project.id ? "Copied" : project.key}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.createdAt}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        className="rounded-sm"
                        onClick={() => {
                          setProjectDashboardId(project.id);
                          setProjectTab("overview");
                        }}
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </TerminalCard>
    </div>
    );
  };

  const renderProjectDashboardPage = () => (
    <div className="mx-auto max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => setProjectDashboardId(null)}
        className="mb-4 rounded-md gap-2"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back to Projects
      </Button>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-3xl font-bold tracking-tight">{selectedProject.name}</h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {selectedProject.description || "Manage your tracking events and analyze user behavior."}
          </p>
        </div>
      </div>

      <div className="mb-6 flex h-14 gap-2 overflow-x-auto rounded-xl border border-[#1e1e2e] bg-[#0d0d12] p-1.5">
        {[
          ["overview", "Overview"],
          ["analytics", "Analytics"],
          ["insights", "Insights"],
          ["logs", "Live Logs"],
          ["ai-analyst", "AI Analyst"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setProjectTab(value as ProjectTab)}
            className={cn(
              "h-full shrink-0 rounded-lg px-4 font-mono text-xs font-medium uppercase transition",
              projectTab === value ? "border border-[#1e1e2e] bg-[#13131a] text-[#00e5a0] shadow-sm" : "text-zinc-500 hover:text-[#00e5a0]",
              value === "ai-analyst" && projectTab === value ? "border-[#7c6df0]/20 bg-[#7c6df0]/10 text-[#7c6df0]" : "",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {renderProjectDashboard()}
    </div>
  );

  const renderProjectDashboard = () => {
    if (projectTab === "overview") {
      return (
        <TerminalCard label="project - integration setup">
          <TerminalHeader title="Integration Setup" description="Use this API key to send events from your application." icon={<Database className="h-5 w-5" />} />
          <CardContent className="space-y-6 px-6 pb-6 pt-2">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Project API Key</p>
              <div className="flex max-w-xl items-center gap-2">
                <code className="flex-1 break-all rounded-lg border border-[#1e1e2e] bg-[#13131a] p-3 font-mono text-sm text-[#00e5a0]">
                  {selectedProject.key}
                </code>
                <Button
                  variant="outline"
                  className="h-[46px] rounded-lg border-[#1e1e2e] bg-[#13131a] text-zinc-300 hover:text-[#00e5a0]"
                  onClick={() => copyText(selectedProject.key, "project-key")}
                >
                  {copied === "project-key" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">SDK Example</p>
              <pre className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#13131a] p-4 text-sm text-zinc-300">
{`import { trackEvent } from "shorty-analytics-sdk";

await trackEvent("${selectedProject.key}", {
  event: "user_signup",
  userId: "user_123",
  metadata: { plan: "pro", source: "google_ad" }
});`}
              </pre>
            </div>
          </CardContent>
        </TerminalCard>
      );
    }

    if (projectTab === "analytics") {
      return (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <StatsCard title="Total Events Tracked" value={selectedProject.events} icon={<Database className="h-3 w-3 text-indigo-400" />} />
            <StatsCard title="Top Event" value="homepage_view" icon={<BarChart3 className="h-3 w-3 text-purple-400" />} />
            <StatsCard title="Top Country" value="India" icon={<Globe className="h-5 w-5 text-emerald-400" />} />
          </div>
          <DashboardAnalyticsGrid mode="project" />
        </div>
      );
    }

    if (projectTab === "insights") {
      return (
        <div className="[&_button]:cursor-pointer">
          <InsightsAnalytics
            analytics={playgroundInsightsAnalytics}
            logs={playgroundInsightLogs}
            userJourneys={playgroundUserJourneys}
          />
        </div>
      );
    }

    if (projectTab === "logs") {
      return (
        <TerminalCard label="logs - live events">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-4 pt-4">
            <div>
              <CardTitle className="font-mono text-sm uppercase tracking-wider text-white">Live Logs</CardTitle>
              <CardDescription className="text-xs font-light text-zinc-500">Custom events received from your application.</CardDescription>
            </div>
            <Button size="sm" onClick={addDemoEvent} className="rounded-lg bg-[#00e5a0] text-black hover:bg-[#05d594]">
              <Plus className="h-3 w-3" />
              Add Demo Event
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <div className="overflow-x-auto rounded-lg border border-[#1e1e2e]">
              <Table className="min-w-[720px]">
                <TableHeader className="bg-[#13131a]">
                  <TableRow>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Event</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">User</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Location</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Device</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-[#00e5a0]">{log.eventName}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell className="text-zinc-500">{log.city}</TableCell>
                      <TableCell className="text-zinc-500">{log.device}</TableCell>
                      <TableCell className="text-zinc-500">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </TerminalCard>
      );
    }

    return (
      <TerminalCard label="ai - analyst">
        <TerminalHeader title="ShortyAI Analyst" description="Ask questions about demo event logs." icon={<Sparkles className="h-5 w-5" />} />
        <CardContent className="space-y-4 px-6 pb-6 pt-2">
          <div className="h-[260px] space-y-3 overflow-y-auto rounded-lg border border-[#1e1e2e] bg-[#13131a] p-4">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-3 text-sm",
                    message.role === "user"
                      ? "bg-[#00e5a0] text-black"
                      : "border border-[#1e1e2e] bg-[#0d0d12] text-zinc-300",
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask anything about your events..."
              className="h-12 border-[#1e1e2e] bg-[#13131a] text-zinc-200"
            />
            <Button type="submit" className="h-12 gap-2 bg-[#00e5a0] text-black hover:bg-[#05d594]">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </TerminalCard>
    );
  };

  const renderUrls = () => {
    const selectedUrl = links.find((link) => link.id === urlStatsId) ?? links[0];

    if (urlStatsId) {
      return (
        <div className="mx-auto max-w-6xl">
          <Button
            variant="ghost"
            className="mb-4 rounded-md gap-2"
            onClick={() => setUrlStatsId(null)}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to URLs
          </Button>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">URL Statistics</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                <Link2 className="h-4 w-4 text-blue-400" />
                {selectedUrl.shortUrl}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Destination</p>
              <p className="max-w-md truncate text-sm font-medium text-zinc-500">{selectedUrl.longUrl}</p>
            </div>
          </div>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <StatsCard title="Total Clicks" value={selectedUrl.clicks} icon={<MousePointerClick className="h-3 w-3 text-blue-400" />} />
            <StatsCard title="Top Country" value="India" icon={<Globe className="h-3 w-3 text-emerald-400" />} />
            <StatsCard title="Top Referrer" value="github.com" icon={<BarChart3 className="h-5 w-5 text-purple-400" />} />
          </div>
          <DashboardAnalyticsGrid mode="url" />
        </div>
      );
    }

    return (
    <div className="mx-auto max-w-6xl">
      <PageHeading
        title="URL Analytics Dashboard"
        description="Monitor all your shortened URLs and detailed click analytics."
      />
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatsCard title="Total URLs" value={totals.links} icon={<Link2 className="h-5 w-5 text-blue-400" />} />
        <StatsCard title="Total Clicks" value={totals.clicks} icon={<MousePointerClick className="h-5 w-5 text-purple-400" />} />
        <StatsCard title="Analytics Enabled" value={links.length} icon={<Eye className="h-5 w-5 text-emerald-400" />} />
      </div>

      <TerminalCard label="urls - list">
        <TerminalHeader title="Your Shortened URLs" description="View all the URLs you have shortened and inspect analytics." icon={<Link2 className="h-5 w-5" />} />
        <CardContent className="space-y-8 px-6 pb-6 pt-2">
          <div className="overflow-x-auto rounded-lg border border-[#1e1e2e]">
            <Table className="min-w-[820px]">
              <TableHeader className="bg-[#13131a]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Short URL</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Campaign</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Destination</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Clicks</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Created</TableHead>
                  <TableHead className="text-center font-mono text-[10px] uppercase tracking-widest text-zinc-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id} className="hover:bg-white/[0.02]">
                    <TableCell className="max-w-[180px] truncate font-mono font-medium text-[#00e5a0]">
                      {link.shortUrl}
                    </TableCell>
                    <TableCell>
                      {link.campaign ? (
                        <span className="hover:underline">{link.campaign}</span>
                      ) : (
                        <Badge className="border-none bg-yellow-500/10 text-yellow-500">No Campaign</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-zinc-500">{link.longUrl}</TableCell>
                    <TableCell>
                      <Badge className="rounded-sm">{link.clicks} Clicks</Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400">{link.createdAt}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="rounded-sm"
                        onClick={() => {
                          setUrlStatsId(link.id);
                          setLinks((current) =>
                            current.map((item) =>
                              item.id === link.id ? { ...item, clicks: item.clicks + 1 } : item,
                            ),
                          );
                        }}
                      >
                        View Analytics
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </TerminalCard>
    </div>
    );
  };

  const renderApiKeys = () => {
    const apiKeys = [
      {
        name: "Production Web App",
        key: "sk_live_shorty_9b7f6c3a_demo",
        plan: activePlan,
        createdAt: "May 24, 2026",
        lastUsed: "Today",
      },
    ];

    return (
      <div className="mx-auto max-w-6xl">
        <PageHeading
          icon={<KeyRound className="h-5 w-5" />}
          title="API Keys"
          description="Manage authentication keys for API access. Keep them secure."
          action={
            <Button className={playgroundPrimaryButton}>
              <Plus className="h-4 w-4" />
              Create Key
            </Button>
          }
        />

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <StatsCard title="Active Keys" value={apiKeys.length} icon={<Shield className="h-5 w-5 text-indigo-400" />} />
          <StatsCard title="Total Requests" value="1.8k" icon={<Zap className="h-5 w-5 text-emerald-400" />} />
          <StatsCard title="Last Activity" value="Recent" icon={<Clock className="h-5 w-5 text-amber-400" />} />
        </div>

        <TerminalCard label="api keys - list">
          <TerminalHeader title="Your API Keys" icon={<KeyRound className="h-5 w-5" />} />
          <CardContent className="overflow-x-auto p-0">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-[#13131a]">
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Name</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Key</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Created</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Last Used</TableHead>
                  <TableHead className="text-right font-mono text-[10px] uppercase tracking-widest text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => {
                  const visible = showApiKey[apiKey.key];
                  return (
                    <TableRow key={apiKey.key} className="hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-zinc-200">{apiKey.name}</span>
                          <Badge variant="secondary" className="h-5 bg-[#13131a] px-1.5 text-[10px] text-zinc-500">
                            {apiKey.plan}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 truncate rounded-md border border-[#1e1e2e] bg-[#13131a] px-3 py-1.5 font-mono text-xs text-zinc-500">
                            {visible ? apiKey.key : `${apiKey.key.slice(0, 10)}********************demo`}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowApiKey((current) => ({ ...current, [apiKey.key]: !visible }))}
                          >
                            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyText(apiKey.key, "main-api-key")}
                          >
                            {copied === "main-api-key" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">{apiKey.createdAt}</TableCell>
                      <TableCell className="text-sm text-zinc-500">{apiKey.lastUsed}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </TerminalCard>

        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed text-amber-500/90">
            <strong className="font-semibold">Security reminder:</strong> Never share API keys in public repositories or client-side code.
          </p>
        </div>
      </div>
    );
  };

  const renderCustomDomain = () => (
    <div className="mx-auto max-w-6xl">
      <PageHeading
        icon={<Globe className="h-5 w-5" />}
        title="Custom Domains"
        description="Brand your short URLs with your own custom domain."
      />

      <TerminalCard label="domains - configuration">
        <CardHeader className="flex flex-row items-center justify-between px-6 pb-4 pt-4">
          <div>
            <CardTitle className="flex items-center gap-3 font-mono text-lg text-white">
              {domainInput || "links.shorty-demo.com"}
              {domainVerified ? (
                <Badge className="flex items-center gap-1 rounded-sm border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 rounded-sm border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-amber-500">
                  <Clock className="h-3.5 w-3.5" />
                  Pending Verification
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-zinc-500">Registered on {todayLabel()}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="e.g. links.mydomain.com"
              className="h-12 rounded-lg border-[#1e1e2e] bg-[#13131a] text-zinc-200"
            />
            <Button className="h-12 bg-[#00e5a0] px-6 text-black hover:bg-[#05d594]" onClick={() => setDomainVerified(false)}>
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          </div>

          {!domainVerified ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-500">Domain Verification Required</h4>
                  <p className="mt-1 text-xs leading-relaxed text-amber-500/90">
                    Configure these DNS records in your registrar. This is a local demo, so verification only toggles UI state.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DnsRecord title="CNAME" host="links" value="cname.vercel-dns.com" onCopy={copyText} copied={copied} />
                <DnsRecord title="TXT" host="_shorty_host" value="shorty-verify-demo-token" onCopy={copyText} copied={copied} />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#1e1e2e] pt-6">
                <Button variant="outline" className="border-[#1e1e2e] bg-[#13131a] text-zinc-300">Sync Status</Button>
                <Button className="bg-[#00e5a0] px-6 text-black hover:bg-[#05d594]" onClick={() => setDomainVerified(true)}>
                  Verify DNS Configuration
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-100">Your domain is active!</h4>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
                  Your custom branded domain is verified and routing traffic. New short links can use this custom domain.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </TerminalCard>
    </div>
  );

  const renderSubscription = () => {
    const plans = [
      { name: "Free", price: "Rs 0", icon: <Zap className="h-6 w-6" />, features: ["10 short links", "5 campaigns", "Basic event tracking"] },
      { name: "Base Plan", price: "Rs 190", icon: <Crown className="h-6 w-6" />, features: ["60 short links", "10 campaigns", "1 custom domain"] },
      { name: "Pro Plan", price: "Rs 475", icon: <Sparkles className="h-6 w-6" />, features: ["120 short links", "20 campaigns", "2 API keys"] },
    ] as const;

    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeading title="Billing & plan" description="Manage your subscription, upgrades, and billing details." />

        <TerminalCard label="billing - current plan">
          <CardHeader className="px-6 pb-4 pt-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <CardTitle className="font-mono text-sm uppercase tracking-wider text-white">Current plan</CardTitle>
                <CardDescription className="mt-0.5 text-xs text-zinc-500">Your active subscription details</CardDescription>
              </div>
              <Badge variant="outline" className="border-[#00e5a0]/30 bg-[#00e5a0]/10 px-3 py-1 text-xs text-[#00e5a0]">
                {activePlan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 px-6 pb-6 pt-2 sm:grid-cols-4">
            <PlanFact icon={<Crown className="h-3.5 w-3.5" />} label="Plan" value={activePlan} />
            <PlanFact icon={<Calendar className="h-3.5 w-3.5" />} label="Subscribed on" value="24 May 2026" />
            <PlanFact icon={<Clock className="h-3.5 w-3.5" />} label="Renews on" value="24 Jun 2026" />
            <PlanFact icon={<Wallet className="h-3.5 w-3.5" />} label="Billing" value="Monthly" />
          </CardContent>
        </TerminalCard>

        <div>
          <h4 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-zinc-500">Available plans</h4>
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-xl border-[#1e1e2e] bg-[#0d0d12]",
                  activePlan === plan.name
                    ? "border-[#00e5a0] ring-1 ring-[#00e5a0]/40"
                    : plan.name === "Base Plan"
                      ? "border-violet-400 ring-1 ring-violet-400/30"
                      : "",
                )}
              >
                <CardHeader>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a] p-1.5 text-[#00e5a0]">{plan.icon}</div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-zinc-100">{plan.name}</p>
                      <p className="text-xs text-zinc-500">For Shorty users</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-zinc-500">/ month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-5">
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={plan.name === "Base Plan" ? "default" : "outline"}
                    className={cn(
                      "w-full text-xs",
                      plan.name === "Base Plan"
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "border-[#1e1e2e] bg-[#13131a] text-zinc-200 hover:bg-[#1a1a24] hover:text-[#00e5a0]",
                    )}
                    disabled={activePlan === plan.name}
                    onClick={() => setActivePlan(plan.name)}
                  >
                    {activePlan === plan.name ? "Active plan" : `Get ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentation = () => (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeading
        icon={<BookOpen className="h-5 w-5" />}
        title="Documentation"
        description="Use Shorty APIs and SDK snippets to integrate links and event tracking."
      />
      <TerminalCard label="docs - shorten url">
        <TerminalHeader title="Shorten a URL" description="Demo docs panel styled like the logged-in application." icon={<Scissors className="h-5 w-5" />} />
        <CardContent className="px-6 pb-6 pt-2">
          <pre className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#13131a] p-4 text-sm text-zinc-300">
{`POST /url/shorten-url

{
  "url": "https://example.com",
  "campaignId": "launch"
}`}
          </pre>
        </CardContent>
      </TerminalCard>
      <TerminalCard label="docs - event tracking">
        <TerminalHeader title="Track custom events" description="Event analytics use project API keys." icon={<Database className="h-5 w-5" />} />
        <CardContent className="px-6 pb-6 pt-2">
          <pre className="overflow-x-auto rounded-lg border border-[#1e1e2e] bg-[#13131a] p-4 text-sm text-zinc-300">
{`await trackEvent("pk_live_shorty_demo", {
  event: "purchase_completed",
  userId: "user_123",
  metadata: { amount: 190, currency: "INR" }
});`}
          </pre>
        </CardContent>
      </TerminalCard>
    </div>
  );

  const renderActivePanel = () => {
    if (activeSidebarTab === "shorten") return renderShorten();
    if (activeSidebarTab === "campaigns") return renderCampaigns();
    if (activeSidebarTab === "projects") return renderProjects();
    if (activeSidebarTab === "my-urls") return renderUrls();
    if (activeSidebarTab === "api-key") return renderApiKeys();
    if (activeSidebarTab === "custom-domain") return renderCustomDomain();
    if (activeSidebarTab === "manage-subscription") return renderSubscription();
    return renderDocumentation();
  };

  return (
    <section id="interactive-demo" className="hidden bg-background px-4 py-16 md:block">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <Badge
            variant="secondary"
            className="border-primary/10 bg-gray-50 px-4 py-3 text-xs text-primary dark:bg-transparent"
          >
            <span className="font-medium tracking-tight text-[#00e5a0]">
              Live product playground
            </span>
          </Badge>
          <br/>
          <span className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            Preview the <span className="text-[#00e5a0]">Shorty</span> Dashboard 
          </span>
           <span className="mb-1 text-muted-foreground/35 font-extrabold sm:text-4xl"> clicking your links.</span>

          <p className="text-sm text-muted-foreground sm:text-base">
            This is a state-only demo of the authenticated product. It mirrors the real screens without API calls,
            auth, or persistence.
          </p>
        </div>

        <div className="mx-auto flex min-h-[760px] max-w-6xl flex-col overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#0d0d12] shadow-2xl">
          <div className="flex h-12 items-center justify-between border-b border-[#1e1e2e] bg-[#13131a] px-4">
            <div className="flex min-w-0 items-center gap-2">
              {terminalDots.map((color) => (
                <span key={color} className="h-2 w-2 rounded-full" style={{ background: color }} />
              ))}
              <span className="ml-3 hidden truncate rounded-md border border-[#1e1e2e] bg-[#0d0d12] px-3 py-1 font-mono text-[11px] text-zinc-500 sm:block">
                https://myk8s.shop
              </span>
            </div>
            <div className="hidden items-center gap-2 rounded-md border border-[#1e1e2e] bg-[#0d0d12] px-3 py-1 font-mono text-[11px] text-zinc-500 md:flex">
              Demo clicks <span className="font-bold text-[#00e5a0]">{totals.clicks}</span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[#0d0d12] md:flex-row">
            <aside className="w-full shrink-0 border-b border-border/50 bg-background px-4 py-2 dark:border-[#1e1e2e] dark:bg-[#0d0d12] md:w-72 md:border-b-0 md:border-r">
              <div className="flex h-full flex-col ">
                <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110"
              style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)" }}
            >
              <Scissors
                className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
                style={{ color: "#00e5a0" }}
                strokeWidth={1.5}
              />
            </div>
            <span
              className="font-bold tracking-tight text-foreground dark:text-white"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "18px",
                letterSpacing: "-0.5px",
              }}
            >
              Shorty<span style={{ color: "#00e5a0" }}>.</span>
            </span>
          </Link>

                <nav className="flex flex-1 gap-2 overflow-x-auto px-3 py-3 md:block md:space-y-1 md:overflow-y-auto md:px-4 md:pt-4">
                  {menuItems.map((item) => {
                    const isActive = activeSidebarTab === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          setActiveSidebarTab(item.value);
                          setCampaignDetailId(null);
                          setProjectDashboardId(null);
                          setUrlStatsId(null);
                        }}
                        className={cn(
                          "group relative flex w-auto shrink-0 items-center gap-3 overflow-hidden rounded-lg px-4 py-3 text-left transition-all duration-200 md:w-full md:gap-4",
                          isActive
                            ? "border border-[#00e5a0]/20 bg-[#00e5a0]/10 text-[#00e5a0]"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground dark:text-zinc-500 dark:hover:bg-[#13131a] dark:hover:text-zinc-200",
                        )}
                      >
                        {isActive ? <div className="absolute bottom-1/4 left-0 top-1/4 w-1 rounded-full bg-[#00e5a0]" /> : null}
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                            isActive ? "text-[#00e5a0]" : "text-muted-foreground dark:text-zinc-500",
                          )}
                        />
                        <span className="whitespace-nowrap text-sm font-semibold tracking-wide">{item.title}</span>
                        {isActive ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <header className="sticky top-0 z-20 backdrop-blur-sm bg-white dark:bg-[#0d0d12]">
                <div className="flex h-16 items-center justify-between px-4">
                  <div></div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="hidden rounded-full px-3 text-zinc-400 sm:inline-flex">
                      Playground
                    </Badge>
                    <Button className="hidden rounded-full bg-[#00e5a0] px-6 font-semibold text-black shadow-md hover:bg-[#05d594] sm:flex">
                      Logout
                    </Button>
                  </div>
                </div>
              </header>

              <main className="h-[640px] overflow-y-auto bg-background p-3 sm:p-4 md:h-[680px] md:p-8">
                {renderActivePanel()}
              </main>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DnsRecord({
  title,
  host,
  value,
  copied,
  onCopy,
}: {
  title: string;
  host: string;
  value: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-zinc-200">{title} record</span>
        <Badge variant="secondary" className="bg-[#00e5a0]/10 px-1.5 py-0 text-[10px] text-[#00e5a0]">
          Recommended
        </Badge>
      </div>
      <div className="space-y-2 rounded border border-[#1e1e2e] bg-[#0d0d12] p-3 font-mono text-xs text-zinc-300">
        <div>
          <span className="text-zinc-500">Type:</span> {title}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate">
            <span className="text-zinc-500">Host:</span> {host}
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => onCopy(host, `${title}-host`)}>
            {copied === `${title}-host` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate">
            <span className="text-zinc-500">Value:</span> {value}
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => onCopy(value, `${title}-value`)}>
            {copied === `${title}-value` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlanFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
        {icon}
        {label}
      </p>
      <p className="font-mono font-semibold capitalize text-zinc-100">{value}</p>
    </div>
  );
}

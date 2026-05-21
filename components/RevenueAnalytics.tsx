"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// ⚠️  DEVELOPER NOTE
// The revenue graphs are driven by the `metadata.amount` field on each event.
// Make sure every revenue-generating event includes a numeric `amount` value:
//
//   trackEvent(API_KEY, "purchase", { amount: 49.99 });
//
// Without this field, all profit values will be zero and charts will be empty.
// ---------------------------------------------------------------------------

interface RevenuePoint {
  date: string;
  profit: number;
}

interface CampaignRow {
  source: string;
  count: number;
  revenue: string;
  conversion: string;
}

interface Props {
  revenueDay?: RevenuePoint[];
  revenueWeek?: RevenuePoint[];
  revenueMonth?: RevenuePoint[];
  revenueYear?: RevenuePoint[];
  totalRevenue?: number;
  campaignAttribution?: CampaignRow[];
}

type Period = "day" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
};

function formatDate(dateStr: string, period: Period): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  switch (period) {
    case "day":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "week":
      return (
        "Wk " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );
    case "month":
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    case "year":
      return d.getFullYear().toString();
  }
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

const GRADIENT_ID = "revenueAreaGrad";
const BAR_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"];

// Custom tooltip for the area chart
function RevenueTooltip({
  active,
  payload,
  period,
}: {
  active?: boolean;
  payload?: { payload: RevenuePoint }[];
  period: Period;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-zinc-950/95 border border-border/50 p-3 rounded-lg shadow-2xl backdrop-blur-md min-w-[140px]">
      <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
        {formatDate(d.date, period)}
      </p>
      <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
        {formatCurrency(d.profit)}
        <span className="text-[9px] text-foreground font-sans font-medium ml-1">
          profit
        </span>
      </p>
    </div>
  );
}

export function RevenueAnalytics({
  revenueDay = [],
  revenueWeek = [],
  revenueMonth = [],
  revenueYear = [],
  totalRevenue = 0,
  campaignAttribution = [],
}: Props) {
  const [period, setPeriod] = useState<Period>("day");

  const dataMap: Record<Period, RevenuePoint[]> = {
    day: revenueDay,
    week: revenueWeek,
    month: revenueMonth,
    year: revenueYear,
  };

  const currentData = dataMap[period];

  // Derive KPIs from current period data
  const { totalProfit, currentPeriodProfit, avgProfit, peak, growth } = useMemo(() => {
    if (!currentData.length)
      return { totalProfit: 0, currentPeriodProfit: 0, avgProfit: 0, peak: 0, growth: 0 };
    const profits = currentData.map((d) => d.profit);
    const total = profits.reduce((a, b) => a + b, 0);
    const avg = total / profits.length;
    const peakVal = Math.max(...profits);
    const prev = profits[profits.length - 2] ?? 0;
    const last = profits[profits.length - 1] ?? 0;
    let growthPct = 0;
    if (prev > 0) {
      growthPct = ((last - prev) / prev) * 100;
    } else if (last > 0) {
      growthPct = 100;
    }
    return { totalProfit: total, currentPeriodProfit: last, avgProfit: avg, peak: peakVal, growth: growthPct };
  }, [currentData]);

  const hasData = currentData.length > 0 && totalProfit > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Developer notice banner (only shows if no data) ─────────────── */}
      {!hasData && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <span className="font-semibold text-amber-300">Developer Note — </span>
            Revenue graphs require a numeric{" "}
            <code className="font-mono text-amber-200 bg-amber-500/10 px-1 py-0.5 rounded">
              metadata.amount
            </code>{" "}
            field on each event. Add it to your{" "}
            <code className="font-mono text-amber-200 bg-amber-500/10 px-1 py-0.5 rounded">
              trackEvent
            </code>{" "}
            calls to start seeing profit data.
          </div>
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Profit (current period) */}
        <Card className="rounded-lg border-border/50 bg-card/40 backdrop-blur-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {PERIOD_LABELS[period]} Profit
          </span>
          <span className="text-2xl font-extrabold font-mono text-foreground">
            {formatCurrency(currentPeriodProfit)}
          </span>
          <span
            className={`text-[10px] font-semibold flex items-center gap-0.5 ${
              growth >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {growth >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(1)}% last period
          </span>
        </Card>

        {/* All-time Total Revenue */}
        <Card className="rounded-lg border-border/50 bg-card/40 backdrop-blur-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            All-Time Revenue
          </span>
          <span className="text-2xl font-extrabold font-mono text-foreground">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Lifetime aggregated
          </span>
        </Card>

        {/* Average per period */}
        <Card className="rounded-lg border-border/50 bg-card/40 backdrop-blur-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Avg / {period}
          </span>
          <span className="text-2xl font-extrabold font-mono text-foreground">
            {formatCurrency(avgProfit)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Mean across {currentData.length} point(s)
          </span>
        </Card>

        {/* Peak revenue */}
        <Card className="rounded-lg border-border/50 bg-card/40 backdrop-blur-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Peak Profit
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-400">
            {formatCurrency(peak)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Highest single {period}
          </span>
        </Card>
      </div>

      {/* ── Area Chart ─────────────────────────────────────────────────── */}
      <Card className="rounded-lg border-border/50 bg-card/30 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Profit Over Time
            </CardTitle>
            <CardDescription className="text-xs">
              Sum of{" "}
              <code className="font-mono text-emerald-400">metadata.amount</code>{" "}
              across all events grouped by {period}
            </CardDescription>
          </div>

          {/* Period Switcher */}
          <div className="flex bg-muted/65 p-1 rounded-sm gap-1 self-start sm:self-auto">
            {(["day", "week", "month", "year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`capitalize rounded-sm text-[10px] font-semibold tracking-wider px-3 py-1.5 transition-all cursor-pointer ${
                  period === p
                    ? "bg-card text-emerald-400 border border-border/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-[320px] w-full">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(t) => formatDate(t, period)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    width={70}
                  />
                  <RechartsTooltip
                    cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
                    content={<RevenueTooltip period={period} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${GRADIENT_ID})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#10b981",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs gap-3">
                <DollarSign className="w-10 h-10 opacity-20 text-emerald-500" />
                <span className="max-w-xs leading-relaxed">
                  No revenue data for this period. Start sending events with a
                  numeric{" "}
                  <code className="text-emerald-400 font-mono">
                    metadata.amount
                  </code>{" "}
                  to populate this chart.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Referrer Attribution Bar Chart + Table ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card className="rounded-lg border-border/50 bg-card/30 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Revenue by Referrer
            </CardTitle>
            <CardDescription className="text-xs">
              Attributed revenue split across traffic sources
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px]">
              {campaignAttribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={campaignAttribution.map((c) => ({
                      source:
                        c.source.length > 16
                          ? c.source.slice(0, 16) + "…"
                          : c.source,
                      revenue: parseFloat(c.revenue.replace(/[^0-9.]/g, "")) || 0,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#27272a"
                    />
                    <XAxis
                      dataKey="source"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 9 }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 9 }}
                      width={60}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-zinc-950/95 border border-border/50 p-2.5 rounded shadow-xl backdrop-blur-md">
                            <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                              {d.source}
                            </p>
                            <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                              {formatCurrency(d.revenue)}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={28}>
                      {campaignAttribution.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={BAR_COLORS[i % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground gap-2">
                  <Target className="w-8 h-8 opacity-20 text-emerald-500" />
                  No referrer data yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attribution Table */}
        <Card className="rounded-lg border-border/50 bg-card/30 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Referrer Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Traffic share and attributed revenue by source
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            {campaignAttribution.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                    <th className="py-2.5">Source</th>
                    <th className="py-2.5 text-right">Hits</th>
                    <th className="py-2.5 text-right">Revenue</th>
                    <th className="py-2.5 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {campaignAttribution.map((cam, i) => (
                    <tr key={cam.source} className="hover:bg-muted/10">
                      <td className="py-2.5 font-semibold text-foreground flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                        />
                        <span className="truncate max-w-[120px]">
                          {cam.source}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-foreground">
                        {cam.count}
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-400 font-semibold">
                        {cam.revenue}
                      </td>
                      <td className="py-2.5 text-right font-mono text-muted-foreground">
                        {cam.conversion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-xs text-muted-foreground py-8 italic text-center">
                No referrals recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Integration Guide ──────────────────────────────────────────── */}
      <Card className="rounded-lg border-border/50 bg-card/30 backdrop-blur-xl p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-emerald-400 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" />
          How to Track Revenue
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Pass a numeric{" "}
          <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded">
            amount
          </code>{" "}
          key inside the{" "}
          <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded">
            metadata
          </code>{" "}
          object of any event to have it counted as revenue. To populate the Revenue by Referrer graph, also include a{" "}
          <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded">
            source
          </code>{" "}
          or{" "}
          <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded">
            metadata.source
          </code>{" "}
          field:
        </p>
        <pre className="text-[10px] font-mono p-3 bg-zinc-950 rounded border border-border/40 text-emerald-400 overflow-x-auto">
          {`await trackEvent("YOUR_API_KEY", "purchase", {
  metadata: {
    plan: "pro",
    amount: 49.99  // ← required for revenue graphs
  },
  source: {
    referrer: "https://twitter.com/..."  // ← required for referrer breakdown
  }
});`}
        </pre>
        
      </Card>
    </div>
  );
}

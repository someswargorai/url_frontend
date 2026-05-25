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
const BAR_COLORS = ["#00e5a0", "#7c6df0", "#05d594", "#f59e0b", "#ef4444"];

// Terminal top bar helper
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
    <div className="bg-[#0d0d12]/95 border border-[#1e1e2e] p-3 rounded-lg shadow-2xl backdrop-blur-md min-w-[140px]">
      <p className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider">
        {formatDate(d.date, period)}
      </p>
      <p className="text-sm font-bold text-[#00e5a0] font-mono mt-1">
        {formatCurrency(d.profit)}
        <span className="text-[9px] text-zinc-400 font-sans font-medium ml-1">
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
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
          <TerminalBar label={`revenue · ${PERIOD_LABELS[period].toLowerCase()} profit`} />
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-mono">
              {PERIOD_LABELS[period]} Profit
            </span>
            <span className="text-2xl font-extrabold font-mono text-white">
              {formatCurrency(currentPeriodProfit)}
            </span>
            <span
              className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                growth >= 0 ? "text-[#00e5a0]" : "text-rose-400"
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
          </div>
        </div>

        {/* All-time Total Revenue */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
          <TerminalBar label="revenue · all-time" />
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-mono">
              All-Time Revenue
            </span>
            <span className="text-2xl font-extrabold font-mono text-white">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Lifetime aggregated
            </span>
          </div>
        </div>

        {/* Average per period */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
          <TerminalBar label={`revenue · avg / ${period}`} />
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-mono">
              Avg / {period}
            </span>
            <span className="text-2xl font-extrabold font-mono text-white">
              {formatCurrency(avgProfit)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Mean across {currentData.length} point(s)
            </span>
          </div>
        </div>

        {/* Peak revenue */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
          <TerminalBar label="revenue · peak" />
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-mono">
              Peak Profit
            </span>
            <span className="text-2xl font-extrabold font-mono text-[#00e5a0]">
              {formatCurrency(peak)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Highest single {period}
            </span>
          </div>
        </div>
      </div>

      {/* ── Area Chart ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
        <TerminalBar
          label="revenue · profit over time"
          right={
            <div className="flex bg-[#13131a] border border-[#1e1e2e] p-1 rounded-lg gap-1">
              {(["day", "week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`capitalize rounded-md text-[10px] font-semibold tracking-wider px-3 py-1.5 transition-all cursor-pointer font-mono ${
                    period === p
                      ? "bg-[#0d0d12] text-[#00e5a0] border border-[#1e1e2e] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300 border-transparent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        />

        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-[#00e5a0]">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-sm text-white uppercase tracking-wider">Profit Over Time</p>
              <p className="text-zinc-500 text-xs font-light">
                Sum of{" "}
                <code className="font-mono text-[#00e5a0]">metadata.amount</code>{" "}
                across all events grouped by {period}
              </p>
            </div>
          </div>

          <div className="h-[320px] w-full">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1e1e2e"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(t) => formatDate(t, period)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
                    width={70}
                  />
                  <RechartsTooltip
                    cursor={{ stroke: "#00e5a0", strokeWidth: 1, strokeDasharray: "4 4" }}
                    content={<RevenueTooltip period={period} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#00e5a0"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${GRADIENT_ID})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#00e5a0",
                      stroke: "#0d0d12",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 text-xs gap-3 font-mono">
                <DollarSign className="w-10 h-10 opacity-20 text-[#00e5a0]" />
                <span className="max-w-xs leading-relaxed">
                  No revenue data for this period. Start sending events with a
                  numeric{" "}
                  <code className="text-[#00e5a0] font-mono">
                    metadata.amount
                  </code>{" "}
                  to populate this chart.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Referrer Attribution Bar Chart + Table ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
          <TerminalBar label="revenue · by referrer" />
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#13131a] border border-[#1e1e2e] text-[#00e5a0]">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-sm text-white uppercase tracking-wider">Revenue by Referrer</p>
                <p className="text-zinc-500 text-xs font-light">Attributed revenue split across traffic sources</p>
              </div>
            </div>
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
                      stroke="#1e1e2e"
                    />
                    <XAxis
                      dataKey="source"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#52525b", fontSize: 9, fontFamily: "monospace" }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#52525b", fontSize: 9, fontFamily: "monospace" }}
                      width={60}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0d0d12]/95 border border-[#1e1e2e] p-2.5 rounded shadow-xl backdrop-blur-md">
                            <p className="text-[9px] text-zinc-500 uppercase font-semibold font-mono">
                              {d.source}
                            </p>
                            <p className="text-xs font-bold text-[#00e5a0] font-mono mt-0.5">
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
                <div className="flex flex-col items-center justify-center h-full text-xs text-zinc-500 gap-2 font-mono">
                  <Target className="w-8 h-8 opacity-20 text-[#00e5a0]" />
                  No referrer data yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attribution Table */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
          <TerminalBar label="revenue · referrer breakdown" />
          <div className="px-6 py-4">
            <p className="font-mono text-sm text-white uppercase tracking-wider mb-1">Referrer Breakdown</p>
            <p className="text-zinc-500 text-xs font-light mb-4">Traffic share and attributed revenue by source</p>
            <div className="overflow-x-auto">
              {campaignAttribution.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e1e2e] text-zinc-500 font-semibold font-mono">
                      <th className="py-2.5 text-[10px] uppercase tracking-widest">Source</th>
                      <th className="py-2.5 text-right text-[10px] uppercase tracking-widest">Hits</th>
                      <th className="py-2.5 text-right text-[10px] uppercase tracking-widest">Revenue</th>
                      <th className="py-2.5 text-right text-[10px] uppercase tracking-widest">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e2e]">
                    {campaignAttribution.map((cam, i) => (
                      <tr key={cam.source} className="hover:bg-white/[0.01] transition">
                        <td className="py-2.5 font-semibold text-zinc-300 flex items-center gap-2 font-mono text-[11px]">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                          />
                          <span className="truncate max-w-[120px]">
                            {cam.source}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-zinc-400">
                          {cam.count}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#00e5a0] font-semibold">
                          {cam.revenue}
                        </td>
                        <td className="py-2.5 text-right font-mono text-zinc-500">
                          {cam.conversion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-xs text-zinc-500 py-8 italic text-center font-mono">
                  No referrals recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Integration Guide ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d12] overflow-hidden">
        <TerminalBar label="revenue · integration guide" />
        <div className="p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#00e5a0] flex items-center gap-1.5 font-mono">
            <DollarSign className="w-4 h-4" />
            How to Track Revenue
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed mb-3 font-light">
            Pass a numeric{" "}
            <code className="text-[#00e5a0] font-mono bg-[#00e5a0]/10 px-1 rounded">
              amount
            </code>{" "}
            key inside the{" "}
            <code className="text-[#00e5a0] font-mono bg-[#00e5a0]/10 px-1 rounded">
              metadata
            </code>{" "}
            object of any event to have it counted as revenue. To populate the Revenue by Referrer graph, also include a{" "}
            <code className="text-[#00e5a0] font-mono bg-[#00e5a0]/10 px-1 rounded">
              source
            </code>{" "}
            or{" "}
            <code className="text-[#00e5a0] font-mono bg-[#00e5a0]/10 px-1 rounded">
              metadata.source
            </code>{" "}
            field:
          </p>
          <pre className="text-[10px] font-mono p-4 bg-[#13131a] rounded-lg border border-[#1e1e2e] text-[#00e5a0] overflow-x-auto">
            {`await trackEvent("YOUR_API_KEY", "purchase", {\n  metadata: {\n    plan: "pro",\n    amount: 49.99  // ← required for revenue graphs\n  },\n  source: {\n    referrer: "https://twitter.com/..."  // ← required for referrer breakdown\n  }\n});`}
          </pre>
        </div>
      </div>
    </div>
  );
}

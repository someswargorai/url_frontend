"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Copy, Terminal, Code2, Server,
  CheckCircle2, Package, Globe, Cpu, Scissors
} from "lucide-react";
import {
  Accordion, AccordionContent,
  AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";

// ── CodeBlock ──────────────────────────────────────────────────────────────────
function CodeBlock({ code, id }: { code: string; id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg overflow-hidden group"
      style={{ background: "#060608", border: "1px solid #1e1e2e" }}
    >
      {/* topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: "#13131a", borderColor: "#1e1e2e" }}
      >
        <div className="flex gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <Button
          size="icon"
          className="h-6 w-6 rounded-md border-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,229,160,0.1)", color: "#00e5a0" }}
          onClick={handleCopy}
        >
          {copied
            ? <CheckCircle2 className="h-3 w-3" />
            : <Copy className="h-3 w-3" />
          }
        </Button>
      </div>
      <pre className="p-5 text-xs font-mono overflow-x-auto leading-relaxed"
        style={{ color: "#a0a0b8" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── method badge ───────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    POST: "#00e5a0", GET: "#7c6df0", DELETE: "#ff5050",
  };
  return (
    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded"
      style={{
        background: `${colors[method] ?? "#00e5a0"}15`,
        color: colors[method] ?? "#00e5a0",
        border: `1px solid ${colors[method] ?? "#00e5a0"}30`,
      }}
    >
      {method}
    </span>
  );
}

// ── param table ────────────────────────────────────────────────────────────────
function ParamTable({ rows, cols }: {
  rows: Record<string, string>[];
  cols: string[];
}) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #1e1e2e" }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: "#13131a", borderBottom: "1px solid #1e1e2e" }}>
            {cols.map(c => (
              <th key={c} className="px-4 py-2.5 text-left font-mono font-medium"
                style={{ color: "#6b6b85" }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid #1e1e2e" : "none" }}>
              {cols.map(c => (
                <td key={c} className="px-4 py-3 font-mono" style={{ color: "#a0a0b8" }}>
                  {c === "Required" ? (
                    <span className="px-2 py-0.5 rounded text-[9px]"
                      style={{
                        background: row[c] === "Yes" ? "rgba(0,229,160,0.08)" : "rgba(255,255,255,0.04)",
                        color: row[c] === "Yes" ? "#00e5a0" : "#6b6b85",
                        border: `1px solid ${row[c] === "Yes" ? "rgba(0,229,160,0.2)" : "#1e1e2e"}`,
                      }}
                    >
                      {row[c]}
                    </span>
                  ) : (
                    row[c]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── section heading ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px w-4" style={{ background: "#00e5a0" }} />
      <span className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color: "#6b6b85" }}
      >
        {children}
      </span>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function DocumentationPage() {
  const tabItems = [
    { value: "overview",       icon: Globe,    label: "Overview"       },
    { value: "installation",   icon: Package,  label: "Installation"   },
    { value: "usage",          icon: Cpu,      label: "Quick Start"    },
    { value: "event-tracking", icon: Terminal, label: "Event Tracking" },
    { value: "api",            icon: Server,   label: "API Reference"  },
  ];

  return (
    <div
      id="docs"
      className="min-h-screen"
      
    >
      <div className="container mx-auto py-1 px-4 md:px-8 lg:px-12 max-w-7xl">

        {/* header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-8" style={{ background: "#00e5a0" }} />
            <span className="font-mono text-[11px] tracking-widest uppercase"
              style={{ color: "#00e5a0" }}
            >
              developer docs
            </span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded ml-1"
              style={{ background: "rgba(124,109,240,0.1)", color: "#7c6df0", border: "1px solid rgba(124,109,240,0.2)" }}
            >
              v1.0.2
            </span>
          </div>

          <h1 className="font-bold leading-none tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-2px" }}
          >
            Developer
            <br />
            <span style={{ color: "#00e5a0" }}>Documentation</span>
          </h1>
          <p className="font-mono text-xs leading-relaxed max-w-lg"
            style={{ color: "#6b6b85" }}
          >
            Integrate URL shortening and analytics into your application via our
            NPM package or REST API.
          </p>
        </div>

        {/* tabs */}
        <Tabs defaultValue="overview" className="w-full">
          {/* tab list */}
          <div className="rounded-md border mb-8 overflow-hidden"
            style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
          >
            <TabsList className="flex w-full h-[50px]! p-0 bg-transparent rounded-sm gap-0">
              {tabItems.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-none
                      font-mono text-[11px] transition-all duration-150 border-0
                      data-[state=active]:bg-transparent data-[state=active]:shadow-none
                      data-[state=inactive]:text-muted-foreground"
                    style={{
                      borderRight: i < tabItems.length - 1 ? "1px solid #1e1e2e" : "none",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white" strokeWidth={1.5} />
                    <span className="hidden sm:inline text-white">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
            >
              <div className="px-6 py-5 border-b" style={{ borderColor: "#1e1e2e" }}>
                <h2 className="font-semibold tracking-tight mb-1 text-white">Welcome to Shorty</h2>
                <p className="font-mono text-[11px]" style={{ color: "#6b6b85" }}>
                  The easiest way to integrate URL shortening and analytics.
                </p>
              </div>
              <div className="p-6 space-y-6">
                <p className="font-mono text-xs leading-relaxed" style={{ color: "#6b6b85" }}>
                  Whether you&apos;re building a social media platform, SMS tool, or need tidy links —
                  our developer ecosystem gives you the flexibility you need via NPM or REST API.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { icon: Package,  title: "NPM Package",  desc: "Plug-and-play SDK for your Node.js backend.", accent: "#00e5a0" },
                    { icon: Server,   title: "REST API",     desc: "Language-agnostic endpoints for any stack.",  accent: "#7c6df0" },
                    { icon: Code2,    title: "Analytics",    desc: "IPs, devices, location, click volume.",        accent: "#00e5a0" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title}
                        className="rounded-lg p-4 space-y-3"
                        style={{ background: "#13131a", border: "1px solid #1e1e2e" }}
                      >
                        <div className="p-2 rounded-lg w-fit"
                          style={{ background: `${item.accent}10`, border: `1px solid ${item.accent}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: item.accent }} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm mb-1 text-white">{item.title}</p>
                          <p className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Installation ── */}
          <TabsContent value="installation" className="space-y-4">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b"
                style={{ background: "#13131a", borderColor: "#1e1e2e" }}
              >
                <Terminal className="h-4 w-4" style={{ color: "#00e5a0" }} strokeWidth={1.5} />
                <div>
                  <p className="font-semibold text-sm text-white">NPM Installation</p>
                  <p className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                    Install the official package into your Node.js project.
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <SectionLabel>npm</SectionLabel>
                  <CodeBlock id="install-npm" code="npm i shorty-analytics-sdk" />
                </div>
                <div>
                  <SectionLabel>yarn</SectionLabel>
                  <CodeBlock id="install-yarn" code="yarn add shorty-analytics-sdk" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Quick Start ── */}
          <TabsContent value="usage" className="space-y-4">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{ background: "#13131a", borderColor: "#1e1e2e" }}
              >
                <div>
                  <p className="font-semibold text-sm text-white">Quick Start Guide</p>
                  <p className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                    Shorten a URL using the SDK.
                  </p>
                </div>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded"
                  style={{ background: "rgba(0,229,160,0.08)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.2)" }}
                >
                  Node.js
                </span>
              </div>
              <div className="p-6 space-y-4">
                <p className="font-mono text-xs" style={{ color: "#6b6b85" }}>
                  Import <code style={{ color: "#00e5a0" }}>createShortUrl</code>, pass the original URL
                  and your API key. Manage keys from your dashboard.
                </p>
                <CodeBlock
                  id="usage-js"
                  code={`const { createShortUrl } = require("shorty-analytics-sdk");

async function generateShortLink() {
  const apiKey = "YOUR_API_KEY";
  const longUrl = "https://your-very-long-url.com/path?query=123";

  try {
    const response = await createShortUrl(longUrl, apiKey);
    console.log("Short URL ID:", response.url);
    console.log("Full Link: https://yourdomain.com/" + response.url);
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

generateShortLink();`}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Event Tracking ── */}
          <TabsContent value="event-tracking" className="space-y-4">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{ background: "#13131a", borderColor: "#1e1e2e" }}
              >
                <div>
                  <p className="font-semibold text-sm text-white">Event Tracking Integration</p>
                  <p className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                    Track custom events with automatic metadata enrichment.
                  </p>
                </div>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded"
                  style={{ background: "rgba(124,109,240,0.08)", color: "#7c6df0", border: "1px solid rgba(124,109,240,0.2)" }}
                >
                  Node.js / REST
                </span>
              </div>

              <div className="p-6 space-y-8">
                {/* step 1 */}
                <div>
                  <SectionLabel>01 · SDK usage</SectionLabel>
                  <p className="font-mono text-[11px] mb-4" style={{ color: "#6b6b85" }}>
                    Import <code style={{ color: "#00e5a0" }}>trackEvent</code> from{" "}
                    <code style={{ color: "#7c6df0" }}>shorty-analytics-sdk</code>.
                  </p>
                  <CodeBlock
                    id="event-sdk"
                    code={`const { trackEvent } = require("shorty-analytics-sdk");

async function captureUserBehavior() {
  const projectKey = "pk_your_project_key_here";

  try {
    await trackEvent(projectKey, {
      event: "product_purchased",
      userId: "user_9942",
      notification: true,
      metadata: {
        item: "Nike Pegasus 40",
        price: 120.00,
        currency: "USD"
      }
    });
    console.log("Event captured!");
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

captureUserBehavior();`}
                  />
                </div>

                {/* step 2 */}
                <div>
                  <SectionLabel>02 · REST endpoint</SectionLabel>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
                    style={{ background: "#13131a", border: "1px solid #1e1e2e" }}
                  >
                    <MethodBadge method="POST" />
                    <code className="font-mono text-xs" style={{ color: "#a0a0b8" }}>
                      /event/track
                    </code>
                    <span className="ml-auto font-mono text-[9px] px-2 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#6b6b85", border: "1px solid #1e1e2e" }}
                    >
                      Public
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-mono text-[10px] mb-2" style={{ color: "#6b6b85" }}>
                         headers
                      </p>
                      <ParamTable
                        cols={["Header", "Value", "Required"]}
                        rows={[
                          { Header: "x-project-key",  Value: "Your project API Key", Required: "Yes" },
                          { Header: "Content-Type",   Value: "application/json",     Required: "Yes" },
                        ]}
                      />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] mb-2" style={{ color: "#6b6b85" }}>
                         body parameters
                      </p>
                      <ParamTable
                        cols={["Parameter", "Type", "Required", "Description"]}
                        rows={[
                          { Parameter: "event",       Type: "string", Required: "Yes", Description: "Event name e.g. signup" },
                          { Parameter: "userId",      Type: "string", Required: "No",  Description: "Your internal user ID" },
                          { Parameter: "anonymousId", Type: "string", Required: "No",  Description: "ID for guest visitors" },
                          { Parameter: "metadata",    Type: "object", Required: "No",  Description: "Arbitrary key-value context" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── API Reference ── */}
          <TabsContent value="api" className="space-y-4">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "#0d0d12", borderColor: "#1e1e2e" }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{ background: "#13131a", borderColor: "#1e1e2e" }}
              >
                <div>
                  <p className="font-semibold text-sm">Create Short URL</p>
                  <p className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                    Direct REST endpoint for shortening links.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                    /api/v1/shorten
                  </code>
                </div>
              </div>

              <div className="p-4">
                <Accordion type="single" collapsible defaultValue="request" className="space-y-2 border-0">
                  {[
                    {
                      value: "request",
                      label: "Request configuration",
                      content: (
                        <div className="space-y-4 pt-2">
                          <div>
                            <SectionLabel>headers</SectionLabel>
                            <ParamTable
                              cols={["Header", "Value", "Required"]}
                              rows={[
                                { Header: "Authorization", Value: "Bearer <YOUR_API_KEY>", Required: "Yes" },
                                { Header: "Content-Type",  Value: "application/json",      Required: "Yes" },
                              ]}
                            />
                          </div>
                          <div>
                            <SectionLabel>body</SectionLabel>
                            <CodeBlock
                              id="api-body"
                              code={`{\n  "url": "https://example.com/very/long/path"\n}`}
                            />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: "response",
                      label: "Response handling",
                      content: (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: "#00e5a0" }} />
                            <span className="font-mono text-[11px]" style={{ color: "#00e5a0" }}>
                              200 OK
                            </span>
                          </div>
                          <CodeBlock
                            id="api-response"
                            code={`{\n  "url": "B1x9K"\n}`}
                          />
                          <p className="font-mono text-[10px]" style={{ color: "#6b6b85" }}>
                            On failure, a standard error object is returned with the corresponding
                            HTTP status code (401, 500, etc).
                          </p>
                        </div>
                      ),
                    },
                  ].map((item) => (
                    <AccordionItem
                      key={item.value}
                      value={item.value}
                      className="rounded-lg border px-4 overflow-hidden"
                      style={{ background: "#13131a", borderColor: "#1e1e2e" }}
                    >
                      <AccordionTrigger className="hover:no-underline py-3.5">
                        <span className="font-mono text-xs" style={{ color: "#a0a0b8" }}>
                          {item.label}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {item.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
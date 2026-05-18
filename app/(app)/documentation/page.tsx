"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Terminal, Code2, Server, CheckCircle2, Package, Globe, Cpu } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function CodeBlock({ code, language = "javascript", id }: { code: string; language?: string; id: string }) {
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative rounded-lg bg-zinc-950 p-4 border border-zinc-800/50 shadow-inner group">
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    onClick={handleCopy}
                >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function DocumentationPage() {

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 lg:px-12 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 space-y-4 text-center md:text-left relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
                <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm border-primary/20 text-primary mb-4">
                    <Code2 className="w-4 h-4 mr-2 inline-block" /> v1.0.0
                </Badge>
                <p className="text-xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
                    Developer Documentation 
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    Integrate our lightning-fast URL shortening service directly into your application using our NPM package or REST API.
                </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 p-1 bg-transparent md:bg-muted/50 backdrop-blur-sm rounded-xl h-[48px]!">
                    <TabsTrigger value="overview" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Globe className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
                    <TabsTrigger value="installation" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Package className="w-4 h-4 mr-2" /> Installation</TabsTrigger>
                    <TabsTrigger value="usage" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Cpu className="w-4 h-4 mr-2" /> Quick Start</TabsTrigger>
                    <TabsTrigger value="event-tracking" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Terminal className="w-4 h-4 mr-2" /> Event Tracking</TabsTrigger>
                    <TabsTrigger value="api" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Server className="w-4 h-4 mr-1" /> API Reference</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-13 md:mt-4">
                    <Card className="border-primary/10 shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">Welcome to Shorty</CardTitle>
                            <CardDescription className="text-base">
                                The easiest way to integrate URL shortening and robust link analytics into your software.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Whether you are building a social media management platform, an SMS marketing tool, or just need to keep your links tidy, our developer ecosystem gives you the flexibility you need. You can interact with our service using our official Node.js package or by integrating directly with our RESTful API.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 pt-4">
                                <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold">NPM Package</h3>
                                    <p className="text-sm text-muted-foreground">Plug and play SDK for your Node.js backend.</p>
                                </div>
                                <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold">REST API</h3>
                                    <p className="text-sm text-muted-foreground">Language agnostic API endpoints for any stack.</p>
                                </div>
                                <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Code2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold">Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Track IPs, devices, location, and click volume.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="installation" className="space-y-6 mt-13 md:mt-4">
                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="flex items-center text-xl">
                                <Terminal className="w-5 h-5 mr-2 text-primary" />
                                NPM Installation
                            </CardTitle>
                            <CardDescription>Install the official package into your Node.js project.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground mb-4">
                                The easiest way to use our API is by installing the <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">shorty_package</code>.
                            </p>
                            <CodeBlock
                                id="install-npm"
                                language="bash"
                                code="npm install shorty_package"
                            />
                            <p className="text-muted-foreground mt-6 mb-4">Or with yarn:</p>
                            <CodeBlock
                                id="install-yarn"
                                language="bash"
                                code="yarn add shorty_package"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6 mt-13 md:mt-4">
                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Quick Start Guide</CardTitle>
                                    <CardDescription className="mt-1">How to shorten a URL using the SDK.</CardDescription>
                                </div>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Node.js</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <p className="text-muted-foreground">
                                To create a short URL, import the <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">createShortUrl</code> function, and pass it the original URL and your secret API Key. You can manage your API keys from the Dashboard.
                            </p>
                            <CodeBlock
                                id="usage-js"
                                language="javascript"
                                code={`const { createShortUrl } = require("shorty_package");

async function generateShortLink() {
const apiKey = "YOUR_API_KEY"; // Retrieve this from your environment variables
const longUrl = "https://your-very-long-and-complex-url.com/path?query=123";

try {
const response = await createShortUrl(longUrl, apiKey);
                                                
// The response object contains the shortened URL identifier
console.log("Success! Short URL ID:", response.url);
console.log("Full Link: https://yourdomain.com/" + response.url);
                                                
} catch (error) {
console.error("Failed to shorten link:", error.message);
}
}

generateShortLink();`}
    />
                        </CardContent>
                       
                    </Card>
                </TabsContent>

                <TabsContent value="event-tracking" className="space-y-6 mt-13 md:mt-4">
                    <Card className="border-border/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Event Tracking Integration</CardTitle>
                                    <CardDescription className="mt-1">Track custom events with automatic metadata enrichment.</CardDescription>
                                </div>
                                <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">Node.js / REST</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <p className="text-muted-foreground leading-relaxed">
                                Our platform supports seamless, real-time behavioral analytics tracking. When you register a <strong>Project</strong> in the dashboard, you receive a Project API Key. You can use this key with our SDK or call our public ingestion endpoint directly to track clicks, signups, transactions, and other actions.
                            </p>
                            
                            <div>
                                <h3 className="text-md font-semibold mb-2">1. Initialize the Event Ingestion</h3>
                                <p className="text-muted-foreground mb-4">
                                    Import the <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">trackEvent</code> function from the <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">shorty_package</code>.
                                </p>
                                <CodeBlock
                                    id="event-sdk-usage"
                                    language="javascript"
                                    code={`const { trackEvent } = require("shorty_package");

async function captureUserBehavior() {
  const projectKey = "pk_your_project_key_here";

  try {
    await trackEvent(projectKey, {
      event: "product_purchased",
      userId: "user_9942", // Optional: Link this to your internal user identifier
      notification: true, // Optional: Send email notification to the project owner
      metadata: { 
        item: "Nike Pegasus 40",
        price: 120.00,
        currency: "USD"
      }
    });
    console.log("Event captured successfully!");
  } catch (error) {
    console.error("Failed to capture event:", error.message);
  }
}

captureUserBehavior();`}
                                />
                            </div>

                            <div className="pt-4">
                                <h3 className="text-md font-semibold mb-2">2. REST Ingestion API</h3>
                                <p className="text-muted-foreground mb-4">
                                    If you are not using our Node.js SDK, you can send HTTP POST requests directly to our ingestion endpoint:
                                </p>
                                <div className="p-3 bg-muted/30 border border-border/50 rounded-md flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-indigo-500 hover:bg-indigo-600">POST</Badge>
                                        <code className="text-sm font-mono text-foreground">/event/track</code>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">Public</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-foreground font-mono">Headers</h4>
                                        <div className="rounded-md border border-border/50 bg-muted/20 overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-muted/50 text-muted-foreground">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium">Header</th>
                                                        <th className="px-4 py-2 font-medium">Value</th>
                                                        <th className="px-4 py-2 font-medium">Required</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-xs">x-project-key</td>
                                                        <td className="px-4 py-3">Your project&apos;s API Key</td>
                                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">Yes</Badge></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-xs">Content-Type</td>
                                                        <td className="px-4 py-3">application/json</td>
                                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">Yes</Badge></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-foreground font-mono font-semibold">Body Parameters</h4>
                                        <div className="rounded-md border border-border/50 bg-muted/20 overflow-hidden">
                                            <table className="w-full text-sm text-left font-sans">
                                                <thead className="bg-muted/50 text-muted-foreground">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium">Parameter</th>
                                                        <th className="px-4 py-2 font-medium">Type</th>
                                                        <th className="px-4 py-2 font-medium">Required</th>
                                                        <th className="px-4 py-2 font-medium">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-xs">event</td>
                                                        <td className="px-4 py-3 font-mono text-xs">string</td>
                                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">Yes</Badge></td>
                                                        <td className="px-4 py-3">The name of the tracking event (e.g., &quot;signup&quot;)</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-xs">userId</td>
                                                        <td className="px-4 py-3 font-mono text-xs">string</td>
                                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">No</Badge></td>
                                                        <td className="px-4 py-3">Your internal authenticated user ID</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-xs">anonymousId</td>
                                                        <td className="px-4 py-3 font-mono text-xs">string</td>
                                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">No</Badge></td>
                                                        <td className="px-4 py-3">Unique tracking ID for anonymous guest visitors</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-xs">metadata</td>
                                                        <td className="px-4 py-3 font-mono text-xs">object</td>
                                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">No</Badge></td>
                                                        <td className="px-4 py-3">Any arbitrary key-value pairs of business logic context</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-6 mt-13 md:mt-4">
                    <Card className="border-border/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Create Short URL</CardTitle>
                                    <CardDescription className="mt-1">Direct REST API endpoint for shortening links.</CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">POST</Badge>
                                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">/api/v1/shorten</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Accordion type="single" collapsible className="w-full" defaultValue="request">
                                <AccordionItem value="request" className="border-b-0 border border-border/50 rounded-t-lg px-4 bg-background">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <span className="font-semibold text-sm">Request Configuration</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2 text-foreground">Headers</h4>
                                                <div className="rounded-md border border-border/50 bg-muted/20 overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-muted/50 text-muted-foreground">
                                                            <tr>
                                                                <th className="px-4 py-2 font-medium">Header</th>
                                                                <th className="px-4 py-2 font-medium">Value</th>
                                                                <th className="px-4 py-2 font-medium">Required</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50">
                                                            <tr>
                                                                <td className="px-4 py-3 font-mono text-xs">Authorization</td>
                                                                <td className="px-4 py-3">Bearer &lt;YOUR_API_KEY&gt;</td>
                                                                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">Yes</Badge></td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-3 font-mono text-xs">Content-Type</td>
                                                                <td className="px-4 py-3">application/json</td>
                                                                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">Yes</Badge></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-2 text-foreground">Body Data</h4>
                                                <CodeBlock
                                                    id="api-body"
                                                    language="json"
                                                    code={`{
  "url": "https://example.com/very/long/path/to/resource"
}`}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="response" className="border-t-0 border border-border/50 rounded-b-lg px-4 bg-background">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <span className="font-semibold text-sm">Response Handling</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-sm font-medium text-emerald-500">200 OK</span>
                                            </div>
                                            <CodeBlock
                                                id="api-response"
                                                language="json"
                                                code={`{
  "url": "B1x9K"
}`}
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                If the request fails, a standard error object will be returned with a corresponding HTTP status code (e.g., 401 Unauthorized, 500 Server Error).
                                            </p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

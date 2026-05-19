"use client";

import { motion } from "framer-motion";
import { Globe, Smartphone, Users, MapPin, MousePointerClick } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnalyticsSection() {
  return (
    <section id="analytics" className="py-12 md:py-24 bg-secondary/30 px-1.5 md:px-10">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-8">
            <Badge variant="outline" className="px-4 py-1 border-gray-100 text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">
              Real-time Insights
            </Badge>
            <h2 className="text-2xl md:text-5xl font-bold leading-tight">
              Know exactly who is <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">clicking your links.</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              Our advanced analytics engine strips away the mystery. Get granular data 
              on every interaction without compromising user privacy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <MapPin />, label: "Geo-Location", text: "Track clicks by country and city." },
                { icon: <Smartphone />, label: "Device Data", text: "iOS, Android, or Desktop distribution." },
                { icon: <Users />, label: "Referrer Info", text: "See where your traffic comes from." },
                { icon: <MousePointerClick />, label: "Conversion", text: "Measure link click-through rates." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-primary mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-bold">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOCK ANALYTICS DASHBOARD */}
          <div className="flex-1 w-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-md"
            >
              <Card className="rounded-md border-none shadow-2xl bg-card/90 backdrop-blur-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4 border-border/50">
                    <span className="font-bold">Link Analytics</span>
                    <Badge className="bg-green-500/10 text-green-500 border-none">Live</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Clicks</span>
                      <span className="font-bold">12,482</span>
                    </div>
                    <div className="h-2 w-full text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        whileInView={{ width: "70%" }} 
                        className="h-full bg-linear-to-r from-primary via-violet-500 to-fuchsia-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-tighter">USA</p>
                      <p className="text-xl font-bold">45%</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-tighter">Mobile</p>
                      <p className="text-xl font-bold">82%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ">
                    <Globe className="h-3 w-3" />
                    Updates every 2 seconds
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
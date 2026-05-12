"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Crown, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function PricingSection() {
  const benefits = [
    "Unlimited short links",
    "Custom branded shortcodes",
    "Full analytics dashboard",
    "QR code generator",
    "Priority support",
    "No monthly subscriptions"
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container px-4 mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, honest pricing.</h2>
          <p className="text-muted-foreground text-lg text-balance">
            One single payment. Lifetime access. No hidden fees or recurring subscriptions.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
         
          className="max-w-md mx-auto"
        >
          <Card className="relative border border-gray-100 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Ribbon */}
            <div className="absolute top-0 right-0">
              <motion.div 
              initial={{x:70, y:100}}
              whileInView={{x:35, y:0}}
               transition={{ duration: 0.3 }}              
              className="bg-primary text-primary-foreground text-[10px] font-bold uppercase py-1 px-10 rotate-45">
                Lifetime
              </motion.div>
            </div>

            <CardHeader className="pt-10 pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Crown className="h-8 w-8 *:text-fuchsia-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold italic">The Pro Plan</h3>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold tracking-tight">$1</span>
                <span className="text-muted-foreground font-medium">/ lifetime</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-8 pb-8 text-left">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="px-8 pb-10">
              <Button className="w-full h-14 text-lg font-bold rounded-md group shadow-lg shadow-primary/20">
                Get Access Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
          
         
        </motion.div>
      </div>
    </section>
  );
}
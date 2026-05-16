"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scissors,
  Link2,
  BookOpen,
  Coffee,
  ChevronRight,
  Globe,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";

const menuItems = [
  {
    title: "Shorten URL",
    href: "/shorten-url",
    icon: Scissors,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: Globe,
  },
  {
    title: "My URLs",
    href: "/urls",
    icon: Link2,
  },
  {
    title: "Api Key",
    href: "/apikey",
    icon: Globe
  },
  {
    title: "Documentation",
    href: "/documentation",
    icon: BookOpen,
  },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col">
      {/* Brand header – visible inside mobile sheet */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border/40 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-lg backdrop-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/10 group-hover:rotate-12 transition-transform">
            <Scissors className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pl-30 md:pl-0"> 
            Shorty.
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 pt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "group flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full" />
                )}

                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />

                <span className="font-semibold text-sm tracking-wide">
                  {item.title}
                </span>

                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Donation */}
      <div className="p-4">
        <Card className="border-none overflow-hidden relative">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg">
                <Coffee className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold">Support Shorty</p>

                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest">
                  Buy us a coffee
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Help us keep the servers running and the links short.
            </p>

            <Button
              size="sm"
              className="w-full bg-black hover:bg-black text-white font-bold rounded-lg p-4"
            >
              Donate $5.00
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-border/50">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-xl transition-colors">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-bold truncate w-full text-left">
              {session?.user?.name}
            </span>

            <span className="text-xs text-muted-foreground truncate w-full text-left">
              {session?.user?.email}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
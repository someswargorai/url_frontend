"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./theme-toggle";
import { GithubIcon } from "../icons";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const logout = async () => {
    await signOut();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all dark:bg-[rgba(6,6,8,0.85)] backdrop-blur-lg dark:border-b dark:border-[rgba(30,30,46,0.8)] ",
        ["/", "/login"].includes(pathname) ? "block" : "hidden"
      )}
      
    >
      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #00e5a040, transparent)" }}
      />

      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* logo */}
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
              className="font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "18px",
                letterSpacing: "-0.5px",
              }}
            >
              Shorty<span style={{ color: "#00e5a0" }}>.</span>
            </span>
          </Link>

          {/* nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Features",      href: "/#features"  },
              { label: "Analytics",     href: "/#analytics" },
              { label: "Pricing",       href: "/#pricing"   },
              { label: "Documentation", href: "/#docs"      },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-mono text-xs text-muted-foreground transition-colors duration-200 px-3 py-1.5 rounded-md"
                style={{ letterSpacing: "0.01em" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#00e5a0";
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,229,160,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "";
                  (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* actions */}
          <div className="flex items-center gap-2">
            {/* github */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-8 w-8 rounded-lg p-0 border border-gray-200"
              asChild
            >
              <Link href="https://github.com/someswargorai/url_frontend.git" target="_blank">
                <GithubIcon className="size-4" />
              </Link>
            </Button>

            <ModeToggle />

            {/* divider */}
            <div className="h-5 w-px mx-1" style={{ background: "#1e1e2e" }} />

            {session ? (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-lg p-0 h-8 w-8"
                >
                  <Link href="/shorten-url">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback
                        className="text-xs rounded-lg font-mono"
                        style={{ background: "rgba(0,229,160,0.1)", color: "#00e5a0" }}
                      >
                        {session?.user?.name?.charAt(0).toUpperCase() || ""}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>

                <Button
                  onClick={logout}
                  size="sm"
                  className="h-8 px-4 rounded-full text-xs border-0 cursor-pointer"
                  style={{
                   
                   
                    border: "1px solid rgba(255,80,80,0.15)",
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="h-8 px-5 rounded-full text-xs border-0 cursor-pointer gap-1.5"
                 
                >
                  Sign In
                  <span style={{ opacity: 0.6 }}>→</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
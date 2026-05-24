"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
// import { GithubIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { signOut } from "next-auth/react";
import { GithubIcon } from "@/app/icons";
import { ModeToggle } from "@/app/common/theme-toggle";

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm transition-all">
            <div className="px-4"> 
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
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

                    {/* Actions Section */}
                    <div className="flex items-center gap-3">
                       <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-8 w-8 rounded-lg p-0"
              style={{ border: "1px solid #1e1e2e" }}
              asChild
            >
              <Link href="https://github.com/someswargorai/url_frontend.git" target="_blank">
                <GithubIcon className="size-4" />
              </Link>
            </Button>

                        <ModeToggle />

                        <div className="h-6 w-[1px] bg-border/60 mx-1 hidden sm:block" />

                        <Button className="SignButton hidden sm:flex rounded-full font-semibold py-4.5! px-6 shadow-md hover:shadow-primary/20 transition-all active:scale-95 cursor-pointer">
                            <div onClick={async () => {
                                await signOut();
                            }}>Logout</div>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
// import { GithubIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./theme-toggle";
import { GithubIcon } from "../icons";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {

  const { data: session } = useSession();
  const pathname = usePathname();

  const logout = async () => {
    await signOut();
  };

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all", ["/", "/login"].includes(pathname) ? "block" : "hidden")}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/10 group-hover:rotate-12 transition-transform">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">
              Shorty.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#analytics"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex rounded-full"
              asChild
            >
              <Link href="https://github.com/someswargorai/url_frontend.git" target="_blank">
                <GithubIcon className="size-8" />
              </Link>
            </Button>

            <ModeToggle />

            <div className="h-6 w-[1px] bg-border/60 mx-1 hidden sm:block" />

            {session ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={logout}
                  className="SignButton hidden sm:flex rounded-full font-semibold py-4.5! px-6 shadow-md hover:shadow-primary/20 transition-all active:scale-95 cursor-pointer"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href={"/login"}>
                <Button className="SignButton hidden sm:flex rounded-full font-semibold py-4.5! px-6 shadow-md hover:shadow-primary/20 transition-all active:scale-95 cursor-pointer">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
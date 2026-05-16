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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/10 group-hover:rotate-12 transition-transform">
                            <Scissors className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500">
                            Shorty.
                        </span>
                    </Link>

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
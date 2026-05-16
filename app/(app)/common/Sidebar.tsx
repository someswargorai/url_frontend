"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SidebarContent } from "./SidebarContent";

export function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>

            <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-72 border-r border-border/50 bg-card/50 backdrop-blur-xl flex-col">
                <SidebarContent />
            </aside>

            <button
                className="md:hidden fixed left-4 top-3.5 z-[60] flex size-10 items-center justify-center rounded-md  bg-background/90 backdrop-blur-sm  transition-all hover:bg-accent"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
            >
                <Menu className="h-4 w-4" />
            </button>
        </>
    );
}
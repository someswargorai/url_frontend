"use client";

import { Navbar } from "./common/Navbar";
import { Sidebar } from "./common/Sidebar";
import { FloatingChatbot } from "@/components/FloatingChatbot";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex ">
        
      <Sidebar />

      <div className="w-full relative">
        <Navbar />

        <main className="mt-20 h-screen md:pl-72">
        <div className="container p-0 md:p-8">
          {children}
        </div>
      </main>
      
      <FloatingChatbot />
      </div>
    </div>
  );
}
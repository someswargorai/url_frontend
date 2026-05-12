"use client";

import { Navbar } from "./common/Navbar";
import { Sidebar } from "./common/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex ">
        
      <Sidebar />

      <div className="w-full">
        <Navbar />

        <main className="mt-20 h-screen md:pl-72">
        <div className="container p-0 md:p-8">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}
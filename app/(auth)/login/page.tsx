"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

import {
  GithubIcon,
  GoogleIcon,
  LinkedinIcon,
} from "@/app/icons";

import { Scissors } from "lucide-react";

export default function Login() {
  const handleSocialLogin = (
    provider: "google" | "github" | "linkedin"
  ) => {
    signIn(provider, { callbackUrl: "/shorten-url" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl " />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md"
      >
        {/* Glass Card */}
        <div className="rounded-3xl bg-background/70 p-6">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="flex h-15 w-15 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                <Scissors className="size-7 text-primary-foreground" />
              </div>
            </motion.div>


            <h1 className="text-2xl font-bold tracking-tight mt-3">
                Your links deserve better.
            </h1>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Continue with <span className="text-transparent bg-clip-text bg-linear-to-l from-primary via-violet-500 to-fuchsia-500">Google, GitHub, or LinkedIn</span> and jump into <span className="font-bold text-primary">Shorty.</span>
            </p>
          </div>

          {/* Providers */}
          <div className="space-y-4">
            {/* Google */}
            <motion.button
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin("google")}
              className="group flex w-full items-center justify-center gap-3 rounded-md border border-border/60 bg-background/80 px-4 py-4 text-sm font-medium shadow-sm transition-all hover:bg-accent cursor-pointer"
            >
              <GoogleIcon className="size-5 transition-transform group-hover:scale-110" />

              <span>Continue with Google</span>
            </motion.button>

            {/* GitHub */}
            <motion.button
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin("github")}
              className="group flex w-full items-center justify-center gap-3 rounded-md border border-border/60 bg-background/80 px-4 py-4 text-sm font-medium shadow-sm transition-all  hover:bg-accent cursor-pointer"
            >
              <GithubIcon className="size-5 transition-transform group-hover:scale-110" />

              <span>Continue with GitHub</span>
            </motion.button>

            {/* LinkedIn */}
            <motion.button
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin("linkedin")}
              className="group flex w-full items-center justify-center gap-3 rounded-md border border-border/60 bg-background/80 px-4 py-4 text-sm font-medium shadow-sm transition-all  hover:bg-accent cursor-pointer"
            >
              <LinkedinIcon className="size-4 ml-3 transition-transform group-hover:scale-110" />

              <span>Continue with LinkedIn</span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Secure Authentication
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>        
        </div>

        {/* Bottom subtle text */}
        <div className=" rounded-2xl p-2  border border-border/60 bg-background/30 ">
            <p className="text-center text-xs   text-transparent bg-clip-text bg-linear-to-l from-primary via-violet-500 to-fuchsia-500 ">
              Protected by enterprise-grade authentication
            </p>
        </div>
      </motion.div>
    </div>
  );
}
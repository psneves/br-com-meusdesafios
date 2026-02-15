"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const logoSrc = mounted && resolvedTheme === "light"
    ? "/logo-light-512.png"
    : "/logo-512x512.png";

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Top app bar */}
      <nav className="shrink-0 z-40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:bg-[#111] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <div className="mx-auto flex h-11 max-w-5xl items-center px-4 md:h-12">
          <Link href="/today" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-lg">
            <Image
              src={logoSrc}
              alt="Meus Desafios"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
              priority
            />
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
              Meus Desafios
            </span>
          </Link>
        </div>
      </nav>

      {/* Main content — scrollable area between header and tab bar */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-3 py-2 md:px-4 md:py-6">{children}</div>
      </main>

      {/* Bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}

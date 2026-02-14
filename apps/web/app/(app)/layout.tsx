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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Top app bar */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800/60 dark:bg-black/90">
        <div className="mx-auto flex h-12 max-w-5xl items-center px-4 md:h-14">
          <Link href="/today" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-lg">
            <Image
              src={logoSrc}
              alt="Meus Desafios"
              width={36}
              height={36}
              className="h-8 w-8 rounded-lg md:h-9 md:w-9"
              priority
            />
            <span className="text-base font-bold text-gray-900 dark:text-white md:text-lg">
              Meus Desafios
            </span>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-3 py-2 pb-20 md:px-4 md:py-6 md:pb-24">{children}</main>

      {/* Bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}

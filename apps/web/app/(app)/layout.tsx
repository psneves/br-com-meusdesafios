"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

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
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800/60 dark:bg-black/90">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:h-16">
          <Link href="/today" className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-3 md:gap-5">
            <NavLink href="/today" label="Hoje" />
            <NavLink href="/leaderboard" label="Ranking" />
            <NavLink href="/profile" label="Perfil" />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-3 py-3 md:px-4 md:py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "text-xs font-medium transition-colors md:text-sm",
        isActive
          ? "text-sky-600 dark:text-sky-400"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

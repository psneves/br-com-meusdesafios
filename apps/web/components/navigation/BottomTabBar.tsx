"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/today", label: "Painel", icon: Home },
  { href: "/explore", label: "Explorar", icon: Compass },
  { href: "/leaderboard", label: "Posição", icon: Trophy },
  { href: "/profile", label: "Ajustes", icon: Settings },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Navegação principal"
      className="shrink-0 z-40 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-lg"
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive
                    ? "text-gray-900 dark:text-white stroke-[2.2]"
                    : "text-gray-400 dark:text-gray-500 stroke-[1.5]"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { Search, UserPlus, UserCheck, Clock, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock data ────────────────────────────────────────────

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  streak: number;
}

interface PendingRequest {
  id: string;
  name: string;
  username: string;
}

const mockSuggested: SuggestedUser[] = [
  {
    id: "1",
    name: "Ana Silva",
    username: "@anasilva",
    streak: 14,
  },
  {
    id: "2",
    name: "Carlos Mendes",
    username: "@carlosm",
    streak: 30,
  },
  {
    id: "3",
    name: "Julia Rocha",
    username: "@jurocha",
    streak: 7,
  },
];

const mockPending: PendingRequest[] = [
  {
    id: "4",
    name: "Rafael Costa",
    username: "@rafaelc",
  },
];

// ── Page ─────────────────────────────────────────────────

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());
  const [deniedRequests, setDeniedRequests] = useState<Set<string>>(new Set());

  const handleFollow = (userId: string) => {
    setSentRequests((prev) => new Set(prev).add(userId));
  };

  const handleAccept = (userId: string) => {
    setAcceptedRequests((prev) => new Set(prev).add(userId));
  };

  const handleDeny = (userId: string) => {
    setDeniedRequests((prev) => new Set(prev).add(userId));
  };

  const visiblePending = mockPending.filter(
    (r) => !acceptedRequests.has(r.id) && !deniedRequests.has(r.id)
  );

  return (
    <div className="space-y-phi-4 md:space-y-phi-5">
      {/* Search */}
      <div className="relative pt-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar pessoas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500"
        />
      </div>

      {/* Pending requests */}
      {visiblePending.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 px-phi-4 pt-phi-4 pb-phi-2">
            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Solicitações pendentes
            </h2>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              {visiblePending.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {visiblePending.map((user) => (
              <div key={user.id} className="flex items-center gap-phi-3 px-phi-4 py-phi-3">
                <DefaultAvatar name={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user.username}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(user.id)}
                    className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleDeny(user.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested people */}
      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between px-phi-4 pt-phi-4 pb-phi-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Pessoas sugeridas
          </h2>
          <button className="flex items-center gap-0.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
            Ver mais
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {mockSuggested.map((user) => {
            const isSent = sentRequests.has(user.id);
            return (
              <div key={user.id} className="flex items-center gap-phi-3 px-phi-4 py-phi-3">
                <DefaultAvatar name={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {user.username}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-[11px] font-medium text-amber-500 dark:text-amber-400">
                      {user.streak}d streak
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={isSent}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    isSent
                      ? "border border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500"
                      : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  )}
                >
                  {isSent ? (
                    <>
                      <UserCheck className="h-3 w-3" />
                      Enviado
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3" />
                      Seguir
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
];

function DefaultAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorIdx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        AVATAR_COLORS[colorIdx]
      )}
    >
      {initials}
    </div>
  );
}

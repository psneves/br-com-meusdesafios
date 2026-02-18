"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search,
  UserPlus,
  UserCheck,
  Clock,
  ChevronRight,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock data ────────────────────────────────────────────

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
}

interface PendingRequest {
  id: string;
  name: string;
  username: string;
}

const mockSuggested: SuggestedUser[] = [
  { id: "1", name: "Ana Silva", username: "@anasilva" },
  { id: "2", name: "Carlos Mendes", username: "@carlosm" },
  { id: "3", name: "Julia Rocha", username: "@jurocha" },
];

const mockPending: PendingRequest[] = [
  { id: "4", name: "Rafael Costa", username: "@rafaelc" },
];

const SWIPE_THRESHOLD = 80;
const TOAST_DURATION = 3000;

// ── Toast ────────────────────────────────────────────────

interface ToastData {
  message: string;
  variant: "success" | "neutral";
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl text-sm font-medium",
          toast.variant === "success"
            ? "bg-emerald-600 text-white dark:bg-emerald-700"
            : "bg-gray-700 text-white dark:bg-gray-600"
        )}
      >
        <span>{toast.message}</span>
        <button
          onClick={onDismiss}
          className="ml-1 rounded-full p-1 hover:bg-white/20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(
    new Set()
  );
  const [deniedRequests, setDeniedRequests] = useState<Set<string>>(
    new Set()
  );
  const [confirmingDeny, setConfirmingDeny] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleFollow = (userId: string) => {
    setSentRequests((prev) => new Set(prev).add(userId));
  };

  const handleAccept = useCallback((userId: string) => {
    setAcceptedRequests((prev) => new Set(prev).add(userId));
    setConfirmingDeny(null);
    setToast({ message: "Solicitação aceita", variant: "success" });
  }, []);

  const handleDenyRequest = (userId: string) => {
    setConfirmingDeny(userId);
  };

  const handleDenyConfirm = (userId: string) => {
    setDeniedRequests((prev) => new Set(prev).add(userId));
    setConfirmingDeny(null);
    setToast({ message: "Solicitação recusada", variant: "neutral" });
  };

  const handleDenyCancel = () => {
    setConfirmingDeny(null);
  };

  const clearToast = useCallback(() => setToast(null), []);

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
      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="px-phi-4 pt-phi-4 pb-phi-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Solicitações pendentes
            </h2>
            {visiblePending.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                {visiblePending.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            Ao aceitar, vocês passam a ver estatísticas um do outro.
          </p>
        </div>

        {visiblePending.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {visiblePending.map((user) => (
              <PendingRequestRow
                key={user.id}
                user={user}
                isConfirmingDeny={confirmingDeny === user.id}
                onAccept={handleAccept}
                onDenyRequest={handleDenyRequest}
                onDenyConfirm={handleDenyConfirm}
                onDenyCancel={handleDenyCancel}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-phi-4 py-phi-5 text-center">
            <Users className="h-8 w-8 text-gray-200 dark:text-gray-700" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Nenhuma solicitação pendente
            </p>
          </div>
        )}
      </section>

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
              <div
                key={user.id}
                className="flex items-center gap-phi-3 px-phi-4 py-phi-3"
              >
                <DefaultAvatar name={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user.username}{" "}
                    <span className="text-gray-300 dark:text-gray-600">
                      ·
                    </span>{" "}
                    Sugestão
                  </p>
                  <p className="text-[11px] text-gray-400/80 dark:text-gray-500/80">
                    Em comum: desafios similares
                  </p>
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

      {/* Toast */}
      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}

// ── Pending Request Row with swipe ──────────────────────

interface PendingRequestRowProps {
  user: PendingRequest;
  isConfirmingDeny: boolean;
  onAccept: (id: string) => void;
  onDenyRequest: (id: string) => void;
  onDenyConfirm: (id: string) => void;
  onDenyCancel: () => void;
}

function PendingRequestRow({
  user,
  isConfirmingDeny,
  onAccept,
  onDenyRequest,
  onDenyConfirm,
  onDenyCancel,
}: PendingRequestRowProps) {
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    setSwipeX(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isSwiping.current = false;
    if (swipeX > SWIPE_THRESHOLD) {
      onAccept(user.id);
    } else if (swipeX < -SWIPE_THRESHOLD) {
      onDenyRequest(user.id);
    }
    setSwipeX(0);
  }, [swipeX, onAccept, onDenyRequest, user.id]);

  if (isConfirmingDeny) {
    return (
      <div className="flex items-center justify-between px-phi-4 py-phi-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recusar conexão?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onDenyConfirm(user.id)}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
          >
            Sim
          </button>
          <button
            onClick={onDenyCancel}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Não
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe background indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
        <div
          className={cn(
            "flex h-full items-center pl-4 text-xs font-medium text-white transition-opacity",
            swipeX > 20 ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundColor: "rgb(34 197 94)" }}
        >
          Aceitar
        </div>
        <div
          className={cn(
            "flex h-full items-center pr-4 text-xs font-medium text-white transition-opacity ml-auto",
            swipeX < -20 ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundColor: "rgb(239 68 68)" }}
        >
          Recusar
        </div>
      </div>

      {/* Swipeable content */}
      <div
        className="relative flex items-center gap-phi-3 px-phi-4 py-phi-3 bg-white dark:bg-gray-900 transition-transform"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping.current ? "none" : "transform 0.2s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
            onClick={() => onAccept(user.id)}
            className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Aceitar
          </button>
          <button
            onClick={() => onDenyRequest(user.id)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Recusar
          </button>
        </div>
      </div>
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

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  // Close on outside tap (mobile)
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="cursor-pointer"
      >
        {children}
      </div>
      {open && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hide}
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2"
        >
          <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-gray-100 shadow-lg dark:bg-gray-800 dark:text-gray-200 whitespace-nowrap">
            {content}
          </div>
          {/* Arrow */}
          <div className="flex justify-center">
            <div className="h-1.5 w-3 overflow-hidden">
              <div className="mx-auto h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

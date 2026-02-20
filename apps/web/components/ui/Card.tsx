import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-phi-4 shadow-sm dark:border-gray-800 dark:bg-gray-900",
        hover && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  icon?: string;
  lucideIcon?: LucideIcon;
  iconColorClass?: string;
}

export function CardTitle({ children, className, icon, lucideIcon: Icon, iconColorClass }: CardTitleProps) {
  return (
    <h3 className={cn("flex items-center gap-2 text-base font-semibold", className)}>
      {Icon && <Icon className={cn("h-5 w-5", iconColorClass)} />}
      {!Icon && icon && <span className="text-xl">{icon}</span>}
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("mt-phi-3", className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "mt-phi-4 flex items-center justify-between border-t border-gray-100 pt-phi-3 dark:border-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
}

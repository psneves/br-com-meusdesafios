"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

function LoginError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const messages: Record<string, string> = {
    oauth_error: "Erro ao conectar com Google. Tente novamente.",
    oauth_cancelled: "Login cancelado. Tente novamente quando quiser.",
  };

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
      {messages[error] || "Ocorreu um erro. Tente novamente."}
    </div>
  );
}

export default function LoginPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const logoSrc =
    mounted && resolvedTheme === "light"
      ? "/logo-light-512.png"
      : "/logo-512x512.png";

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-6 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo + branding */}
        <div className="flex flex-col items-center space-y-4">
          <Image
            src={logoSrc}
            alt="Meus Desafios"
            width={72}
            height={72}
            className="rounded-2xl"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Bem-vindo
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Consistência vira resultado.
            </p>
          </div>
        </div>

        {/* Error feedback */}
        <Suspense fallback={null}>
          <LoginError />
        </Suspense>

        {/* Login button */}
        <GoogleLoginButton />

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-400">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-400">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  Droplets,
  Utensils,
  Moon,
  HeartPulse,
  ClipboardCheck,
  Trophy,
  Users,
  Flame,
  Target,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Meus Desafios — Consistência vira resultado",
  description:
    "Acompanhe seus hábitos diários de água, dieta, sono e exercício. Ganhe pontos, mantenha sequências e suba no ranking com seus amigos.",
  alternates: {
    canonical: "/",
  },
};

const challenges = [
  {
    icon: Droplets,
    name: "Água",
    description: "Registre sua hidratação com um toque e acompanhe seu consumo diário.",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    icon: Utensils,
    name: "Dieta",
    description: "Marque a aderência de cada refeição com um checklist simples.",
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    icon: Moon,
    name: "Sono",
    description: "Registre suas horas de sono e construa uma rotina consistente.",
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-900/40",
  },
  {
    icon: HeartPulse,
    name: "Exercício",
    description: "Academia, corrida, ciclismo ou natação — tudo em um só desafio.",
    color: "text-rose-500",
    bg: "bg-rose-100 dark:bg-rose-900/40",
  },
];

const steps = [
  {
    icon: ClipboardCheck,
    title: "Registre",
    description: "Registre seus hábitos em 1-2 toques. Rápido e sem complicação.",
  },
  {
    icon: Target,
    title: "Pontue",
    description: "Ganhe XP ao bater suas metas diárias. Bônus por dias perfeitos.",
  },
  {
    icon: Users,
    title: "Compare",
    description: "Veja sua posição no ranking entre amigos. Privacidade garantida.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Meus Desafios",
  description:
    "Acompanhe seus hábitos diários de água, dieta, sono e exercício com gamificação.",
  url: "https://meusdesafios.com.br",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  inLanguage: "pt-BR",
};

export default async function LandingPage() {
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect("/today");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-[100dvh] flex-col bg-slate-50 dark:bg-[#0a0a0a]">
        {/* Hero */}
        <section className="flex flex-col items-center px-6 pb-16 pt-20 text-center">
          <Image
            src="/logo-512x512.png"
            alt="Meus Desafios"
            width={80}
            height={80}
            className="mb-6 rounded-2xl"
            priority
          />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Meus Desafios
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Consistência vira resultado.
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Acompanhe água, dieta, sono e exercício. Ganhe pontos, construa sequências
            e suba no ranking — tudo em um app simples e divertido.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 text-base font-medium text-white transition-all duration-150 hover:bg-sky-600 active:scale-95 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Challenges */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
              4 desafios, 1 rotina
            </h2>
            <p className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Tudo o que você precisa para construir hábitos saudáveis.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {challenges.map((c) => (
                <div
                  key={c.name}
                  className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/60"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.bg}`}
                  >
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {c.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white px-6 py-16 dark:bg-gray-900/40">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Como funciona
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
                    <s.icon className="h-6 w-6 text-sky-500" />
                  </div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-500">
                    Passo {i + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gamification teaser */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Motivação que funciona
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-800 dark:bg-gray-900/60">
                <Flame className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Sequências</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Mantenha dias consecutivos para ganhar bônus de streak.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-800 dark:bg-gray-900/60">
                <TrendingUp className="mx-auto mb-3 h-8 w-8 text-sky-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Pontos XP</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  +10 XP por meta cumprida. Bônus por dia perfeito e semanas completas.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-800 dark:bg-gray-900/60">
                <Trophy className="mx-auto mb-3 h-8 w-8 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Rankings</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Compare seu ranking com amigos. Sua posição, seus dados — sempre privados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA footer */}
        <section className="bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pronto para começar?
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Crie sua conta em segundos com Google. Grátis.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-indigo-600 transition-all duration-150 hover:bg-gray-100 active:scale-95"
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Footer */}
        <footer className="bg-gray-100 px-6 py-8 dark:bg-gray-900/60">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center text-xs text-gray-400 dark:text-gray-600">
            <div className="flex gap-4">
              <Link href="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-400">
                Termos de Uso
              </Link>
              <Link href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-400">
                Política de Privacidade
              </Link>
            </div>
            <p>&copy; {new Date().getFullYear()} Meus Desafios</p>
          </div>
        </footer>
      </div>
    </>
  );
}

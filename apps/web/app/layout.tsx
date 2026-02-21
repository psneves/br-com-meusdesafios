import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://meusdesafios.com.br"),
  title: {
    default: "Meus Desafios — Consistência vira resultado",
    template: "%s | Meus Desafios",
  },
  description:
    "Acompanhe seus hábitos diários de água, dieta, sono e exercício. Ganhe pontos, mantenha sequências e suba no ranking com seus amigos.",
  keywords: [
    "hábitos",
    "rastreador de hábitos",
    "desafios diários",
    "água",
    "dieta",
    "sono",
    "exercício",
    "gamificação",
    "pontos",
    "streaks",
    "rotina",
    "saúde",
    "bem-estar",
  ],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Meus Desafios",
    title: "Meus Desafios — Consistência vira resultado",
    description:
      "Acompanhe seus hábitos diários de água, dieta, sono e exercício. Ganhe pontos, mantenha sequências e suba no ranking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meus Desafios — Consistência vira resultado",
    description:
      "Acompanhe seus hábitos diários de água, dieta, sono e exercício. Ganhe pontos, mantenha sequências e suba no ranking.",
  },
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meus Desafios",
  },
  icons: {
    icon: [
      { url: "/logo-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/logo-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo-512x512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

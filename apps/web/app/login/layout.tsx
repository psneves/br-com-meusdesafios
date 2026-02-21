import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Faça login no Meus Desafios com sua conta Google e comece a acompanhar seus hábitos diários.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

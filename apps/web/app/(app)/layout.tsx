import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import ClientShell from "./ClientShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return <ClientShell>{children}</ClientShell>;
}

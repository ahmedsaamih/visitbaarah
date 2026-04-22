import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const isAdmin = await verifySession();
  redirect(isAdmin ? "/admin/dashboard" : "/admin/login");
}

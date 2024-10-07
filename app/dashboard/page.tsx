import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import SideBarLayout from "@/components/sidebar/layout";
import Dashboard from "@/components/dashboard/dashboard";
import { authOptions } from "../api/auth/[...nextauth]/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SideBarLayout>
      <Dashboard />
    </SideBarLayout>
  );
}

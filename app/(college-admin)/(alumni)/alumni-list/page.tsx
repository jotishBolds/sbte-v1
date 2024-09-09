import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import AlumniList from "@/components/alumni/alumni-list/list";
import SideBarLayout from "@/components/sidebar/layout";

export default async function AlumniPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COLLEGE_SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Alumni Management</h1>
        <AlumniList />
      </div>
    </SideBarLayout>
  );
}

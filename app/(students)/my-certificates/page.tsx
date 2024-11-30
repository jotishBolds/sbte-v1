// app/certificates/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import CertificateList from "./cert-list";
import SideBarLayout from "@/components/sidebar/layout";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Certificates</h1>
        <CertificateList />
      </div>
    </SideBarLayout>
  );
}

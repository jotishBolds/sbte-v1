import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

import { Toaster } from "@/components/ui/sonner";
import LoadBalancingUpload from "./upload";
import LoadBalancingPdfList from "./load-list";
import SideBarLayout from "@/components/sidebar/layout";

export default async function LoadBalancingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Please log in to access this page</div>;
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Load Balancing PDF Management
        </h1>

        {session.user.role === "HOD" ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
              <LoadBalancingUpload />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">PDF List</h2>
              <LoadBalancingPdfList />
            </div>
            <Toaster />
          </>
        ) : (
          <p>Not authorized</p>
        )}
      </div>
    </SideBarLayout>
  );
}

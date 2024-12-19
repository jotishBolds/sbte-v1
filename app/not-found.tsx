"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function Custom404() {
  return (
    <div className="min-h-[90vh]  flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-9xl font-extrabold mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 ">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/">
              <Button size="lg" className=" w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" /> Go Home
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className=" 0 w-full sm:w-auto"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Go Back
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 md:px-8 ">
        <p>&copy; 2024 SBTE. All rights reserved.</p>
      </footer>
    </div>
  );
}

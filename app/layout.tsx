import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth/next";

import { Navbar } from "@/components/navbar/navbar";
import { authOptions } from "./api/auth/[...nextauth]/auth";
import { Providers } from "@/lib/providers";
import Footer from "@/components/navbar/footer";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <Navbar />
          {children}
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

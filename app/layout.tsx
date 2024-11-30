import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth/next";
import { Navbar } from "@/components/navbar/navbar";
import { authOptions } from "./api/auth/[...nextauth]/auth";
import { Providers } from "@/lib/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/tanstack";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "State Board of Technical Education",
  description:
    "Shaping Tomorrow's Technical Leaders - Empowering students through quality technical education and innovative learning approaches.",
  keywords: [
    "technical education",
    "state board",
    "education",
    "technical training",
    "skilled workforce",
    "technical learning",
  ],
  authors: [
    {
      name: "State Board of Technical Education",
    },
  ],
  openGraph: {
    title: "State Board of Technical Education",
    description:
      "Empowering students through quality technical education and innovative learning approaches.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <Providers session={session}>
            <QueryProvider>
              <Navbar />
              {children}
              <Toaster />
            </QueryProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

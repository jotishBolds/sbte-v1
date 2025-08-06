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
import { SessionMonitor } from "@/components/session/session-monitor";
import { LoadingProvider } from "@/contexts/loading-context";
import { GlobalLoadingOverlay } from "@/components/ui/global-loading-overlay";

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
      <head>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        ></script>
      </head>

      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <LoadingProvider>
            <Providers session={session}>
              <QueryProvider>
                <SessionMonitor>
                  <Navbar />
                  {children}
                  <Toaster />
                  <GlobalLoadingOverlay />
                </SessionMonitor>
              </QueryProvider>
            </Providers>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

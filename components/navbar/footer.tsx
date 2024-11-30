import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className={cn(
      "text-sm text-muted-foreground transition-colors hover:text-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "rounded-md px-2 py-1"
    )}
  >
    {children}
  </Link>
);

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-6 md:px-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">SBTE</span>
            </Link>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <div className="flex gap-4">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SBTE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

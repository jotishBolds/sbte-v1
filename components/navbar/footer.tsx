import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="py-8 px-4 md:px-8 bg-gray-900 text-center text-white">
      <div className="max-w-7xl mx-auto">
        <p>&copy; 2024 SBTE. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-4">
          <Link
            href="/privacy"
            className="hover:text-gray-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="hover:text-gray-300 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

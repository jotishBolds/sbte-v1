// components/Header.tsx
import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "@inertiajs/react";

const TiktokIcon = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M19.32 7.8C19.1 7.67 18.9 7.52 18.7 7.35C18.01 6.74 17.5 5.95 17.24 5.06C16.98 4.18 16.97 3.25 17.21 2.36H14.45V13.84C14.45 14.13 14.39 14.42 14.28 14.68C14.17 14.95 14 15.19 13.79 15.39C13.59 15.6 13.35 15.76 13.08 15.87C12.82 15.98 12.53 16.04 12.24 16.04C11.66 16.04 11.1 15.81 10.68 15.4C10.27 14.98 10.04 14.42 10.04 13.84C10.04 13.26 10.27 12.7 10.68 12.28C11.1 11.87 11.66 11.64 12.24 11.64C12.38 11.64 12.51 11.65 12.64 11.68V8.89C12.32 8.85 12 8.84 11.68 8.85C10.83 8.87 10 9.09 9.25 9.48C8.51 9.87 7.86 10.43 7.36 11.11C6.87 11.79 6.54 12.57 6.41 13.4C6.29 14.22 6.36 15.06 6.63 15.85C6.9 16.64 7.36 17.35 7.97 17.94C8.57 18.52 9.29 18.96 10.09 19.22C10.88 19.48 11.73 19.55 12.56 19.42C13.39 19.29 14.17 18.97 14.85 18.47C15.53 17.98 16.09 17.33 16.48 16.58C16.87 15.83 17.09 15 17.11 14.15V10.13C18.4 11.08 19.93 11.62 21.52 11.68V8.91C20.69 8.88 19.89 8.46 19.32 7.8Z"
            fill="currentColor"
        />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <div className="bg-white py-2 px-4 border-b border-gray-200">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex space-x-4">
                    <a
                        href="https://facebook.com"
                        aria-label="Facebook"
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        <Facebook size={18} />
                    </a>
                    <a
                        href="https://twitter.com"
                        aria-label="Twitter"
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        <Twitter size={18} />
                    </a>
                    <a
                        href="https://instagram.com"
                        aria-label="Instagram"
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        <Instagram size={18} />
                    </a>
                    <a
                        href="https://tiktok.com"
                        aria-label="TikTok"
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        <TiktokIcon />
                    </a>
                    <a
                        href="https://pinterest.com"
                        aria-label="Pinterest"
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 0C5.372 0 0 5.372 0 12C0 17.303 3.438 21.8 8.205 23.385C8.805 23.485 9.025 23.145 9.025 22.845C9.025 22.585 9.015 21.905 9.01 20.965C5.672 21.665 4.968 19.205 4.968 19.205C4.438 17.845 3.672 17.485 3.672 17.485C2.672 16.845 3.75 16.855 3.75 16.855C4.875 16.935 5.485 18.015 5.485 18.015C6.485 19.735 8.125 19.265 8.805 19.005C8.905 18.245 9.215 17.735 9.555 17.485C6.955 17.235 4.25 16.185 4.25 11.535C4.25 10.205 4.735 9.115 5.515 8.265C5.405 8.015 5.005 6.785 5.625 5.085C5.625 5.085 6.625 4.805 9.005 6.405C9.965 6.125 10.985 6 12 6C13.015 6 14.035 6.125 14.995 6.405C17.375 4.805 18.375 5.085 18.375 5.085C18.995 6.785 18.595 8.015 18.485 8.265C19.265 9.115 19.75 10.205 19.75 11.535C19.75 16.195 17.045 17.235 14.445 17.485C14.885 17.835 15.275 18.515 15.275 19.565C15.275 21.085 15.265 22.365 15.265 22.845C15.265 23.145 15.485 23.495 16.085 23.385C20.852 21.8 24.29 17.303 24.29 12C24.29 5.372 18.628 0 12 0Z"
                                fill="currentColor"
                            />
                        </svg>
                    </a>
                </div>
                <div className="text-center hidden md:block">
                    <div className="text-sm">
                        Transform Your Memories: Custom Frame Printing for Every
                        Occasion.
                        <Link
                            href="/shop"
                            className="text-black font-medium ml-1 inline-flex items-center"
                        >
                            Explore Frames
                            <svg
                                className="w-3 h-3 ml-1"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className="hidden md:block">
                    {/* Language and currency selectors removed as per requirements */}
                </div>
            </div>
        </div>
    );
};

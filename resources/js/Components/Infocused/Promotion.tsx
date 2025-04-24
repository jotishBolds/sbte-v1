import React, { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";

interface OrderStep {
    icon: string;
    title: string;
}

const FabricFramePromoSection: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [startX, setStartX] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useState<number>(0);

    const orderSteps: OrderStep[] = [
        {
            icon: "/assets/promotion/touchscreen.png",
            title: "Select a Product",
        },
        {
            icon: "/assets/promotion/scalability.png",
            title: "Choose the Size",
        },
        {
            icon: "/assets/promotion/image-upload.png",
            title: "Upload Your Photo",
        },
        {
            icon: "/assets/promotion/option.png",
            title: "Select the options required",
        },
        {
            icon: "/assets/promotion/checklist.png",
            title: "Checkout",
        },
    ];
    // Mouse/Touch event handlers for drag scrolling
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(
            e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0)
        );
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll speed multiplier
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const x =
            e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll speed multiplier
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Attach and remove event listeners
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaY;
            };

            scrollContainer.addEventListener("wheel", handleWheel);

            return () => {
                scrollContainer.removeEventListener("wheel", handleWheel);
            };
        }
    }, []);
    return (
        <div className="w-full">
            {/* Main Promo Section with yellow background */}
            <div className="w-full bg-[#cdffba] py-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6">
                        Create a wall of memories with our{" "}
                        <span className="text-[#333]">biggest</span> frames!
                    </h2>

                    <div className="text-center mb-8 max-w-3xl mx-auto">
                        <p className="text-base md:text-lg mb-2">
                            Elevate your home with your most cherished moments,
                            elegantly displayed in our Fabric frame.
                        </p>
                        <p className="text-base md:text-lg">
                            Our frames are designed to last, with prints that
                            can easily be swapped whenever you are ready for a
                            fresh look!
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="max-w-xs relative">
                            {/* Media container that can show either image or video */}
                            <div className="relative rounded-lg shadow-lg overflow-hidden">
                                {isPlaying ? (
                                    <video
                                        className="w-full"
                                        autoPlay
                                        controls
                                        onEnded={() => setIsPlaying(false)}
                                    >
                                        <source
                                            src="/assets/making-frame.mp4"
                                            type="video/mp4"
                                        />
                                        Your browser does not support the video
                                        tag.
                                    </video>
                                ) : (
                                    <>
                                        <img
                                            src="/assets/thumb.png"
                                            alt="infocusedframes"
                                            className="w-full"
                                        />
                                        <button
                                            onClick={() => setIsPlaying(true)}
                                            className="absolute inset-0 w-full h-full flex items-center justify-center"
                                            aria-label="Play video"
                                        >
                                            <div className="bg-black bg-opacity-50 rounded-full p-4 transform transition-transform hover:scale-110">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-8 w-8 text-white"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="text-center mt-2 bg-black text-white py-2 rounded-b-lg">
                                <p>Infocused Frames</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Steps Section with cream background */}
            <div className="w-full bg-[#fdf6e9] py-10 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
                        How To Place An Order
                    </h3>

                    {/* Horizontally scrollable container for mobile */}
                    <div
                        ref={scrollContainerRef}
                        className="md:max-w-4xl mx-auto overflow-x-auto scrollbar-hide md:overflow-visible"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            cursor: isDragging ? "grabbing" : "grab",
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUpOrLeave}
                    >
                        <div className="inline-flex md:grid md:grid-cols-5 gap-4 py-2 px-1 md:px-0 min-w-max md:min-w-0 md:w-full">
                            {orderSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center w-24 md:w-auto"
                                >
                                    <div className="bg-black p-3 rounded-lg mb-2 w-16 h-16 flex items-center justify-center">
                                        <img
                                            src={step.icon}
                                            alt={step.title}
                                            className="w-10 h-10 invert"
                                        />
                                    </div>
                                    <p className="text-xs md:text-sm text-center">
                                        {step.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FabricFramePromoSection;

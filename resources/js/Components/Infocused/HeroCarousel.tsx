// components/HeroCarousel.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

interface HeroSlide {
    id: string | number;
    src: string;
    type: "image" | "video";
}

interface HeroCarouselProps {
    slides: HeroSlide[];
    title: string;
    subtitle?: string;
    cta?: {
        text: string;
        href: string;
    };
    scrollSpeed?: number; // pixels per second
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
    slides,
    title,
    subtitle,
    cta,
    scrollSpeed = 60,
}) => {
    // State management
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isHoveringRight, setIsHoveringRight] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const previousTimeRef = useRef<number>();
    const hintTimeoutRef = useRef<NodeJS.Timeout>();

    // Double the slides for seamless looping
    const duplicatedSlides = [...slides, ...slides];

    // Animation loop
    const animate = (time: number) => {
        if (!previousTimeRef.current) previousTimeRef.current = time;
        const deltaTime = time - previousTimeRef.current;
        previousTimeRef.current = time;

        if (!isPaused || isHoveringRight) {
            setScrollPosition((prev) => {
                const contentWidth = contentRef.current?.scrollWidth || 0;
                const newPosition = prev + (deltaTime * scrollSpeed) / 1000;
                return newPosition >= contentWidth / 2 ? 0 : newPosition;
            });
        }

        animationRef.current = requestAnimationFrame(animate);
    };

    // Effect for animation
    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current)
                cancelAnimationFrame(animationRef.current);
        };
    }, [isPaused, isHoveringRight, scrollSpeed]);

    // Effect for hint display
    useEffect(() => {
        if (isPaused && !isHoveringRight) {
            hintTimeoutRef.current = setTimeout(() => setShowHint(true), 2000);
        } else {
            setShowHint(false);
            if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        }

        return () => {
            if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        };
    }, [isPaused, isHoveringRight]);

    // Event handlers
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => {
        setIsPaused(false);
        setIsHoveringRight(false);
    };
    const handleRightHover = () => {
        setIsHoveringRight(true);
        setShowHint(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[400px] md:h-[600px] overflow-hidden group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Slides container */}
            <div
                ref={contentRef}
                className="flex h-full absolute"
                style={{
                    transform: `translateX(-${scrollPosition}px)`,
                    width: `${slides.length * 200}%`,
                }}
            >
                {duplicatedSlides.map((slide, index) => (
                    <div
                        key={`${slide.id}-${index}`}
                        className="h-full relative"
                        style={{ width: `${100 / slides.length}%` }}
                    >
                        {slide.type === "video" ? (
                            <video
                                className="w-full h-full object-cover"
                                src={slide.src}
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.src})` }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center pointer-events-none">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-lg bg-white/90 p-6 md:p-8 rounded-sm backdrop-blur-sm">
                        {subtitle && (
                            <p className="text-sm font-medium text-gray-600 mb-2">
                                {subtitle}
                            </p>
                        )}
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            {title}
                        </h2>
                        {cta && (
                            <Link
                                href={cta.href}
                                className="inline-flex items-center px-6 py-3 bg-[#61ac41] text-white hover:bg-white hover:text-gray-900   transition-all duration-300 font-medium pointer-events-auto group-hover:scale-105"
                            >
                                {cta.text}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Right scroll zone with professional hint */}
            <div
                className="absolute right-0 top-0 h-full w-[15%] z-10 cursor-e-resize"
                onMouseEnter={handleRightHover}
            >
                <div
                    className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 ${
                        showHint
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-90"
                    } ${isHoveringRight ? "!bg-gray-900 !text-white" : ""}`}
                >
                    <ArrowRight
                        className={`h-5 w-5 transition-transform ${
                            isHoveringRight ? "translate-x-1" : ""
                        }`}
                    />
                </div>
            </div>
        </div>
    );
};

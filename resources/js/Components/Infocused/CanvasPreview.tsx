import React, { useRef, useState, useEffect } from "react";
import { Slider } from "@/Components/ui/slider";
import { Position, SizeOption } from "@/types/canvas";
import { ProductData } from "@/types/canvas";

interface CanvasPreviewProps {
    imageUrl: string | null;
    imagePosition: Position;
    zoomLevel: number;
    selectedSize: string;
    imageEffect: string | number;
    edgeDesign: string | number;
    onPositionChange: (position: Position) => void;
    onZoomChange: (zoom: number) => void;
    productData: ProductData | null;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
    imageUrl,
    imagePosition,
    zoomLevel,
    selectedSize,
    imageEffect,
    edgeDesign,
    onPositionChange,
    onZoomChange,
    productData,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageInitialized, setImageInitialized] = useState(false);

    // Fixed container dimensions
    const containerWidth = 600;
    const containerHeight = 500; // Fixed height for the preview area

    // Get dimensions from the selected size
    const selectedVariation = productData?.product?.product_variations?.find(
        (variation) => variation.label === selectedSize
    );

    const width = selectedVariation
        ? parseFloat(selectedVariation.horizontal_length)
        : 0;
    const height = selectedVariation
        ? parseFloat(selectedVariation.vertical_length)
        : 0;

    // Calculate aspect ratio and scaled dimensions
    const aspectRatio = height / width || 1;
    let contentWidth = containerWidth;
    let contentHeight = contentWidth * aspectRatio;

    // Ensure content doesn't exceed container height
    if (contentHeight > containerHeight) {
        contentHeight = containerHeight;
        contentWidth = contentHeight / aspectRatio;
    }

    // Update dimensions when selected size changes
    useEffect(() => {
        if (canvasRef.current) {
            setDimensions({
                width: contentWidth,
                height: contentHeight,
            });
        }
    }, [selectedSize, contentWidth, contentHeight]);

    // Handle image load to get natural dimensions and initialize position
    const handleImageLoad = () => {
        if (imageRef.current && canvasRef.current) {
            const { naturalWidth, naturalHeight } = imageRef.current;
            setImageSize({ width: naturalWidth, height: naturalHeight });

            // Only initialize position and zoom if not already done
            if (!imageInitialized) {
                // Always fit to height first (prioritize height fitting)
                const initialZoom = (contentHeight / naturalHeight) * 100;

                // If fitting to height makes the image too wide, then fit to width instead
                const widthAfterHeightFit = (naturalWidth * initialZoom) / 100;
                const finalZoom =
                    widthAfterHeightFit > contentWidth
                        ? (contentWidth / naturalWidth) * 100
                        : initialZoom;

                // Apply a slightly larger factor to fill more of the canvas
                const adjustedZoom = Math.min(finalZoom * 1.2, 100);

                onZoomChange(adjustedZoom);
                onPositionChange({ x: 0, y: 0 });
                setImageInitialized(true);
            }
        }
    };

    // Reset to center with default zoom (prioritize height fitting)
    const handleReset = () => {
        if (imageRef.current) {
            const { naturalWidth, naturalHeight } = imageRef.current;

            // Always fit to height first
            const initialZoom = (contentHeight / naturalHeight) * 100;

            // If fitting to height makes the image too wide, then fit to width instead
            const widthAfterHeightFit = (naturalWidth * initialZoom) / 100;
            const finalZoom =
                widthAfterHeightFit > contentWidth
                    ? (contentWidth / naturalWidth) * 100
                    : initialZoom;

            // Apply a slightly larger factor to fill more of the canvas
            const adjustedZoom = Math.min(finalZoom * 1.2, 100);

            onZoomChange(adjustedZoom);
            onPositionChange({ x: 0, y: 0 });
        }
    };

    // Dragging handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageUrl) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - imagePosition.x * dimensions.width,
            y: e.clientY - imagePosition.y * dimensions.height,
        });
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!imageUrl) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - imagePosition.x * dimensions.width,
            y: touch.clientY - imagePosition.y * dimensions.height,
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && canvasRef.current) {
            e.preventDefault();
            const newX = (e.clientX - dragStart.x) / dimensions.width;
            const newY = (e.clientY - dragStart.y) / dimensions.height;

            // Calculate maximum allowed position based on zoom level
            const zoomFactor = zoomLevel / 100;
            const maxX = Math.max(0, (zoomFactor - 1) / 2);
            const maxY = Math.max(0, (zoomFactor - 1) / 2);

            onPositionChange({
                x: Math.max(-maxX, Math.min(maxX, newX)),
                y: Math.max(-maxY, Math.min(maxY, newY)),
            });
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging && canvasRef.current) {
            e.preventDefault();
            const touch = e.touches[0];
            const newX = (touch.clientX - dragStart.x) / dimensions.width;
            const newY = (touch.clientY - dragStart.y) / dimensions.height;

            // Calculate maximum allowed position based on zoom level
            const zoomFactor = zoomLevel / 100;
            const maxX = Math.max(0, (zoomFactor - 1) / 2);
            const maxY = Math.max(0, (zoomFactor - 1) / 2);

            onPositionChange({
                x: Math.max(-maxX, Math.min(maxX, newX)),
                y: Math.max(-maxY, Math.min(maxY, newY)),
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    const handleZoomChange = (value: number[]) => {
        const newZoom = value[0];
        const oldZoom = zoomLevel;

        // Calculate the zoom center point based on current position
        const centerX = imagePosition.x;
        const centerY = imagePosition.y;

        onZoomChange(newZoom);

        // Adjust position to maintain proportional position during zoom
        if (oldZoom !== newZoom) {
            // Calculate new position that maintains the current center point
            const scaleFactor = newZoom / oldZoom;
            const newX = centerX;
            const newY = centerY;

            // Calculate maximum allowed position based on new zoom level
            const zoomFactor = newZoom / 100;
            const maxX = Math.max(0, (zoomFactor - 1) / 2);
            const maxY = Math.max(0, (zoomFactor - 1) / 2);

            onPositionChange({
                x: Math.max(-maxX, Math.min(maxX, newX)),
                y: Math.max(-maxY, Math.min(maxY, newY)),
            });
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove as any);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove as any, {
                passive: false,
            });
            window.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove as any);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove as any);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging, dragStart, zoomLevel, dimensions, imagePosition]);

    // Reset image initialization when image URL changes
    useEffect(() => {
        if (imageUrl) {
            setImageInitialized(false);
        }
    }, [imageUrl]);

    // Apply image effects
    const getImageFilter = () => {
        // If effect is a number (ID), we need to find the matching effect name
        const effectName =
            typeof imageEffect === "number"
                ? productData?.baseImageEffects?.find(
                      (e) => e.id === imageEffect
                  )?.name ||
                  productData?.product?.product_variations?.[0]?.image_effects?.find(
                      (e) => e.image_effect_id === imageEffect
                  )?.image_effect?.name
                : imageEffect;

        switch (effectName) {
            case "B&W":
                return "grayscale(100%)";
            case "Sepia":
                return "sepia(100%)";
            default:
                return "none";
        }
    };

    // Apply border styles
    const getBorderStyle = () => {
        // If edgeDesign is a number (ID), we need to find the matching design name
        const edgeName =
            typeof edgeDesign === "number"
                ? productData?.baseEdgeDesigns?.find((e) => e.id === edgeDesign)
                      ?.name ||
                  productData?.product?.product_variations?.[0]?.edge_designs?.find(
                      (e) => e.edge_design_id === edgeDesign
                  )?.edge_design?.name
                : edgeDesign;

        switch (edgeName) {
            case "Folded":
                return {
                    border: "8px solid #f5f5f5",
                    boxShadow:
                        "inset 0 0 5px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.1)",
                };
            case "Mirrored":
                return {
                    border: "5px solid #e0e0e0",
                    boxShadow:
                        "inset 0 0 10px rgba(255,255,255,0.8), 0 3px 8px rgba(0,0,0,0.1)",
                };
            case "White":
                return {
                    border: "8px solid white",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                };
            case "Black":
                return {
                    border: "8px solid #222",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                };
            default:
                return { border: "4px solid #d3d3d3" };
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col items-center justify-center w-full py-10 bg-gray-50">
                <div
                    className="relative"
                    style={{ width: "100%", maxWidth: `${containerWidth}px` }}
                >
                    {/* Horizontal measurement line (top) */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-8 w-full flex items-center justify-center">
                        <div className="h-px w-3/4 bg-gray-400 relative">
                            <div className="absolute left-0 h-3 w-px bg-gray-400 -top-1"></div>
                            <div className="absolute right-0 h-3 w-px bg-gray-400 -top-1"></div>
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                                <div className="bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border rounded">
                                    {width > 0
                                        ? `${width} ${
                                              selectedVariation?.length_unit
                                                  ?.name || "inch"
                                          }`
                                        : "Select size"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vertical measurement line (right) */}
                    <div className="absolute top-1/2 right-2 transform translate-x-8 -translate-y-1/2 h-full flex items-center">
                        <div className="relative w-px h-3/4 bg-gray-400">
                            <div className="absolute top-0 w-3 h-px bg-gray-400 -left-[6px]"></div>
                            <div className="absolute bottom-0 w-3 h-px bg-gray-400 -left-[6px]"></div>
                            <div className="absolute top-1/2 transform -translate-y-1/2 translate-x-6 -right-4">
                                <div className="bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border rounded transform rotate-90">
                                    {height > 0
                                        ? `${height} ${
                                              selectedVariation?.length_unit
                                                  ?.name || "inch"
                                          }`
                                        : "Select size"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed size outer container with centered content */}
                    <div
                        className="relative mx-auto bg-gray-100 flex items-center justify-center overflow-hidden"
                        style={{
                            width: "100%",
                            height: `${containerHeight}px`,
                        }}
                    >
                        {/* Resizable inner canvas - centered */}
                        <div
                            className="relative bg-white"
                            style={{
                                width: `${contentWidth}px`,
                                height: `${contentHeight}px`,
                                ...getBorderStyle(),
                            }}
                        >
                            <div
                                ref={canvasRef}
                                className="absolute inset-0 overflow-hidden"
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                style={{
                                    cursor: isDragging
                                        ? "grabbing"
                                        : imageUrl
                                        ? "grab"
                                        : "default",
                                }}
                            >
                                {imageUrl ? (
                                    <img
                                        ref={imageRef}
                                        src={imageUrl}
                                        alt="Canvas preview"
                                        className="absolute"
                                        onLoad={handleImageLoad}
                                        style={{
                                            transform: `translate(${
                                                imagePosition.x *
                                                dimensions.width
                                            }px, ${
                                                imagePosition.y *
                                                dimensions.height
                                            }px) scale(${zoomLevel / 100})`,
                                            transformOrigin: "center",
                                            width: `${dimensions.width}px`,
                                            height: `${dimensions.height}px`,
                                            objectFit: "contain",
                                            filter: getImageFilter(),
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        Please upload an image to preview
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {imageUrl && (
                <div className="flex flex-col gap-2 px-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Zoom</span>
                        <span className="text-sm text-gray-500">
                            {zoomLevel}%
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">-</span>
                        <Slider
                            value={[zoomLevel]}
                            onValueChange={handleZoomChange}
                            min={50}
                            max={200}
                            step={1}
                            className="flex-1"
                        />
                        <span className="text-sm">+</span>
                    </div>
                    <button
                        onClick={handleReset}
                        className="self-end text-sm text-[#68b94c] hover:underline"
                    >
                        Reset Position
                    </button>
                </div>
            )}
        </div>
    );
};

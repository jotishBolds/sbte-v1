import React, { useRef, useState, useEffect } from "react";
import { Slider } from "@/Components/ui/slider";
import { Position, SizeOption, PanelLayout, Panel } from "@/types/canvas";
import { ImagePlus, X } from "lucide-react";

interface SplitPreviewProps {
    imageUrl: string | null;
    imagePosition: Position;
    zoomLevel: number;
    selectedSize: SizeOption;
    imageEffect: string;
    edgeDesign: string;
    selectedLayout: PanelLayout | null;
    frameThickness?: number;
    onPositionChange: (position: Position) => void;
    onZoomChange: (zoom: number) => void;
}

export const SplitPreview: React.FC<SplitPreviewProps> = ({
    imageUrl,
    imagePosition,
    zoomLevel,
    selectedSize,
    imageEffect,
    edgeDesign,
    selectedLayout,
    frameThickness,
    onPositionChange,
    onZoomChange,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current) {
                setDimensions({
                    width: canvasRef.current.clientWidth,
                    height: canvasRef.current.clientHeight,
                });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const getImageFilter = () => {
        switch (imageEffect) {
            case "B&W":
                return "grayscale(100%)";
            case "Sepia":
                return "sepia(100%)";
            default:
                return "none";
        }
    };

    const getBorderStyle = () => {
        const borderWidth = `${frameThickness || 0}px`;
        switch (edgeDesign) {
            case "Folded":
                return {
                    border: `${borderWidth} solid #f5f5f5`,
                    boxShadow:
                        "inset 0 0 10px rgba(0,0,0,0.1), 0 6px 15px rgba(0,0,0,0.2)",
                };
            case "Mirrored":
                return {
                    border: `${borderWidth} solid #e0e0e0`,
                    boxShadow:
                        "inset 0 0 20px rgba(255,255,255,0.8), 0 6px 15px rgba(0,0,0,0.2)",
                };
            case "White":
                return {
                    border: `${borderWidth} solid white`,
                    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                };
            case "Black":
                return {
                    border: `${borderWidth} solid #222`,
                    boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                };
            default:
                return { border: `${borderWidth} solid #d3d3d3` };
        }
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        const scale = zoomLevel / 100;

        setDragStart({
            x: clientX - imagePosition.x * scale,
            y: clientY - imagePosition.y * scale,
        });
    };

    const handleDrag = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        const scale = zoomLevel / 100;

        // Adjust movement based on zoom level
        const newPosition = {
            x: (clientX - dragStart.x) / scale,
            y: (clientY - dragStart.y) / scale,
        };

        onPositionChange(newPosition);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleDrag as any);
            window.addEventListener("touchmove", handleDrag as any, {
                passive: false,
            });
            window.addEventListener("mouseup", handleDragEnd);
            window.addEventListener("touchend", handleDragEnd);
        }

        return () => {
            window.removeEventListener("mousemove", handleDrag as any);
            window.removeEventListener("touchmove", handleDrag as any);
            window.removeEventListener("mouseup", handleDragEnd);
            window.removeEventListener("touchend", handleDragEnd);
        };
    }, [isDragging, dragStart]);

    const handleZoomChange = (value: number[]) => {
        onZoomChange(value[0]);
    };

    const handleReset = () => {
        onPositionChange({ x: 0, y: 0 });
        onZoomChange(100);
    };

    const getImageTransform = () => {
        const scale = zoomLevel / 100;
        // Apply scale to the entire image container rather than individual panels
        return `scale(${scale})`;
    };

    const renderSplitLayout = () => {
        if (!selectedLayout) return null;

        const maxWidth = 600;
        const maxHeight = 400;
        const widthScale = maxWidth / selectedLayout.totalWidth;
        const heightScale = maxHeight / selectedLayout.totalHeight;
        const scale = Math.min(widthScale, heightScale) * 0.9;

        return (
            <div className="w-full max-w-4xl mx-auto">
                <div
                    className="relative"
                    style={{
                        width: `${selectedLayout.totalWidth * scale}px`,
                        height: `${selectedLayout.totalHeight * scale}px`,
                        margin: "0 auto",
                    }}
                >
                    {/* Horizontal measurement line */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-full flex items-center justify-center">
                        <div
                            className="h-px bg-gray-400 relative"
                            style={{
                                width: `${
                                    selectedLayout.totalWidth * scale * 0.8
                                }px`,
                            }}
                        >
                            <div className="absolute left-0 h-3 w-px bg-gray-400 -top-1"></div>
                            <div className="absolute right-0 h-3 w-px bg-gray-400 -top-1"></div>
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                                <div className="bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border rounded">
                                    {`${selectedLayout.totalWidth} inch`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vertical measurement line */}
                    <div className="absolute top-1/2 right-0 transform translate-x-8 -translate-y-1/2 h-full flex items-center">
                        <div
                            className="relative w-px bg-gray-400"
                            style={{
                                height: `${
                                    selectedLayout.totalHeight * scale * 0.8
                                }px`,
                            }}
                        >
                            <div className="absolute top-0 w-3 h-px bg-gray-400 -left-[6px]"></div>
                            <div className="absolute bottom-0 w-3 h-px bg-gray-400 -left-[6px]"></div>
                            <div className="absolute top-1/2 transform -translate-y-1/2 translate-x-6 -right-4">
                                <div className="bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border rounded transform rotate-90">
                                    {`${selectedLayout.totalHeight} inch`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panels */}
                    <div ref={canvasRef} className="relative w-full h-full">
                        {selectedLayout.panels.map((panel) => {
                            const panelWidth = panel.width * scale;
                            const panelHeight = panel.height * scale;
                            const panelLeft = panel.x * scale;
                            const panelTop = panel.y * scale;

                            // Calculate panel position relative to entire layout
                            const panelXPercent =
                                (panel.x / selectedLayout.totalWidth) * 100;
                            const panelYPercent =
                                (panel.y / selectedLayout.totalHeight) * 100;

                            return (
                                <div
                                    key={panel.id}
                                    className="absolute bg-white overflow-hidden"
                                    style={{
                                        left: `${panelLeft}px`,
                                        top: `${panelTop}px`,
                                        width: `${panelWidth}px`,
                                        height: `${panelHeight}px`,
                                        cursor: imageUrl ? "move" : "default",
                                        ...getBorderStyle(),
                                    }}
                                >
                                    {imageUrl ? (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center overflow-hidden"
                                            onMouseDown={handleDragStart}
                                            onTouchStart={handleDragStart}
                                        >
                                            <div
                                                className="absolute w-full h-full overflow-hidden"
                                                onMouseDown={handleDragStart}
                                                onTouchStart={handleDragStart}
                                            >
                                                <div
                                                    className="absolute"
                                                    style={{
                                                        width: `${
                                                            selectedLayout.totalWidth *
                                                            scale
                                                        }px`,
                                                        height: `${
                                                            selectedLayout.totalHeight *
                                                            scale
                                                        }px`,
                                                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                                                        top: `-${panelTop}px`,
                                                        left: `-${panelLeft}px`,
                                                    }}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Panel ${panel.id}`}
                                                        className="absolute w-full h-auto"
                                                        style={{
                                                            filter: getImageFilter(),
                                                            transform:
                                                                getImageTransform(),
                                                            transformOrigin:
                                                                "0 0",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                            <ImagePlus className="w-8 h-8 mb-2" />
                                            <span>Upload Image</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                    {selectedLayout.description} • Total:{" "}
                    {selectedLayout.totalWidth}" × {selectedLayout.totalHeight}"
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col items-center justify-center w-full py-20 bg-gray-50">
                {renderSplitLayout()}
            </div>

            {imageUrl && (
                <div className="flex flex-col gap-2">
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

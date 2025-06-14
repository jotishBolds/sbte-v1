import React, { useRef, useState, useEffect } from "react";
import { Slider } from "@/Components/ui/slider";
import { Position, PanelLayout, Panel } from "@/types/canvas";
import { ImagePlus, X } from "lucide-react";
import { ProductData } from "@/types/canvas";

interface CanvasPreviewProps {
    imageUrl: string | null;
    imagePosition: Position;
    zoomLevel: number;
    selectedSize: string;
    imageEffect: string | number;
    edgeDesign: string | number;
    selectedLayout: PanelLayout | null;
    frameThickness?: number;
    panelImages: Record<string, string>;
    panelEffects: Record<string, string | number>;
    onPositionChange: (position: Position) => void;
    onZoomChange: (zoom: number) => void;
    onPanelImageChange: (panelId: string, file: File) => void;
    onPanelImageRemove: (panelId: string) => void;
    onPanelEffectChange: (panelId: string, effect: string | number) => void;
    activePanel: string | null;
    setActivePanel: (panelId: string | null) => void;
    panelStates: Record<string, { position: Position; zoom: number }>;
    setPanelStates: React.Dispatch<
        React.SetStateAction<
            Record<string, { position: Position; zoom: number }>
        >
    >;
    productData: ProductData | null;
}

export const MultiCanvasPreview: React.FC<CanvasPreviewProps> = ({
    imageUrl,
    imagePosition,
    zoomLevel,
    selectedSize,
    imageEffect,
    edgeDesign,
    selectedLayout,
    frameThickness,
    panelImages,
    panelEffects,
    onPositionChange,
    onZoomChange,
    onPanelImageChange,
    onPanelImageRemove,
    onPanelEffectChange,
    activePanel,
    setActivePanel,
    panelStates,
    setPanelStates,
    productData,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [draggingPanel, setDraggingPanel] = useState<Panel | null>(null);

    // Get selected variation
    const selectedVariation = productData?.product?.product_variations?.find(
        (variation) => variation.label === selectedSize
    );

    // Get dimensions from selected size
    const width = selectedVariation
        ? parseFloat(selectedVariation.horizontal_length)
        : 0;
    const height = selectedVariation
        ? parseFloat(selectedVariation.vertical_length)
        : 0;
    const unit = selectedVariation?.length_unit?.name || "inch";

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

    const getImageFilter = (effect?: string | number) => {
        // If effect is a number (ID), we need to find the matching effect name
        const effectName =
            typeof effect === "number"
                ? productData?.baseImageEffects?.find((e) => e.id === effect)
                      ?.name ||
                  productData?.product?.product_variations?.[0]?.image_effects?.find(
                      (ie) => ie.image_effect_id === effect
                  )?.image_effect?.name
                : effect || imageEffect;

        switch (effectName) {
            case "B&W":
                return "grayscale(100%)";
            case "Sepia":
                return "sepia(100%)";
            default:
                return "none";
        }
    };

    const getBorderStyle = () => {
        // If edgeDesign is a number (ID), we need to find the matching design name
        const edgeName =
            typeof edgeDesign === "number"
                ? productData?.baseEdgeDesigns?.find((e) => e.id === edgeDesign)
                      ?.name ||
                  productData?.product?.product_variations?.[0]?.edge_designs?.find(
                      (ed) => ed.edge_design_id === edgeDesign
                  )?.edge_design?.name
                : edgeDesign;

        const borderWidth = `${frameThickness || 0}px`;
        switch (edgeName) {
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

    const handlePanelDragStart = (
        e: React.MouseEvent | React.TouchEvent,
        panel: Panel
    ) => {
        e.stopPropagation();
        setActivePanel(panel.id);
        setDraggingPanel(panel);
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        const rect = canvasRef.current!.getBoundingClientRect();
        const currentPos = panelStates[panel.id]?.position || { x: 0, y: 0 };
        setDragStart({
            x: clientX - rect.left - currentPos.x,
            y: clientY - rect.top - currentPos.y,
        });
    };

    const handlePanelDrag = (e: MouseEvent | TouchEvent) => {
        if (!draggingPanel || !canvasRef.current) return;

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        const rect = canvasRef.current.getBoundingClientRect();

        const newX = clientX - rect.left - dragStart.x;
        const newY = clientY - rect.top - dragStart.y;

        setPanelStates((prev) => ({
            ...prev,
            [draggingPanel.id]: {
                ...prev[draggingPanel.id],
                position: { x: newX, y: newY },
            },
        }));
    };

    const handlePanelDragEnd = () => {
        setDraggingPanel(null);
    };

    useEffect(() => {
        if (draggingPanel) {
            window.addEventListener("mousemove", handlePanelDrag as any);
            window.addEventListener("touchmove", handlePanelDrag as any, {
                passive: false,
            });
            window.addEventListener("mouseup", handlePanelDragEnd);
            window.addEventListener("touchend", handlePanelDragEnd);
        }

        return () => {
            window.removeEventListener("mousemove", handlePanelDrag as any);
            window.removeEventListener("touchmove", handlePanelDrag as any);
            window.removeEventListener("mouseup", handlePanelDragEnd);
            window.removeEventListener("touchend", handlePanelDragEnd);
        };
    }, [draggingPanel, dragStart]);

    const handlePanelImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        panelId: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            onPanelImageChange(panelId, file);
            setPanelStates((prev) => ({
                ...prev,
                [panelId]: {
                    position: { x: 0, y: 0 },
                    zoom: 100,
                },
            }));
            setActivePanel(panelId);
        }
        e.target.value = "";
    };

    const handlePanelZoomChange = (value: number[]) => {
        if (!activePanel) return;
        setPanelStates((prev) => ({
            ...prev,
            [activePanel]: {
                ...prev[activePanel],
                zoom: value[0],
            },
        }));
    };

    const handleZoomChange = (value: number[]) => {
        if (activePanel) {
            handlePanelZoomChange(value);
        } else {
            onZoomChange(value[0]);
        }
    };

    const handleReset = () => {
        if (activePanel && panelStates[activePanel]) {
            setPanelStates((prev) => ({
                ...prev,
                [activePanel]: {
                    ...prev[activePanel],
                    position: { x: 0, y: 0 },
                    zoom: 100,
                },
            }));
        } else {
            onPositionChange({ x: 0, y: 0 });
            onZoomChange(100);
        }
    };

    const currentZoom =
        activePanel && panelStates[activePanel]
            ? panelStates[activePanel].zoom
            : zoomLevel;

    const renderSinglePanel = () => (
        <div className="relative" style={{ width: "100%", maxWidth: "600px" }}>
            {/* Horizontal measurement line (top) */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-8 w-full flex items-center justify-center">
                <div className="h-px w-3/4 bg-gray-400 relative">
                    <div className="absolute left-0 h-3 w-px bg-gray-400 -top-1"></div>
                    <div className="absolute right-0 h-3 w-px bg-gray-400 -top-1"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                        <div className="bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border rounded">
                            {width > 0 ? `${width} ${unit}` : "Select size"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vertical measurement line (right) */}
            <div className="absolute top-1/2 right-24 transform translate-x-8 -translate-y-1/2 h-full flex items-center">
                <div className="relative w-px h-full bg-gray-400">
                    <div className="absolute top-0 w-3 h-px bg-gray-400 -left-[6px]"></div>
                    <div className="absolute bottom-0 w-3 h-px bg-gray-400 -left-[6px]"></div>
                    <div className="absolute top-1/2 transform -translate-y-1/2 translate-x-6 -right-4">
                        <div className="bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border rounded transform rotate-90">
                            {height > 0 ? `${height} ${unit}` : "Select size"}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="relative mx-auto"
                style={{
                    width: "70%",
                    paddingBottom: `${(height / width) * 70}%`,
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        transform: "scale(1.02)",
                        zIndex: 1,
                        ...getBorderStyle(),
                    }}
                />
                <div
                    ref={canvasRef}
                    className="absolute inset-0 overflow-hidden bg-white border border-gray-200 canvas-preview-area"
                    onMouseDown={(e) => {
                        if (!imageUrl) return;
                        e.preventDefault();
                        setIsDragging(true);
                        const rect = canvasRef.current!.getBoundingClientRect();
                        setDragStart({
                            x:
                                (e.clientX - rect.left) / dimensions.width -
                                imagePosition.x,
                            y:
                                (e.clientY - rect.top) / dimensions.height -
                                imagePosition.y,
                        });
                    }}
                    onTouchStart={(e) => {
                        if (!imageUrl) return;
                        const touch = e.touches[0];
                        const rect = canvasRef.current!.getBoundingClientRect();
                        setIsDragging(true);
                        setDragStart({
                            x:
                                (touch.clientX - rect.left) / dimensions.width -
                                imagePosition.x,
                            y:
                                (touch.clientY - rect.top) / dimensions.height -
                                imagePosition.y,
                        });
                    }}
                    style={{ zIndex: 2 }}
                >
                    {imageUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <img
                                src={imageUrl}
                                alt="Canvas preview"
                                className="max-w-none max-h-none"
                                style={{
                                    position: "absolute",
                                    transform: `translate(${
                                        imagePosition.x * dimensions.width
                                    }px, ${
                                        imagePosition.y * dimensions.height
                                    }px) scale(${zoomLevel / 100})`,
                                    transformOrigin: "center",
                                    height: "100%",
                                    width: "auto",
                                    minWidth: "100%",
                                    cursor: isDragging ? "grabbing" : "grab",
                                    filter: getImageFilter(),
                                }}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <label className="flex flex-col items-center justify-center cursor-pointer">
                                <ImagePlus className="w-8 h-8 mb-2" />
                                <span>Click to upload image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onPanelImageChange(
                                                "single-panel",
                                                file
                                            );
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderMultiPanel = () => {
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
                                    {`${selectedLayout.totalWidth} ${unit}`}
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
                                    {`${selectedLayout.totalHeight} ${unit}`}
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

                            const panelState = panelStates[panel.id] || {
                                position: { x: 0, y: 0 },
                                zoom: 100,
                            };

                            const panelEffect = panelEffects[panel.id];

                            return (
                                <div
                                    key={panel.id}
                                    className={`absolute bg-white overflow-hidden group ${
                                        activePanel === panel.id
                                            ? "ring-2 ring-[#68b94c]"
                                            : ""
                                    }`}
                                    style={{
                                        left: `${panelLeft}px`,
                                        top: `${panelTop}px`,
                                        width: `${panelWidth}px`,
                                        height: `${panelHeight}px`,
                                        border: `${frameThickness}px solid #e5e7eb`,
                                        cursor: panelImages[panel.id]
                                            ? "move"
                                            : "pointer",
                                    }}
                                    onClick={() => setActivePanel(panel.id)}
                                    onMouseDown={(e) => {
                                        if (panelImages[panel.id]) {
                                            handlePanelDragStart(e, panel);
                                        }
                                    }}
                                    onTouchStart={(e) => {
                                        if (panelImages[panel.id]) {
                                            handlePanelDragStart(e, panel);
                                        }
                                    }}
                                >
                                    {panelImages[panel.id] ? (
                                        <>
                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={panelImages[panel.id]}
                                                    alt={`Panel ${panel.id}`}
                                                    className="max-w-none max-h-none"
                                                    style={{
                                                        position: "absolute",
                                                        transform: `translate(${
                                                            panelState.position
                                                                .x
                                                        }px, ${
                                                            panelState.position
                                                                .y
                                                        }px) scale(${
                                                            panelState.zoom /
                                                            100
                                                        })`,
                                                        transformOrigin:
                                                            "center",
                                                        height: "100%",
                                                        width: "auto",
                                                        minWidth: "100%",
                                                        transition:
                                                            draggingPanel?.id ===
                                                            panel.id
                                                                ? "none"
                                                                : "transform 0.2s ease",
                                                        filter: getImageFilter(
                                                            panelEffect
                                                        ),
                                                    }}
                                                />
                                            </div>
                                            <button
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPanelImageRemove(
                                                        panel.id
                                                    );
                                                    setActivePanel(null);
                                                }}
                                            >
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 cursor-pointer">
                                            <ImagePlus className="w-8 h-8 mb-2" />
                                            <span>Add Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handlePanelImageUpload(
                                                        e,
                                                        panel.id
                                                    )
                                                }
                                            />
                                        </label>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                    {selectedLayout.description} • Total:{" "}
                    {selectedLayout.totalWidth}
                    {unit} × {selectedLayout.totalHeight}
                    {unit}
                </div>
            </div>
        );
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const newX =
                    (e.clientX - rect.left) / dimensions.width - dragStart.x;
                const newY =
                    (e.clientY - rect.top) / dimensions.height - dragStart.y;
                onPositionChange({ x: newX, y: newY });
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging && canvasRef.current) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                const newX =
                    (touch.clientX - rect.left) / dimensions.width -
                    dragStart.x;
                const newY =
                    (touch.clientY - rect.top) / dimensions.height -
                    dragStart.y;
                onPositionChange({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => setIsDragging(false);
        const handleTouchEnd = () => setIsDragging(false);

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
    }, [isDragging, dragStart]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col items-center justify-center w-full py-20 bg-gray-50">
                {selectedLayout ? renderMultiPanel() : renderSinglePanel()}
            </div>

            {(imageUrl ||
                (selectedLayout && Object.keys(panelImages).length > 0)) && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Zoom</span>
                        <span className="text-sm text-gray-500">
                            {currentZoom}%
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">-</span>
                        <Slider
                            value={[currentZoom]}
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
                        Reset {activePanel ? "Panel" : "Position"}
                    </button>
                </div>
            )}
        </div>
    );
};

// Updated CanvasPrintDesigner.tsx
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { CanvasFormData, Position, ProductData } from "@/types/canvas";
import { SIZE_OPTIONS } from "@/types/constants";
import { ImageUploader } from "@/Components/Infocused/ImageUploader";
import { CanvasPreview } from "@/Components/Infocused/CanvasPreview";
import { OptionSelectors } from "@/Components/Infocused/OptionsSelector";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";
import axios from "axios";
import { convertFileToBase64 } from "@/types/utils";

interface CanvasPrintDesignerProps {
    showMockGallery?: boolean;
    setShowMockGallery?: (show: boolean) => void;
}

const ROOM_MOCKS = [
    {
        id: 1,
        name: "Living Room",
        src: "/assets/room-mock/roomone.png",
        canvasPosition: { x: 0.5, y: 0.4 }, // Centered
        canvasScale: 0.4, // Bigger size
    },
    {
        id: 2,
        name: "Bedroom",
        src: "/assets/room-mock/roomtwo.png",
        canvasPosition: { x: 0.3, y: 0.4 }, // Position is okay
        canvasScale: 0.35, // Bigger size
    },
    {
        id: 3,
        name: "Office",
        src: "/assets/room-mock/roomthree.png",
        canvasPosition: { x: 0.7, y: 0.4 }, // Moved to right center
        canvasScale: 0.35, // Bigger size
    },
    {
        id: 4,
        name: "Dining Room",
        src: "/assets/room-mock/roomfour.png",
        canvasPosition: { x: 0.4, y: 0.5 }, // Lower left position
        canvasScale: 0.4, // Little bigger than original
    },
    {
        id: 5,
        name: "Hallway",
        src: "/assets/room-mock/roomfive.png",
        canvasPosition: { x: 0.4, y: 0.5 }, // Lower right position
        canvasScale: 0.35, // Bigger size
    },
];

const CanvasPrintDesigner: React.FC<CanvasPrintDesignerProps> = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [imagePosition, setImagePosition] = useState<Position>({
        x: 0,
        y: 0,
    }); // Normalized position
    const [zoomLevel, setZoomLevel] = useState(100);
    const [selectedMock, setSelectedMock] = useState(ROOM_MOCKS[0]);
    const mockPreviewRef = useRef<HTMLDivElement>(null);
    const [mockDimensions, setMockDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [productData, setProductData] = useState<ProductData | null>(null);
    const {
        data,
        setData: setFormData,
        post,
        processing,
        errors,
    } = useForm<CanvasFormData>({
        size: SIZE_OPTIONS[0].label,
        quantity: 1,
        imageEffect: "Original",
        edgeDesign: "Folded",
        hangingMechanism: "No",
        imageFile: null,
        imagePosition: { x: 0, y: 0 },
        zoomLevel: 100,
    });

    // Get the current edge design name (handling both string and number IDs)
    const getEdgeDesignName = () => {
        if (typeof data.edgeDesign === "number") {
            const edge =
                productData?.baseEdgeDesigns?.find(
                    (e) => e.id === Number(data.edgeDesign)
                ) ||
                productData?.product?.product_variations?.[0]?.edge_designs?.find(
                    (ed) => ed.edge_design_id === Number(data.edgeDesign)
                )?.edge_design;
            return edge?.name || "Folded";
        }
        return data.edgeDesign;
    };

    // Get the current image effect name (handling both string and number IDs)
    const getImageEffectName = () => {
        if (typeof data.imageEffect === "number") {
            const effect =
                productData?.baseImageEffects?.find(
                    (e) => e.id === Number(data.imageEffect)
                ) ||
                productData?.product?.product_variations?.[0]?.image_effects?.find(
                    (ie) => ie.image_effect_id === Number(data.imageEffect)
                )?.image_effect;
            return effect?.name || "Original";
        }
        return data.imageEffect;
    };

    // Get border style based on edge design
    const getBorderStyle = () => {
        const edgeName = getEdgeDesignName();

        switch (edgeName) {
            case "Folded":
                return {
                    border: "15px solid #f5f5f5",
                    boxShadow:
                        "inset 0 0 10px rgba(0,0,0,0.1), 0 6px 15px rgba(0,0,0,0.2)",
                };
            case "Mirrored":
                return {
                    border: "10px solid #e0e0e0",
                    boxShadow:
                        "inset 0 0 20px rgba(255,255,255,0.8), 0 6px 15px rgba(0,0,0,0.2)",
                };
            case "White":
                return {
                    border: "15px solid white",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                };
            case "Black":
                return {
                    border: "15px solid #222",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                };
            default:
                return {
                    border: "15px solid #f5f5f5",
                    boxShadow:
                        "inset 0 0 10px rgba(0,0,0,0.1), 0 6px 15px rgba(0,0,0,0.2)",
                };
        }
    };

    // Get image filter based on image effect
    const getImageFilter = () => {
        const effectName = getImageEffectName();

        switch (effectName) {
            case "B&W":
                return "grayscale(100%)";
            case "Sepia":
                return "sepia(100%)";
            default:
                return "none";
        }
    };

    useEffect(() => {
        // Fetch product data when component mounts
        const fetchProductData = async () => {
            try {
                const response = await axios.get(
                    "/canvas-product/canvas_print"
                );
                setProductData(response.data);
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };

        fetchProductData();
    }, []);

    // Convert initial string values to proper numeric IDs after product data loads
    useEffect(() => {
        if (!productData) return;

        let needsUpdate = false;
        const updates: any = {};

        // Fix imageEffect if it's a string
        if (typeof data.imageEffect === "string") {
            const originalEffect = productData.baseImageEffects?.find(
                (effect: any) => effect.name === "Original"
            );

            if (originalEffect) {
                console.log(
                    "CanvasPrint: Converting imageEffect from string to ID:",
                    originalEffect.id
                );
                updates.imageEffect = originalEffect.id;
                needsUpdate = true;
            } else {
                const firstEffect = productData.baseImageEffects?.[0];
                if (firstEffect) {
                    console.log(
                        "CanvasPrint: No 'Original' effect found, using first available:",
                        firstEffect.id
                    );
                    updates.imageEffect = firstEffect.id;
                    needsUpdate = true;
                }
            }
        }

        // Fix edgeDesign if it's a string
        if (typeof data.edgeDesign === "string") {
            const foldedEdge = productData.baseEdgeDesigns?.find(
                (edge: any) => edge.name === "Folded"
            );

            if (foldedEdge) {
                console.log(
                    "CanvasPrint: Converting edgeDesign from string to ID:",
                    foldedEdge.id
                );
                updates.edgeDesign = foldedEdge.id;
                needsUpdate = true;
            } else {
                const firstEdge = productData.baseEdgeDesigns?.[0];
                if (firstEdge) {
                    console.log(
                        "CanvasPrint: No 'Folded' edge found, using first available:",
                        firstEdge.id
                    );
                    updates.edgeDesign = firstEdge.id;
                    needsUpdate = true;
                }
            }
        }

        // Apply all updates at once
        if (needsUpdate) {
            Object.keys(updates).forEach((key) => {
                setData(key as keyof CanvasFormData, updates[key]);
            });
        }
    }, [productData, data.imageEffect, data.edgeDesign]);

    useEffect(() => {
        const updateDimensions = () => {
            if (mockPreviewRef.current) {
                setMockDimensions({
                    width: mockPreviewRef.current.offsetWidth,
                    height: mockPreviewRef.current.offsetHeight,
                });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [imageUrl]);

    useEffect(() => {
        const storedImage = localStorage.getItem("canvasDesignerImage");
        if (storedImage) {
            try {
                const { imageData, name } = JSON.parse(storedImage);

                // Always use the base64 image data for persistence
                setImageUrl(imageData);
                setFileName(name);

                // Create a file object from base64
                if (imageData.startsWith("data:")) {
                    const byteString = atob(imageData.split(",")[1]);
                    const mimeString = imageData
                        .split(",")[0]
                        .split(":")[1]
                        .split(";")[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: mimeString });
                    const file = new File([blob], name, { type: mimeString });
                    setImageFile(file);
                    setData("imageFile", file);
                }
            } catch (error) {
                console.error("Error loading image from localStorage:", error);
                localStorage.removeItem("canvasDesignerImage");
            }
        }

        const storedMock = localStorage.getItem("canvasDesignerMock");
        if (storedMock) {
            const mockId = parseInt(storedMock);
            const mock = ROOM_MOCKS.find((m) => m.id === mockId);
            if (mock) setSelectedMock(mock);
        }

        // Load position and zoom from localStorage if available
        const storedPosition = localStorage.getItem("canvasDesignerPosition");
        if (storedPosition) {
            const position = JSON.parse(storedPosition);
            setImagePosition(position);
            setData("imagePosition", position);
        }

        const storedZoom = localStorage.getItem("canvasDesignerZoom");
        if (storedZoom) {
            const zoom = parseInt(storedZoom);
            setZoomLevel(zoom);
            setData("zoomLevel", zoom);
        }
    }, []);

    const setData = (key: keyof CanvasFormData, value: any) =>
        setFormData(key, value);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setImageFile(file);
            setFileName(file.name);
            setData("imageFile", file);

            const base64Image = await convertFileToBase64(file);
            setImageUrl(base64Image);

            // Store in localStorage
            localStorage.setItem(
                "canvasDesignerImage",
                JSON.stringify({
                    imageData: base64Image,
                    name: file.name,
                })
            );

            const newPosition = { x: 0, y: 0 };
            setImagePosition(newPosition);
            setZoomLevel(100);
            setData("imagePosition", newPosition);
            setData("zoomLevel", 100);

            // Store position and zoom
            localStorage.setItem(
                "canvasDesignerPosition",
                JSON.stringify(newPosition)
            );
            localStorage.setItem("canvasDesignerZoom", "100");
        }
    };

    const handleMockSelect = (mock: (typeof ROOM_MOCKS)[0]) => {
        setSelectedMock(mock);
        localStorage.setItem("canvasDesignerMock", mock.id.toString());
    };

    const handleDeleteImage = () => {
        if (imageUrl && imageUrl.startsWith("blob:")) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageFile(null);
        setImageUrl(null);
        setFileName(null);
        setData("imageFile", null);
        localStorage.removeItem("canvasDesignerImage");
        localStorage.removeItem("canvasDesignerPosition");
        localStorage.removeItem("canvasDesignerZoom");
        const newPosition = { x: 0, y: 0 };
        setImagePosition(newPosition);
        setZoomLevel(100);
        setData("imagePosition", newPosition);
        setData("zoomLevel", 100);
    };

    const handlePositionChange = (position: Position) => {
        setImagePosition(position);
        setData("imagePosition", position);
        localStorage.setItem(
            "canvasDesignerPosition",
            JSON.stringify(position)
        );
    };

    const handleZoomChange = (value: number) => {
        setZoomLevel(value);
        setData("zoomLevel", value);
        localStorage.setItem("canvasDesignerZoom", value.toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/canvas-prints/checkout");
    };

    useEffect(() => {
        return () => {
            // Clean up any blob URLs if they exist
            if (imageUrl && imageUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const getSelectedSizeDimensions = () => {
        const selectedVariation =
            productData?.product?.product_variations?.find(
                (variation) => variation.label === data.size
            );

        if (selectedVariation) {
            return {
                width: parseFloat(selectedVariation.horizontal_length),
                height: parseFloat(selectedVariation.vertical_length),
                label: selectedVariation.label,
                unit: selectedVariation.length_unit.name,
            };
        }

        return { width: 0, height: 0, label: "", unit: "inch" };
    };

    const getCanvasDimensions = () => {
        const selectedSize = getSelectedSizeDimensions();
        const baseSize = Math.min(mockDimensions.width, mockDimensions.height);
        let width = baseSize * selectedMock.canvasScale;
        let height = width * (selectedSize.height / selectedSize.width);

        if (height > baseSize) {
            height = baseSize * selectedMock.canvasScale;
            width = height * (selectedSize.width / selectedSize.height);
        }

        return { width, height };
    };

    return (
        <InfocusLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="flex flex-col lg:flex-row p-4 gap-6">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#68b94c] mb-4">
                                Canvas Prints
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#68b94c]"
                                >
                                    Home
                                </a>
                                <span>/</span>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#68b94c]"
                                >
                                    Canvas
                                </a>
                                <span>/</span>
                                <span className="text-[#68b94c]">
                                    Canvas Prints
                                </span>
                            </div>

                            <div className="border rounded-md p-4 mb-6">
                                <div className="flex flex-col gap-6">
                                    <ImageUploader
                                        onFileChange={handleFileUpload}
                                        onDelete={handleDeleteImage}
                                        imageUrl={imageUrl}
                                        fileName={fileName}
                                    />
                                    <CanvasPreview
                                        imageUrl={imageUrl}
                                        imagePosition={imagePosition}
                                        zoomLevel={zoomLevel}
                                        selectedSize={data.size}
                                        imageEffect={data.imageEffect}
                                        edgeDesign={data.edgeDesign}
                                        onPositionChange={handlePositionChange}
                                        onZoomChange={handleZoomChange}
                                        productData={productData}
                                    />
                                    {imageUrl && (
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold mb-3">
                                                See Your Canvas in a Room
                                            </h3>
                                            <div
                                                className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-lg bg-gray-100"
                                                ref={mockPreviewRef}
                                            >
                                                <img
                                                    src={selectedMock.src}
                                                    alt={selectedMock.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div
                                                    className="absolute"
                                                    style={{
                                                        top: `${
                                                            selectedMock
                                                                .canvasPosition
                                                                .y * 100
                                                        }%`,
                                                        left: `${
                                                            selectedMock
                                                                .canvasPosition
                                                                .x * 100
                                                        }%`,
                                                        transform:
                                                            "translate(-50%, -50%)",
                                                        width: `${
                                                            getCanvasDimensions()
                                                                .width
                                                        }px`,
                                                        height: `${
                                                            getCanvasDimensions()
                                                                .height
                                                        }px`,
                                                        ...getBorderStyle(),
                                                        overflow: "hidden",
                                                        backgroundColor:
                                                            "white",
                                                    }}
                                                >
                                                    {imageUrl && (
                                                        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                                                            <img
                                                                src={imageUrl}
                                                                alt="Canvas in room"
                                                                className="absolute w-full h-full object-contain"
                                                                style={{
                                                                    transform: `translate(${
                                                                        imagePosition.x *
                                                                        getCanvasDimensions()
                                                                            .width
                                                                    }px, ${
                                                                        imagePosition.y *
                                                                        getCanvasDimensions()
                                                                            .height
                                                                    }px) scale(${
                                                                        zoomLevel /
                                                                        100
                                                                    })`,
                                                                    transformOrigin:
                                                                        "center",
                                                                    transition:
                                                                        "transform 0.3s ease",
                                                                    filter: getImageFilter(),
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {data.hangingMechanism ===
                                                    "Yes" && (
                                                    <div
                                                        className="absolute bg-gray-400 rounded-full"
                                                        style={{
                                                            top: `${
                                                                selectedMock
                                                                    .canvasPosition
                                                                    .y *
                                                                    100 -
                                                                (getCanvasDimensions()
                                                                    .height /
                                                                    2 +
                                                                    15)
                                                            }%`,
                                                            left: `${
                                                                selectedMock
                                                                    .canvasPosition
                                                                    .x * 100
                                                            }%`,
                                                            transform:
                                                                "translate(-50%, -50%)",
                                                            width: "20px",
                                                            height: "20px",
                                                            boxShadow:
                                                                "inset 0 -2px 3px rgba(0,0,0,0.2)",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium mb-2">
                                                    Select Room Background
                                                </h4>
                                                <div className="flex gap-3 overflow-x-auto w-full pb-2">
                                                    {ROOM_MOCKS.map((mock) => (
                                                        <button
                                                            key={mock.id}
                                                            onClick={() =>
                                                                handleMockSelect(
                                                                    mock
                                                                )
                                                            }
                                                            className={`flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${
                                                                selectedMock.id ===
                                                                mock.id
                                                                    ? "ring-2 ring-[#68b94c] ring-offset-2"
                                                                    : "hover:opacity-90"
                                                            }`}
                                                            style={{
                                                                width: "80px",
                                                                height: "60px",
                                                                position:
                                                                    "relative",
                                                            }}
                                                        >
                                                            <img
                                                                src={mock.src}
                                                                alt={mock.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {selectedMock.id ===
                                                                mock.id && (
                                                                <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-[350px] lg:mt-[88px]">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Price Calculator
                                    </h2>

                                    <OptionSelectors
                                        data={data}
                                        setData={(key, value) =>
                                            setData(
                                                key as keyof CanvasFormData,
                                                value
                                            )
                                        }
                                        onSubmit={handleSubmit}
                                        processing={processing}
                                        hasImage={!!imageUrl}
                                        productData={productData}
                                        imageUrl={imageUrl}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </InfocusLayout>
    );
};

export default CanvasPrintDesigner;

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { MultiCanvasFormData, PanelLayout, Position } from "@/types/canvas";
import { SIZE_OPTIONS } from "@/types/constants";
import { ImageUploader } from "@/Components/Infocused/ImageUploader";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";
import { SPLIT_LAYOUTS } from "@/Components/Infocused/SplitLayoutSelector";
import { SplitPreview } from "@/Components/Infocused/SplitPreview";
import { SplitOptionSelectors } from "@/Components/Infocused/SplitOptionSelector";
import { ImagePlus } from "lucide-react";

const ROOM_MOCKS = [
    {
        id: 1,
        name: "Living Room",
        src: "/assets/room-mock/roomone.png",
        canvasPosition: { x: 0.5, y: 0.4 },
        canvasScale: 0.4,
    },
    {
        id: 2,
        name: "Bedroom",
        src: "/assets/room-mock/roomtwo.png",
        canvasPosition: { x: 0.3, y: 0.4 },
        canvasScale: 0.35,
    },
    {
        id: 3,
        name: "Office",
        src: "/assets/room-mock/roomthree.png",
        canvasPosition: { x: 0.7, y: 0.4 },
        canvasScale: 0.35,
    },
];

const SplitPrint: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState(100);
    const [selectedMock, setSelectedMock] = useState(ROOM_MOCKS[0]);
    const [selectedLayout, setSelectedLayout] = useState<PanelLayout | null>(
        SPLIT_LAYOUTS[0]
    );
    const mockPreviewRef = useRef<HTMLDivElement>(null);
    const [mockDimensions, setMockDimensions] = useState({
        width: 0,
        height: 0,
    });

    const {
        data,
        setData: setFormData,
        post,
        processing,
        errors,
    } = useForm<MultiCanvasFormData>({
        size: SIZE_OPTIONS[0].label,
        quantity: 1,
        imageEffect: "Original",
        edgeDesign: "Folded",
        hangingMechanism: "Yes",
        imageFile: null,
        imagePosition: { x: 0, y: 0 },
        zoomLevel: 100,
        layout: SPLIT_LAYOUTS[0],
        frameThickness: 1,
        panelImages: {},
        panelEffects: {},
    });

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
        const storedImage = localStorage.getItem("splitDesignerImage");
        if (storedImage) {
            try {
                const { imageData, name } = JSON.parse(storedImage);
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
                setFileName(name);
                setData("imageFile", file);
                setImageUrl(URL.createObjectURL(file));
            } catch (error) {
                console.error("Error loading image from localStorage:", error);
                localStorage.removeItem("splitDesignerImage");
            }
        }
        const storedMock = localStorage.getItem("splitDesignerMock");
        if (storedMock) {
            const mockId = parseInt(storedMock);
            const mock = ROOM_MOCKS.find((m) => m.id === mockId);
            if (mock) setSelectedMock(mock);
        }
        const storedLayout = localStorage.getItem("splitDesignerLayout");
        if (storedLayout) {
            const layout = JSON.parse(storedLayout);
            setSelectedLayout(layout);
            setData("layout", layout);
        }
    }, []);

    const setData = (key: keyof MultiCanvasFormData, value: any) => {
        setFormData(key, value);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setImageFile(file);
            setFileName(file.name);
            setData("imageFile", file);
            const objectUrl = URL.createObjectURL(file);
            setImageUrl(objectUrl);

            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem(
                    "splitDesignerImage",
                    JSON.stringify({
                        imageData: reader.result,
                        name: file.name,
                    })
                );
            };
            reader.readAsDataURL(file);
            const newPosition = { x: 0, y: 0 };
            setImagePosition(newPosition);
            setZoomLevel(100);
            setData("imagePosition", newPosition);
            setData("zoomLevel", 100);
        }
    };

    const handleMockSelect = (mock: (typeof ROOM_MOCKS)[0]) => {
        setSelectedMock(mock);
        localStorage.setItem("splitDesignerMock", mock.id.toString());
    };

    const handleDeleteImage = () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageFile(null);
        setImageUrl(null);
        setFileName(null);
        setData("imageFile", null);
        localStorage.removeItem("splitDesignerImage");
        const newPosition = { x: 0, y: 0 };
        setImagePosition(newPosition);
        setZoomLevel(100);
        setData("imagePosition", newPosition);
        setData("zoomLevel", 100);
    };

    const handlePositionChange = (position: { x: number; y: number }) => {
        setImagePosition(position);
        setData("imagePosition", position);
    };

    const handleZoomChange = (value: number) => {
        setZoomLevel(value);
        setData("zoomLevel", value);
    };

    const handleLayoutSelect = (layout: PanelLayout) => {
        setSelectedLayout(layout);
        setData("layout", layout);
        localStorage.setItem("splitDesignerLayout", JSON.stringify(layout));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/split-canvas/checkout");
    };

    useEffect(() => {
        return () => {
            if (imageUrl && imageUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const selectedSize =
        SIZE_OPTIONS.find((size) => size.label === data.size) ||
        SIZE_OPTIONS[0];

    const getCanvasDimensions = () => {
        const baseSize = Math.min(mockDimensions.width, mockDimensions.height);
        const aspectRatio = selectedLayout
            ? selectedLayout.totalWidth / selectedLayout.totalHeight
            : selectedSize.width / selectedSize.height;

        let width = baseSize * selectedMock.canvasScale;
        let height = width / aspectRatio;

        if (height > baseSize) {
            height = baseSize * selectedMock.canvasScale;
            width = height * aspectRatio;
        }
        return { width, height };
    };

    const getImageFilter = () => {
        switch (data.imageEffect) {
            case "B&W":
                return "grayscale(100%)";
            case "Sepia":
                return "sepia(100%)";
            default:
                return "none";
        }
    };

    const getBorderStyle = () => {
        const borderWidth = `${data.frameThickness}px`;
        switch (data.edgeDesign) {
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

    return (
        <InfocusLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="flex flex-col lg:flex-row p-4 gap-6">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#68b94c] mb-4">
                                Split Canvas Prints
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
                                    Split Canvas Prints
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
                                    <SplitPreview
                                        imageUrl={imageUrl}
                                        imagePosition={imagePosition}
                                        zoomLevel={zoomLevel}
                                        selectedSize={selectedSize}
                                        imageEffect={data.imageEffect}
                                        edgeDesign={data.edgeDesign}
                                        selectedLayout={selectedLayout}
                                        frameThickness={data.frameThickness}
                                        onPositionChange={handlePositionChange}
                                        onZoomChange={handleZoomChange}
                                    />
                                    {imageUrl && (
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold mb-3">
                                                See Your Split Canvas in a Room
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
                                                {selectedLayout && (
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
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: "8px",
                                                        }}
                                                    >
                                                        {/* Render each panel separately */}
                                                        {selectedLayout.panels.map(
                                                            (panel) => {
                                                                const panelWidth =
                                                                    (panel.width /
                                                                        selectedLayout.totalWidth) *
                                                                    getCanvasDimensions()
                                                                        .width;
                                                                const panelHeight =
                                                                    (panel.height /
                                                                        selectedLayout.totalHeight) *
                                                                    getCanvasDimensions()
                                                                        .height;
                                                                const panelLeft =
                                                                    (panel.x /
                                                                        selectedLayout.totalWidth) *
                                                                    getCanvasDimensions()
                                                                        .width;
                                                                const panelTop =
                                                                    (panel.y /
                                                                        selectedLayout.totalHeight) *
                                                                    getCanvasDimensions()
                                                                        .height;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            panel.id
                                                                        }
                                                                        className="absolute"
                                                                        style={{
                                                                            width: `${panelWidth}px`,
                                                                            height: `${panelHeight}px`,
                                                                            left: `${panelLeft}px`,
                                                                            top: `${panelTop}px`,
                                                                            ...getBorderStyle(),
                                                                            overflow:
                                                                                "hidden",
                                                                        }}
                                                                    >
                                                                        {imageUrl && (
                                                                            <div className="absolute w-full h-full overflow-hidden">
                                                                                <div
                                                                                    className="absolute"
                                                                                    style={{
                                                                                        width: `${
                                                                                            getCanvasDimensions()
                                                                                                .width
                                                                                        }px`,
                                                                                        height: `${
                                                                                            getCanvasDimensions()
                                                                                                .height
                                                                                        }px`,
                                                                                        transform: `translate(${
                                                                                            imagePosition.x
                                                                                        }px, ${
                                                                                            imagePosition.y
                                                                                        }px) scale(${
                                                                                            zoomLevel /
                                                                                            100
                                                                                        })`,
                                                                                        transformOrigin:
                                                                                            "0 0",
                                                                                        top: `-${panelTop}px`,
                                                                                        left: `-${panelLeft}px`,
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            imageUrl
                                                                                        }
                                                                                        alt="Split canvas preview"
                                                                                        className="absolute w-full h-auto"
                                                                                        style={{
                                                                                            filter: getImageFilter(),
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        )}
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
                                                    }}
                                                />
                                            )}
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium mb-2">
                                                    Background
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
                                    <SplitOptionSelectors
                                        data={data}
                                        setData={setData}
                                        onSubmit={handleSubmit}
                                        processing={processing}
                                        hasImage={!!imageUrl}
                                        selectedLayout={selectedLayout}
                                        onSelectLayout={handleLayoutSelect}
                                        activePanel={null}
                                        onPanelEffectChange={() => {}}
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

export default SplitPrint;

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import {
    MultiCanvasFormData,
    PanelLayout,
    Position,
    ProductData,
} from "@/types/canvas";
import { ImagePlus } from "lucide-react";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";
import { PANEL_LAYOUTS } from "@/Components/Infocused/MultiLayoutSelector";
import { MultiOptionSelectors } from "@/Components/Infocused/MultiOptionsSelector";
import { MultiCanvasPreview } from "@/Components/Infocused/MultiPanelPreview";
import axios from "axios";
import { convertFileToBase64 } from "@/types/utils";

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
    {
        id: 4,
        name: "Dining Room",
        src: "/assets/room-mock/roomfour.png",
        canvasPosition: { x: 0.4, y: 0.5 },
        canvasScale: 0.4,
    },
    {
        id: 5,
        name: "Hallway",
        src: "/assets/room-mock/roomfive.png",
        canvasPosition: { x: 0.4, y: 0.5 },
        canvasScale: 0.35,
    },
];

interface CanvasPrintDesignerProps {
    showMockGallery?: boolean;
    setShowMockGallery?: (show: boolean) => void;
}

const MultiCanvasPrintDesigner: React.FC<CanvasPrintDesignerProps> = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [imagePosition, setImagePosition] = useState<Position>({
        x: 0,
        y: 0,
    });
    const [zoomLevel, setZoomLevel] = useState(100);
    const [selectedMock, setSelectedMock] = useState(ROOM_MOCKS[0]);
    const [selectedLayout, setSelectedLayout] = useState<PanelLayout | null>(
        null
    );
    const [panelImages, setPanelImages] = useState<Record<string, string>>({});
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [panelStates, setPanelStates] = useState<
        Record<string, { position: Position; zoom: number }>
    >({});
    const [productData, setProductData] = useState<ProductData | null>(null);
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
        size: "",
        quantity: 1,
        imageEffect: "Original",
        edgeDesign: "Folded",
        hangingMechanism: "No",
        imageFile: null,
        imageUrl: null,
        imagePosition: { x: 0, y: 0 },
        zoomLevel: 100,
        layout: null,
        frameThickness: 1,
        panelImages: {},
        panelEffects: {},
    });

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await axios.get(
                    "/canvas-product/canvas_layout"
                );
                setProductData(response.data);
                if (response.data?.product?.product_variations?.length > 0) {
                    setData(
                        "size",
                        response.data.product.product_variations[0].label
                    );
                }
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };

        fetchProductData();
    }, []);

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
                setData("imageUrl", imageData);
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
        const storedLayout = localStorage.getItem("canvasDesignerLayout");
        if (storedLayout) {
            const layout = JSON.parse(storedLayout);
            setSelectedLayout(layout);
            setData("layout", layout);
        }
        const storedPanelImages = localStorage.getItem(
            "canvasDesignerPanelImages"
        );
        if (storedPanelImages) {
            const images = JSON.parse(storedPanelImages);
            setPanelImages(images);
            setData("panelImages", images);
        }
        const storedPanelEffects = localStorage.getItem(
            "canvasDesignerPanelEffects"
        );
        if (storedPanelEffects) {
            const effects = JSON.parse(storedPanelEffects);
            setData("panelEffects", effects);
        }
    }, []);

    const setData = (key: keyof MultiCanvasFormData, value: any) => {
        setFormData(key, value);
        if (key === "panelEffects") {
            localStorage.setItem(
                "canvasDesignerPanelEffects",
                JSON.stringify(value)
            );
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setImageFile(file);
            setFileName(file.name);
            setData("imageFile", file);

            const base64Image = await convertFileToBase64(file);
            setImageUrl(URL.createObjectURL(file));
            setData("imageUrl", base64Image);

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

            localStorage.setItem(
                "canvasDesignerPosition",
                JSON.stringify(newPosition)
            );
            localStorage.setItem("canvasDesignerZoom", "100");
        }
    };

    const handlePanelImageChange = (panelId: string, file: File) => {
        const objectUrl = URL.createObjectURL(file);
        const newPanelImages = { ...panelImages, [panelId]: objectUrl };
        setPanelImages(newPanelImages);
        setData("panelImages", newPanelImages);
        setActivePanel(panelId);
        setPanelStates((prev) => ({
            ...prev,
            [panelId]: {
                position: { x: 0, y: 0 },
                zoom: 100,
            },
        }));

        const reader = new FileReader();
        reader.onload = () => {
            const storedImages = JSON.parse(
                localStorage.getItem("canvasDesignerPanelImages") || "{}"
            );
            storedImages[panelId] = reader.result;
            localStorage.setItem(
                "canvasDesignerPanelImages",
                JSON.stringify(storedImages)
            );
            setData("panelImages", {
                ...data.panelImages,
                [panelId]: reader.result as string,
            });
        };
        reader.readAsDataURL(file);
    };

    const handlePanelImageRemove = (panelId: string) => {
        const newPanelImages = { ...panelImages };
        delete newPanelImages[panelId];
        setPanelImages(newPanelImages);
        setData("panelImages", newPanelImages);
        setActivePanel(null);

        const storedImages = JSON.parse(
            localStorage.getItem("canvasDesignerPanelImages") || "{}"
        );
        delete storedImages[panelId];
        localStorage.setItem(
            "canvasDesignerPanelImages",
            JSON.stringify(storedImages)
        );
    };

    const handleMockSelect = (mock: (typeof ROOM_MOCKS)[0]) => {
        setSelectedMock(mock);
        localStorage.setItem("canvasDesignerMock", mock.id.toString());
    };

    const handleDeleteImage = () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageFile(null);
        setImageUrl(null);
        setFileName(null);
        setData("imageFile", null);
        setData("imageUrl", null);
        localStorage.removeItem("canvasDesignerImage");
        const newPosition = { x: 0, y: 0 };
        setImagePosition(newPosition);
        setZoomLevel(100);
        setData("imagePosition", newPosition);
        setData("zoomLevel", 100);
    };

    const handlePositionChange = (position: Position) => {
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
        localStorage.setItem("canvasDesignerLayout", JSON.stringify(layout));
    };

    const handlePanelEffectChange = (
        panelId: string,
        effect: string | number
    ) => {
        setData("panelEffects", {
            ...data.panelEffects,
            [panelId]: effect,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/canvas-prints/checkout");
    };

    useEffect(() => {
        return () => {
            if (imageUrl && imageUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imageUrl);
            }
            Object.values(panelImages).forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [imageUrl, panelImages]);

    const getSelectedSizeDimensions = () => {
        const selectedVariation =
            productData?.product?.product_variations?.find(
                (variation) => variation.label === data.size
            );

        if (selectedVariation) {
            return {
                width: parseFloat(selectedVariation.horizontal_length),
                height: parseFloat(selectedVariation.vertical_length),
                unit: selectedVariation.length_unit.name,
            };
        }

        return { width: 0, height: 0, unit: "inch" };
    };

    const getCanvasDimensions = () => {
        const selectedSize = getSelectedSizeDimensions();
        const baseSize = Math.min(mockDimensions.width, mockDimensions.height);
        let aspectRatio = 1;

        if (selectedLayout) {
            aspectRatio =
                selectedLayout.totalWidth / selectedLayout.totalHeight;
        } else {
            aspectRatio = selectedSize.height / selectedSize.width;
        }

        let width = baseSize * selectedMock.canvasScale;
        let height = width / aspectRatio;

        if (height > baseSize) {
            height = baseSize * selectedMock.canvasScale;
            width = height * aspectRatio;
        }

        return { width, height };
    };

    const getImageFilter = (effect?: string | number) => {
        const effectName =
            typeof effect === "number"
                ? productData?.baseImageEffects?.find((e) => e.id === effect)
                      ?.name ||
                  productData?.product?.product_variations?.[0]?.image_effects?.find(
                      (ie) => ie.image_effect_id === effect
                  )?.image_effect?.name
                : effect || data.imageEffect;

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
        const edgeName =
            typeof data.edgeDesign === "number"
                ? productData?.baseEdgeDesigns?.find(
                      (e) => e.id === data.edgeDesign
                  )?.name ||
                  productData?.product?.product_variations?.[0]?.edge_designs?.find(
                      (ed) => ed.edge_design_id === data.edgeDesign
                  )?.edge_design?.name
                : data.edgeDesign;

        const borderWidth = `${data.frameThickness}px`;
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

    const getImageTransform = (panelId?: string) => {
        const canvasDimensions = getCanvasDimensions();

        if (panelId && panelStates[panelId]) {
            const panelState = panelStates[panelId];
            const scale = panelState.zoom / 100;
            const translateX = panelState.position.x;
            const translateY = panelState.position.y;
            return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        } else {
            const scale = zoomLevel / 100;
            const translateX = imagePosition.x * canvasDimensions.width;
            const translateY = imagePosition.y * canvasDimensions.height;
            return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }
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
                                    <MultiCanvasPreview
                                        imageUrl={imageUrl}
                                        imagePosition={imagePosition}
                                        zoomLevel={zoomLevel}
                                        selectedSize={data.size}
                                        imageEffect={data.imageEffect}
                                        edgeDesign={data.edgeDesign}
                                        selectedLayout={selectedLayout}
                                        frameThickness={data.frameThickness}
                                        panelImages={panelImages}
                                        panelEffects={data.panelEffects || {}}
                                        onPositionChange={handlePositionChange}
                                        onZoomChange={handleZoomChange}
                                        onPanelImageChange={
                                            handlePanelImageChange
                                        }
                                        onPanelImageRemove={
                                            handlePanelImageRemove
                                        }
                                        onPanelEffectChange={
                                            handlePanelEffectChange
                                        }
                                        activePanel={activePanel}
                                        setActivePanel={setActivePanel}
                                        panelStates={panelStates}
                                        setPanelStates={setPanelStates}
                                        productData={productData}
                                    />
                                    {(imageUrl ||
                                        Object.keys(panelImages).length >
                                            0) && (
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
                                                {selectedLayout ? (
                                                    <div
                                                        className="absolute overflow-hidden"
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
                                                        }}
                                                    >
                                                        <div className="relative w-full h-full">
                                                            {selectedLayout.panels.map(
                                                                (panel) => {
                                                                    const panelWidth =
                                                                        (panel.width /
                                                                            selectedLayout.totalWidth) *
                                                                        100;
                                                                    const panelHeight =
                                                                        (panel.height /
                                                                            selectedLayout.totalHeight) *
                                                                        100;
                                                                    const panelLeft =
                                                                        (panel.x /
                                                                            selectedLayout.totalWidth) *
                                                                        100;
                                                                    const panelTop =
                                                                        (panel.y /
                                                                            selectedLayout.totalHeight) *
                                                                        100;

                                                                    const panelEffect =
                                                                        data
                                                                            .panelEffects?.[
                                                                            panel
                                                                                .id
                                                                        ];

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                panel.id
                                                                            }
                                                                            className="absolute overflow-hidden"
                                                                            style={{
                                                                                left: `${panelLeft}%`,
                                                                                top: `${panelTop}%`,
                                                                                width: `${panelWidth}%`,
                                                                                height: `${panelHeight}%`,
                                                                                border: `${data.frameThickness}px solid #e5e7eb`,
                                                                            }}
                                                                        >
                                                                            {panelImages[
                                                                                panel
                                                                                    .id
                                                                            ] ? (
                                                                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                                                    <img
                                                                                        src={
                                                                                            panelImages[
                                                                                                panel
                                                                                                    .id
                                                                                            ]
                                                                                        }
                                                                                        alt={`Panel ${panel.id}`}
                                                                                        className="max-w-none max-h-none"
                                                                                        style={{
                                                                                            position:
                                                                                                "absolute",
                                                                                            transform:
                                                                                                getImageTransform(
                                                                                                    panel.id
                                                                                                ),
                                                                                            transformOrigin:
                                                                                                "center",
                                                                                            height: "100%",
                                                                                            width: "auto",
                                                                                            minWidth:
                                                                                                "100%",
                                                                                            filter: getImageFilter(
                                                                                                panelEffect
                                                                                            ),
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                                                    <ImagePlus className="w-6 h-6" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="absolute overflow-hidden"
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
                                                        }}
                                                    >
                                                        {imageUrl && (
                                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                                <img
                                                                    src={
                                                                        imageUrl
                                                                    }
                                                                    alt="Canvas in room"
                                                                    className="max-w-none max-h-none"
                                                                    style={{
                                                                        position:
                                                                            "absolute",
                                                                        transform:
                                                                            getImageTransform(),
                                                                        transformOrigin:
                                                                            "center",
                                                                        height: "100%",
                                                                        width: "auto",
                                                                        minWidth:
                                                                            "100%",
                                                                        filter: getImageFilter(),
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
                                    <MultiOptionSelectors
                                        data={data}
                                        setData={(key, value) =>
                                            setData(
                                                key as keyof MultiCanvasFormData,
                                                value
                                            )
                                        }
                                        onSubmit={handleSubmit}
                                        processing={processing}
                                        hasImage={
                                            !!imageUrl ||
                                            Object.keys(panelImages).length > 0
                                        }
                                        selectedLayout={selectedLayout}
                                        onSelectLayout={handleLayoutSelect}
                                        activePanel={activePanel}
                                        onPanelEffectChange={(effect) => {
                                            if (activePanel) {
                                                handlePanelEffectChange(
                                                    activePanel,
                                                    effect
                                                );
                                            }
                                        }}
                                        productData={productData}
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

export default MultiCanvasPrintDesigner;

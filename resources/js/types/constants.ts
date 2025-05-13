import {
    EdgeDesign,
    HangingMechanism,
    ImageEffect,
    Position,
    SizeOption,
} from "./canvas";

// constants.ts - Contains configuration data
export const SIZE_OPTIONS: SizeOption[] = [
    {
        id: "small-portrait",
        label: 'S (Portrait) - 8" x 12"',
        width: 8,
        height: 12,
        price: 950.0,
        orientation: "Portrait",
    },
    {
        id: "medium-portrait",
        label: 'M (Portrait) - 12" x 16"',
        width: 12,
        height: 16,
        price: 1250.0,
        orientation: "Portrait",
    },
    {
        id: "large-portrait",
        label: 'L (Portrait) - 16" x 24"',
        width: 16,
        height: 24,
        price: 1950.0,
        orientation: "Portrait",
    },
    {
        id: "small-landscape",
        label: 'S (Landscape) - 12" x 8"',
        width: 12,
        height: 8,
        price: 950.0,
        orientation: "Landscape",
    },
    {
        id: "medium-landscape",
        label: 'M (Landscape) - 16" x 12"',
        width: 16,
        height: 12,
        price: 1250.0,
        orientation: "Landscape",
    },
    {
        id: "large-landscape",
        label: 'L (Landscape) - 24" x 16"',
        width: 24,
        height: 16,
        price: 1950.0,
        orientation: "Landscape",
    },
];

export const IMAGE_EFFECTS: ImageEffect[] = ["Original", "B&W", "Sepia"];
export const EDGE_DESIGNS: EdgeDesign[] = [
    "Folded",
    "Mirrored",
    "Black",
    "White",
];
export const HANGING_MECHANISMS: HangingMechanism[] = ["Yes", "No"];

export interface CanvasFormData {
    size: string;
    quantity: number;
    imageEffect: string;
    edgeDesign: string;
    hangingMechanism: string;
    imageFile: File | null;
    imagePosition: Position;
    zoomLevel: number;
    [key: string]: any; // Add index signature
}

// types.ts - Contains shared types with fixed FormData interface
import { ChangeEvent, MouseEvent, TouchEvent } from "react";

export interface Position {
    x: number;
    y: number;
}

export type ImageEffect = "Original" | "B&W" | "Sepia";
export type EdgeDesign = "Folded" | "Mirrored" | "Black" | "White";
export type HangingMechanism = "Yes" | "No";

// Modified interface with index signature to satisfy FormDataType constraint
export interface CanvasFormData {
    size: string;
    quantity: number;
    imageEffect: ImageEffect;
    edgeDesign: EdgeDesign;
    hangingMechanism: HangingMechanism;
    imageFile: File | null;
    imagePosition: Position;
    zoomLevel: number;
    [key: string]: any; // Add index signature to satisfy FormDataType constraint
}

export interface SizeOption {
    id: string;
    label: string;
    width: number;
    height: number;
    price: number;
    orientation: "Portrait" | "Landscape";
}

export interface PriceCalculation {
    basePrice: number;
    quantity: number;
    total: number;
}
// types/canvas.ts
export interface Panel {
    id: string;
    width: number;
    height: number;
    x: number;
    y: number;
    ratio: number;
    imageUrl?: string;
}

export interface PanelLayout {
    id: string;
    name: string;
    description: string;
    panels: Panel[];
    totalWidth: number;
    totalHeight: number;
}
export interface MultiCanvasFormData {
    size: string;
    quantity: number;
    imageEffect: string;
    edgeDesign: string;
    hangingMechanism: string;
    imageFile: File | null;
    imagePosition: { x: number; y: number };
    zoomLevel: number;
    layout: PanelLayout;
    frameThickness: number;
    panelImages: Record<string, string>;
    [key: string]: any; // Added index signature
}

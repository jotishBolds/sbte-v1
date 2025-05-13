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
    hangingVariety?: number; // Added this new field
    imageFile: File | null;
    imagePosition: Position;
    zoomLevel: number;
    [key: string]: any;
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

export interface ProductVariation {
    id: number;
    product_id: number;
    label: string;
    horizontal_length: string;
    vertical_length: string;
    length_unit_id: number;
    price: string;
    status: string;
    created_at: string;
    updated_at: string;
    length_unit: {
        id: number;
        name: string;
    };
    layout_detail: any;
    image_effects: Array<{
        id: number;
        product_variation_id: number;
        image_effect_id: number;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
        image_effect: {
            id: number;
            name: string;
            thumbnail: string;
            applicability: string;
            product_id: number | null;
            price: string;
            status: string;
            created_at: string;
            updated_at: string;
        };
    }>;
    edge_designs: Array<{
        id: number;
        product_variation_id: number;
        edge_design_id: number;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
        edge_design: {
            id: number;
            name: string;
            thumbnail: string;
            applicability: string;
            product_id: number | null;
            price: string;
            status: string;
            created_at: string;
            updated_at: string;
        };
    }>;
    frame_thicknesses: any[];
    hanging_price: {
        id: number;
        product_variation_id: number;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
    } | null;
    hanging_varieties: any[];
}

export interface ProductData {
    product: {
        id: number;
        name: string;
        category: string;
        type: string;
        created_at: string;
        updated_at: string;
        product_variations: ProductVariation[];
    };
    baseImageEffects: Array<{
        id: number;
        name: string;
        thumbnail: string;
        applicability: string;
        product_id: number | null;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    baseEdgeDesigns: Array<{
        id: number;
        name: string;
        thumbnail: string;
        applicability: string;
        product_id: number | null;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    baseFrameThicknesses: any[];
    hangingBasePrice: {
        id: number;
        applicability: string;
        product_id: number | null;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
    } | null;
    baseHangingVarieties: any[];
}
// In your types file, update the CartItem interface:
export interface MultiCanvasFormData {
    size: string;
    quantity: number;
    imageEffect: string | number;
    edgeDesign: string | number;
    hangingMechanism: "Yes" | "No";
    hangingVariety?: number;
    imageFile: File | null;
    imageUrl: string | null;
    imagePosition: Position;
    zoomLevel: number;
    layout: PanelLayout | null;
    frameThickness: number;
    panelImages: Record<string, string>;
    panelEffects: Record<string, string | number>;
    [key: string]: any;
}
export interface CartItem {
    id: string;
    productId: number;
    size: string;
    quantity: number;
    imageEffect: string | number;
    edgeDesign: string | number;
    hangingMechanism: string;
    hangingVariety?: number;
    imageUrl: string;
    imagePosition: { x: number; y: number };
    zoomLevel: number;
    price: number;
    productData: ProductData | null;
    createdAt: number;
    layout: PanelLayout | null;
    frameThickness: number;
    panelImages: Record<string, string>;
    panelEffects: Record<string, string | number>;
}

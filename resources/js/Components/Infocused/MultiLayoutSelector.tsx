import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";

// Define the types
interface Panel {
    id: string;
    width: number;
    height: number;
    x: number;
    y: number;
    ratio: number;
}

interface PanelLayout {
    id: string;
    name: string;
    description: string;
    panels: Panel[];
    totalWidth: number;
    totalHeight: number;
}

// Updated Panel layouts data - matching the reference image
export const PANEL_LAYOUTS: PanelLayout[] = [
    {
        id: "3panel-1",
        name: "3 Panel Fabric (1)",
        description: "30x49, 24x24(2)",
        panels: [
            { id: "panel-1", width: 30, height: 49, x: 0, y: 0, ratio: 1.63 },
            { id: "panel-2", width: 24, height: 24, x: 31, y: 0, ratio: 1 },
            { id: "panel-3", width: 24, height: 24, x: 31, y: 25, ratio: 1 },
        ],
        totalWidth: 54,
        totalHeight: 49,
    },
    {
        id: "3panel-2",
        name: "3 Panel Fabric (2)",
        description: "24x36(3)",
        panels: [
            { id: "panel-1", width: 24, height: 36, x: -1, y: 0, ratio: 1.5 },
            { id: "panel-2", width: 24, height: 36, x: 25, y: 0, ratio: 1.5 },
            { id: "panel-3", width: 24, height: 36, x: 51, y: 0, ratio: 1.5 },
        ],
        totalWidth: 72,
        totalHeight: 36,
    },
    {
        id: "3panel-3",
        name: "3 Panel Fabric (3)",
        description: "24x24(2), 24x36",
        panels: [
            { id: "panel-1", width: 24, height: 24, x: -2, y: 6, ratio: 1 },
            { id: "panel-2", width: 24, height: 36, x: 24, y: 0, ratio: 1.5 },
            { id: "panel-3", width: 24, height: 24, x: 50, y: 6, ratio: 1 },
        ],
        totalWidth: 72,
        totalHeight: 36,
    },
    {
        id: "3panel-4",
        name: "3 Panel Fabric (4)",
        description: "24x16, 16x24, 12x16",
        panels: [
            { id: "panel-1", width: 24, height: 16, x: -1, y: 0, ratio: 0.67 },
            { id: "panel-2", width: 16, height: 24, x: 24, y: 0, ratio: 1.5 },
            { id: "panel-3", width: 16, height: 16, x: 24, y: 25, ratio: 1.33 },
        ],
        totalWidth: 40,
        totalHeight: 40,
    },
    {
        id: "4panel-1",
        name: "4 Panel Fabric (1)",
        description: "24x24 (4) WD",
        panels: [
            { id: "panel-1", width: 24, height: 24, x: 0, y: 0, ratio: 1 },
            { id: "panel-2", width: 24, height: 24, x: 25, y: 0, ratio: 1 },
            { id: "panel-3", width: 24, height: 24, x: 0, y: 25, ratio: 1 },
            { id: "panel-4", width: 24, height: 24, x: 25, y: 25, ratio: 1 },
        ],
        totalWidth: 48,
        totalHeight: 48,
    },
    {
        id: "4panel-2",
        name: "4 Panel Fabric (2)",
        description: "24x36(4) WD",
        panels: [
            { id: "panel-1", width: 24, height: 36, x: -1, y: 0, ratio: 1.5 },
            { id: "panel-2", width: 24, height: 36, x: 24, y: 0, ratio: 1.5 },
            { id: "panel-3", width: 24, height: 36, x: 49, y: 0, ratio: 1.5 },
            { id: "panel-4", width: 24, height: 36, x: 74, y: 0, ratio: 1.5 },
        ],
        totalWidth: 96,
        totalHeight: 36,
    },
    {
        id: "4panel-3",
        name: "4 Panel Fabric (3)",
        description: "30x49, 49x24, 24x24(2) WD",
        panels: [
            { id: "panel-1", width: 30, height: 49, x: -2, y: 0, ratio: 1.63 },
            { id: "panel-2", width: 49, height: 24, x: 30, y: 0, ratio: 0.49 },
            { id: "panel-3", width: 24, height: 24, x: 30, y: 25, ratio: 1 },
            { id: "panel-4", width: 24, height: 24, x: 55, y: 25, ratio: 1 },
        ],
        totalWidth: 78,
        totalHeight: 49,
    },
    {
        id: "4panel-4",
        name: "4 Panel Fabric (4)",
        description: "30x75, 24x24(3) WD",
        panels: [
            { id: "panel-1", width: 30, height: 76, x: -1, y: 0, ratio: 2.5 },
            { id: "panel-2", width: 24, height: 24, x: 30, y: 0, ratio: 1 },
            { id: "panel-3", width: 24, height: 24, x: 30, y: 26, ratio: 1 },
            { id: "panel-4", width: 24, height: 24, x: 30, y: 52, ratio: 1 },
        ],
        totalWidth: 54,
        totalHeight: 75,
    },
    {
        id: "5panel-1",
        name: "5 Panel Fabric (1)",
        description: "24x24(4), 36x49 WD",
        panels: [
            { id: "panel-1", width: 24, height: 24, x: -1, y: 0, ratio: 1 },
            { id: "panel-2", width: 36, height: 49, x: 24, y: 0, ratio: 1.36 },
            { id: "panel-3", width: 24, height: 24, x: 61, y: 0, ratio: 1 },
            { id: "panel-4", width: 24, height: 24, x: -1, y: 25, ratio: 1 },
            { id: "panel-5", width: 24, height: 24, x: 61, y: 25, ratio: 1 },
        ],
        totalWidth: 84,
        totalHeight: 49,
    },
    {
        id: "6panel-1",
        name: "6 Panel Fabric (1)",
        description: "24x24(6) WD",
        panels: [
            { id: "panel-1", width: 24, height: 24, x: -1, y: 0, ratio: 1 },
            { id: "panel-2", width: 24, height: 24, x: 24, y: 0, ratio: 1 },
            { id: "panel-3", width: 24, height: 24, x: 49, y: 0, ratio: 1 },
            { id: "panel-4", width: 24, height: 24, x: -1, y: 25, ratio: 1 },
            { id: "panel-5", width: 24, height: 24, x: 24, y: 25, ratio: 1 },
            { id: "panel-6", width: 24, height: 24, x: 49, y: 25, ratio: 1 },
        ],
        totalWidth: 72,
        totalHeight: 48,
    },
    {
        id: "9panel-1",
        name: "9 Panel Fabric (1)",
        description: "24x24(9) WD",
        panels: [
            { id: "panel-1", width: 24, height: 24, x: -1, y: 0, ratio: 1 },
            { id: "panel-2", width: 24, height: 24, x: 24, y: 0, ratio: 1 },
            { id: "panel-3", width: 24, height: 24, x: 49, y: 0, ratio: 1 },
            { id: "panel-4", width: 24, height: 24, x: -1, y: 25, ratio: 1 },
            { id: "panel-5", width: 24, height: 24, x: 24, y: 25, ratio: 1 },
            { id: "panel-6", width: 24, height: 24, x: 49, y: 25, ratio: 1 },
            { id: "panel-7", width: 24, height: 24, x: -1, y: 50, ratio: 1 },
            { id: "panel-8", width: 24, height: 24, x: 24, y: 50, ratio: 1 },
            { id: "panel-9", width: 24, height: 24, x: 49, y: 50, ratio: 1 },
        ],
        totalWidth: 72,
        totalHeight: 72,
    },
];

interface LayoutSelectorProps {
    selectedLayout: PanelLayout | null;
    onSelectLayout: (layout: PanelLayout) => void;
}

export const MultiLayoutSelector: React.FC<LayoutSelectorProps> = ({
    selectedLayout,
    onSelectLayout,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedLayout ? selectedLayout.name : "Select Layout"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select Layout</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
                    {PANEL_LAYOUTS.map((layout) => (
                        <div
                            key={layout.id}
                            onClick={() => onSelectLayout(layout)}
                            className={`border rounded-lg p-0 cursor-pointer hover:border-[#68b94c] transition-colors overflow-hidden ${
                                selectedLayout?.id === layout.id
                                    ? "border-2 border-[#68b94c]"
                                    : "border border-gray-200"
                            }`}
                        >
                            <div className="relative aspect-square">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="relative w-full h-full"
                                        style={{
                                            padding: "1rem",
                                        }}
                                    >
                                        <div className="relative w-full h-full">
                                            {layout.panels.map((panel) => (
                                                <div
                                                    key={panel.id}
                                                    className="absolute border border-gray-300 bg-gray-200"
                                                    style={{
                                                        left: `${
                                                            (panel.x /
                                                                layout.totalWidth) *
                                                            100
                                                        }%`,
                                                        top: `${
                                                            (panel.y /
                                                                layout.totalHeight) *
                                                            100
                                                        }%`,
                                                        width: `${
                                                            (panel.width /
                                                                layout.totalWidth) *
                                                            100
                                                        }%`,
                                                        height: `${
                                                            (panel.height /
                                                                layout.totalHeight) *
                                                            100
                                                        }%`,
                                                    }}
                                                >
                                                    {selectedLayout?.id ===
                                                        layout.id &&
                                                        layout.id ===
                                                            "3panel-2" && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50">
                                                                <span className="text-white font-medium">
                                                                    Select
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 border-t">
                                <h3 className="font-medium text-xs text-blue-700">
                                    {layout.name}
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    {layout.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MultiLayoutSelector;

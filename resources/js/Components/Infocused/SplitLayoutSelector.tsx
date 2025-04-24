import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";

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

export const SPLIT_LAYOUTS: PanelLayout[] = [
    {
        id: "3panel-1",
        name: "3 Panel Split (1)",
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
        name: "3 Panel Split (2)",
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
        name: "3 Panel Split (3)",
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
        id: "4panel-1",
        name: "4 Panel Split (1)",
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
        name: "4 Panel Split (2)",
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
];

interface LayoutSelectorProps {
    selectedLayout: PanelLayout | null;
    onSelectLayout: (layout: PanelLayout) => void;
}

export const SplitLayoutSelector: React.FC<LayoutSelectorProps> = ({
    selectedLayout,
    onSelectLayout,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedLayout
                        ? selectedLayout.name
                        : "Select Split Layout"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select Split Layout</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
                    {SPLIT_LAYOUTS.map((layout) => (
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
                                                />
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

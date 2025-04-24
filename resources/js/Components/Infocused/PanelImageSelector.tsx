// components/PanelImageSelector.tsx
import React, { useRef } from "react";
import { Button } from "@/Components/ui/button";

interface PanelImageSelectorProps {
    panelId: string;
    imageUrl?: string;
    onImageChange: (panelId: string, file: File) => void;
    onRemoveImage: (panelId: string) => void;
}

export const PanelImageSelector: React.FC<PanelImageSelectorProps> = ({
    panelId,
    imageUrl,
    onImageChange,
    onRemoveImage,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageChange(panelId, file);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {imageUrl ? (
                <div className="relative group">
                    <img
                        src={imageUrl}
                        alt={`Panel ${panelId}`}
                        className="w-24 h-24 object-cover rounded border border-gray-300"
                    />
                    <button
                        onClick={() => onRemoveImage(panelId)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleButtonClick}
                    className="w-24 h-24 flex items-center justify-center"
                >
                    <span className="text-xs text-center">Add Image</span>
                </Button>
            )}
            <span className="text-xs text-gray-500">
                Panel {panelId.split("-")[1]}
            </span>
        </div>
    );
};

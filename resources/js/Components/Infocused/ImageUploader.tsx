import React, { useState, useRef } from "react";
import { Button } from "@/Components/ui/button";

interface ImageUploaderProps {
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete?: () => void;
    imageUrl?: string | null;
    fileName?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onFileChange,
    onDelete,
    imageUrl,
    fileName,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const fileInput = fileInputRef.current;
            if (fileInput) {
                fileInput.files = e.dataTransfer.files;
                const event = new Event("change", { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        }
    };

    const handleDeleteImage = () => {
        if (onDelete) {
            onDelete();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/jpeg,image/jpg,image/png,image/pdf,image/svg,image/tiff"
                className="hidden"
            />

            {!imageUrl ? (
                <div
                    className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                        isDragging
                            ? "border-[#68b94c] bg-green-50"
                            : "border-gray-300"
                    }`}
                    onClick={handleButtonClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ minHeight: "150px" }}
                >
                    <div className="bg-gray-100 p-4 rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-700 font-medium">Select File</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Upload "jpeg","jpg","png","pdf","svg","tiff" file
                            only.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleButtonClick();
                        }}
                        className="mt-2 border-[#68b94c] text-[#68b94c] hover:bg-[#68b94c] hover:text-white"
                    >
                        My Images
                    </Button>
                </div>
            ) : (
                <div
                    className="relative border rounded-md p-4"
                    style={{ minHeight: "60px" }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-400 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-sm font-medium">
                                {fileName || "Uploaded image"}
                            </span>
                        </div>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDeleteImage}
                            className="h-8 w-8 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 text-red-500 border border-red-500"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/Components/ui/button";

interface StoredImage {
    id: string;
    name: string;
    data: string; // base64 string
    timestamp: number;
}

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
    const modalFileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load stored images when component mounts and when modal opens
    useEffect(() => {
        loadStoredImages();
    }, []);

    useEffect(() => {
        if (showModal) {
            loadStoredImages();
        }
    }, [showModal]);

    // Animation effect for modal
    useEffect(() => {
        if (showModal) {
            setTimeout(() => setIsModalOpen(true), 10);
        } else {
            setIsModalOpen(false);
        }
    }, [showModal]);

    const loadStoredImages = () => {
        try {
            const imagesJson = localStorage.getItem("myImages");
            if (imagesJson) {
                const images = JSON.parse(imagesJson);
                setStoredImages(Array.isArray(images) ? images : []);
            } else {
                setStoredImages([]);
            }
        } catch (error) {
            console.error("Error loading images from localStorage:", error);
            setStoredImages([]);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleModalUploadClick = () => {
        if (modalFileInputRef.current) {
            modalFileInputRef.current.click();
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
            const file = e.dataTransfer.files[0]; // Get the first file for main display

            // Save all dropped files to My Images
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                saveImageToLocalStorage(e.dataTransfer.files[i]);
            }

            // Create a DataTransfer to handle the first file for the main uploader
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;

                // Create a synthetic change event for the main file input
                const event = new Event("change", { bubbles: true }) as any;
                Object.defineProperty(event, "target", {
                    value: { files: dataTransfer.files },
                });
                onFileChange(event);
            }

            // Refresh the stored images list
            loadStoredImages();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Call the parent's onFileChange prop
        onFileChange(e);

        // Save the file to localStorage for My Images
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await saveImageToLocalStorage(file);
            loadStoredImages(); // Refresh the stored images list
        }
    };

    const handleModalFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            const promises = [];

            // Save all selected files to localStorage
            for (let i = 0; i < e.target.files.length; i++) {
                promises.push(saveImageToLocalStorage(e.target.files[i]));
            }

            // Wait for all saves to complete
            await Promise.all(promises);

            // Refresh the stored images
            loadStoredImages();
        }
    };

    const saveImageToLocalStorage = async (file: File): Promise<void> => {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const base64Data = event.target?.result as string;
                    const newImage: StoredImage = {
                        id: `img_${Date.now()}_${Math.random()
                            .toString(36)
                            .substring(2, 9)}`,
                        name: file.name,
                        data: base64Data,
                        timestamp: Date.now(),
                    };

                    // Get existing images
                    let existingImages: StoredImage[] = [];

                    try {
                        const existingImagesJson =
                            localStorage.getItem("myImages");
                        existingImages = existingImagesJson
                            ? JSON.parse(existingImagesJson)
                            : [];
                        // Make sure we have an array
                        if (!Array.isArray(existingImages)) {
                            existingImages = [];
                        }
                    } catch (e) {
                        console.error("Error parsing existing images:", e);
                        existingImages = [];
                    }

                    // Add new image to the beginning of the array
                    const updatedImages = [newImage, ...existingImages];

                    // Save back to localStorage
                    localStorage.setItem(
                        "myImages",
                        JSON.stringify(updatedImages)
                    );

                    console.log(
                        "Image saved to localStorage. Total images:",
                        updatedImages.length
                    );
                    resolve();
                } catch (error) {
                    console.error("Error saving image to localStorage:", error);
                    resolve();
                }
            };

            reader.onerror = () => {
                console.error("FileReader error");
                resolve();
            };

            reader.readAsDataURL(file);
        });
    };

    const handleDeleteImage = () => {
        if (onDelete) {
            onDelete();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openMyImagesModal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const selectImage = (image: StoredImage) => {
        try {
            // Create a file object from the stored image
            const dataUrlParts = image.data.split(",");
            const mimeString = dataUrlParts[0].split(":")[1].split(";")[0];
            const byteString = atob(dataUrlParts[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], image.name, { type: mimeString });

            // Create a synthetic change event
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            if (fileInputRef.current) {
                // Set the files property
                fileInputRef.current.files = dataTransfer.files;

                // Create and dispatch a change event
                const event = new Event("change", { bubbles: true }) as any;
                Object.defineProperty(event, "target", {
                    value: { files: dataTransfer.files },
                });
                onFileChange(event);
            }
        } catch (error) {
            console.error("Error selecting image:", error);
        }

        closeModal();
    };

    const removeFromStorage = (imageId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const updatedImages = storedImages.filter(
                (img) => img.id !== imageId
            );
            localStorage.setItem("myImages", JSON.stringify(updatedImages));
            setStoredImages(updatedImages);
        } catch (error) {
            console.error("Error removing image from localStorage:", error);
        }
    };

    const clearAllImages = () => {
        try {
            localStorage.removeItem("myImages");
            setStoredImages([]);
        } catch (error) {
            console.error("Error clearing images:", error);
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
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
                        onClick={openMyImagesModal}
                        className="mt-2 border-[#68b94c] text-[#68b94c] hover:bg-[#68b94c] hover:text-white"
                    >
                        My Images ({storedImages.length})
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
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openMyImagesModal}
                                className="h-8 border-[#68b94c] text-[#68b94c] hover:bg-[#68b94c] hover:text-white"
                            >
                                My Images ({storedImages.length})
                            </Button>
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
                </div>
            )}

            {/* My Images Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
                    style={{ opacity: isModalOpen ? 1 : 0 }}
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto transform transition-transform duration-300"
                        style={{
                            transform: isModalOpen ? "scale(1)" : "scale(0.95)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                My Saved Images ({storedImages.length})
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* File input for adding new images in modal */}
                        <div className="mb-4">
                            <input
                                type="file"
                                ref={modalFileInputRef}
                                onChange={handleModalFileChange}
                                accept="image/jpeg,image/jpg,image/png,image/pdf,image/svg,image/tiff"
                                className="hidden"
                                multiple
                            />
                            <Button
                                variant="outline"
                                onClick={handleModalUploadClick}
                                className="w-full border-dashed border-2 border-[#68b94c] text-[#68b94c] hover:bg-[#68b94c] hover:text-white py-3"
                            >
                                <svg
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Add New Images
                            </Button>
                        </div>

                        {storedImages.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
                                <p>No saved images found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {storedImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className="relative group cursor-pointer border rounded-md overflow-hidden hover:shadow-md transition-all"
                                            onClick={() => selectImage(image)}
                                        >
                                            <div className="aspect-square">
                                                <img
                                                    src={image.data}
                                                    alt={image.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity"></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 text-xs font-medium bg-white bg-opacity-80 truncate">
                                                {image.name}
                                            </div>
                                            <button
                                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) =>
                                                    removeFromStorage(
                                                        image.id,
                                                        e
                                                    )
                                                }
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {storedImages.length > 0 && (
                                    <div className="mt-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearAllImages}
                                            className="text-red-500 border-red-500 hover:bg-red-50"
                                        >
                                            Clear All Images
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mt-6 flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={closeModal}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Loader2, RotateCw } from "lucide-react";

interface RedirectModalProps {
    isOpen: boolean;
    message?: string;
    onClose?: () => void;
}

export const RedirectModal: React.FC<RedirectModalProps> = ({
    isOpen,
    message = "Redirecting you where you left off...",
    onClose,
}) => {
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev === "...") return "";
                return prev + ".";
            });
        }, 500);

        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <RotateCw className="h-8 w-8 text-[#6db64e] animate-spin" />
                        </div>
                    </div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Please wait
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-2">
                        {message}
                        {dots}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center pt-4">
                    <div className="flex space-x-1">
                        <div
                            className="w-2 h-2 bg-[#6db64e] rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-[#6db64e] rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-[#6db64e] rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                        ></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RedirectModal;

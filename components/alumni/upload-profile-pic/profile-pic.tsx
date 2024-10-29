import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";

interface ProfilePictureUploadProps {
  alumniId: string | null;
  currentProfilePic?: string;
  onUploadSuccess?: (profilePic: string) => void;
  isSubmitting?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  alumniId,
  currentProfilePic,
  onUploadSuccess,
  isSubmitting = false,
}) => {
  const [preview, setPreview] = useState<string | null>(
    currentProfilePic || null
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File type validation
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF)",
        variant: "destructive",
      });
      event.target.value = ""; // Reset input
      return;
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      event.target.value = ""; // Reset input
      return;
    }

    try {
      setIsUploading(true);

      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await handleUpload(file);

      // Reset input for future uploads
      event.target.value = "";
    } catch (error) {
      console.error("File handling error:", error);
      setPreview(currentProfilePic || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    if (alumniId) {
      formData.append("alumniId", alumniId);
    }

    try {
      const response = await fetch("/api/alumni/upload-profile-pic", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

      if (onUploadSuccess) {
        onUploadSuccess(data.profilePic);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload profile picture",
        variant: "destructive",
      });
      setPreview(currentProfilePic || null);
      throw error; // Re-throw to handle in parent
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent event bubbling
    if (!isUploading && !isSubmitting && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={preview || "/placeholder-avatar.png"}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-100">
            {preview ? "Profile" : "Upload"}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full bg-white shadow-lg"
          onClick={handleClick}
          disabled={isUploading || isSubmitting}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
      />

      <p className="text-sm text-gray-500">
        Upload a profile picture (max 5MB)
      </p>
    </div>
  );
};

export default ProfilePictureUpload;

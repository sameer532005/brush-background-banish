
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Invalid file type", {
        description: "Please upload an image file",
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed")
        }
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onFileUploaded(e.target.result as string);
        toast("Image uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  }, [onFileUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div
      className={`flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-lg transition-colors ${
        isDragging ? "border-editor-blue bg-editor-blue/5" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-full bg-editor-blue/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-editor-blue"
            >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              <line x1="16" x2="22" y1="5" y2="5" />
              <line x1="19" x2="19" y1="2" y2="8" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium">Upload an image</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Drag and drop an image, or click to browse
        </p>
      </div>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        Browse Files
      </Button>
    </div>
  );
};

export default FileUpload;


import React, { useState } from "react";
import { Brush } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import Canvas from "@/components/Canvas";
import ResultPreview from "@/components/ResultPreview";

const Index = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const handleFileUploaded = (url: string) => {
    setUploadedImageUrl(url);
    setProcessedImageUrl(null); // Reset processed image when new image is uploaded
  };

  const handleProcessed = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setProcessedImageUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-editor-blue/10 p-3 rounded-full mb-4">
            <Brush size={24} className="text-editor-blue" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Background Banisher</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload an image and use the brush tool to mark areas you want to remove.
            Our tool will process your image and remove the background.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            {!uploadedImageUrl ? (
              <FileUpload onFileUploaded={handleFileUploaded} />
            ) : (
              <Canvas 
                imageUrl={uploadedImageUrl} 
                onProcessed={handleProcessed} 
              />
            )}
          </div>
          <div>
            {processedImageUrl ? (
              <ResultPreview processedImageUrl={processedImageUrl} />
            ) : (
              <div className="border rounded-lg h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No result yet</h3>
                  <p className="text-muted-foreground text-sm">
                    {!uploadedImageUrl 
                      ? "Upload an image to get started"
                      : "Use the brush to mark areas for removal, then click 'Remove Background'"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block rounded-lg border p-4 bg-editor-gray">
            <h3 className="text-sm font-medium mb-2">How to use:</h3>
            <ol className="text-xs text-muted-foreground text-left list-decimal pl-4 space-y-1">
              <li>Upload an image using the upload area</li>
              <li>Use the brush tool to mark areas you want to make transparent</li>
              <li>Click the "Remove Background" button to process the image</li>
              <li>Download your processed image</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

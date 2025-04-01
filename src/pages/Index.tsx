
import React, { useState } from "react";
import { Brush, Filter, Lightbulb } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import Canvas from "@/components/Canvas";
import ResultPreview from "@/components/ResultPreview";
import ImageFilters from "@/components/ImageFilters";

const Index = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("remove-bg");

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
            <Lightbulb size={24} className="text-editor-blue" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Image Editor</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload an image and use our powerful tools to remove backgrounds or apply stunning filters.
          </p>
        </header>
        
        {uploadedImageUrl ? (
          <Tabs 
            defaultValue={selectedTab} 
            onValueChange={setSelectedTab}
            className="mb-8"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="remove-bg" className="flex items-center gap-2">
                <Brush size={16} />
                <span>Remove Background</span>
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Image Filters</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="remove-bg" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Canvas 
                  imageUrl={uploadedImageUrl} 
                  onProcessed={handleProcessed} 
                />
                <div>
                  {processedImageUrl ? (
                    <ResultPreview processedImageUrl={processedImageUrl} />
                  ) : (
                    <div className="border rounded-lg h-full flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Brush size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No result yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Use the brush to mark areas for removal, then click 'Remove Background'
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="filters" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-[#f1f1f1] bg-grid-pattern">
                  <img 
                    src={uploadedImageUrl} 
                    alt="Original" 
                    className="max-w-full h-auto"
                  />
                </div>
                <ImageFilters originalImageUrl={uploadedImageUrl} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <FileUpload onFileUploaded={handleFileUploaded} />
        )}

        <div className="mt-12 text-center">
          <div className="inline-block rounded-lg border p-4 bg-editor-gray">
            <h3 className="text-sm font-medium mb-2">How to use:</h3>
            <ol className="text-xs text-muted-foreground text-left list-decimal pl-4 space-y-1">
              <li>Upload an image using the upload area</li>
              <li>Choose between "Remove Background" or "Image Filters"</li>
              <li>For background removal: Use the brush tool to mark areas you want to make transparent</li>
              <li>For image filters: Apply and adjust various filters to enhance your image</li>
              <li>Download your processed image</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

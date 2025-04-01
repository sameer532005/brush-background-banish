
import React, { useRef, useState, useEffect } from "react";
import { Brush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface CanvasProps {
  imageUrl: string | null;
  onProcessed: (blob: Blob) => void;
}

const Canvas: React.FC<CanvasProps> = ({ imageUrl, onProcessed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image into canvas when imageUrl changes
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      originalImageRef.current = img;
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Calculate position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Start a new path and move to mouse position
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Semi-transparent red
    
    // Draw a dot at starting position
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Calculate position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Continue the path from previous position to current position
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    if (!canvasRef.current || !originalImageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImageRef.current, 0, 0);
    toast("Canvas reset to original image");
  };

  const processImage = () => {
    if (!canvasRef.current || !originalImageRef.current) return;
    
    setIsProcessing(true);
    toast("Processing image...");
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Create temporary canvas for processing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    
    // Draw original image
    tempCtx.drawImage(originalImageRef.current, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const tempImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Set transparent pixels where red brush was applied
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Check if pixel has red brush (red component significantly higher than others)
      if (imageData.data[i] > 200 && imageData.data[i+1] < 100 && imageData.data[i+2] < 100) {
        // Set alpha to 0 (transparent)
        tempImageData.data[i+3] = 0;
      }
    }
    
    // Put processed image data back to temp canvas
    tempCtx.putImageData(tempImageData, 0, 0);
    
    // Convert to blob
    tempCanvas.toBlob((blob) => {
      if (blob) {
        onProcessed(blob);
        toast("Background removed successfully!");
      } else {
        toast("Failed to process image", {
          description: "Please try again or use a different image",
          action: {
            label: "Dismiss",
            onClick: () => console.log("Dismissed")
          }
        });
      }
      setIsProcessing(false);
    }, "image/png");
  };

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-[400px]">
        <p className="text-muted-foreground">Please upload an image to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Brush className="h-5 w-5 text-editor-blue" />
          <div className="text-sm">Brush Size:</div>
          <Slider
            className="w-32"
            value={[brushSize]}
            onValueChange={(values) => setBrushSize(values[0])}
            min={5}
            max={50}
          />
          <div className="text-sm w-8">{brushSize}px</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetCanvas}>
            Reset
          </Button>
          <Button 
            onClick={processImage} 
            disabled={isProcessing}
            className="bg-editor-blue hover:bg-editor-lightBlue"
          >
            {isProcessing ? "Processing..." : "Remove Background"}
          </Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden bg-[#f1f1f1] bg-grid-pattern">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="max-w-full h-auto cursor-crosshair mx-auto"
        />
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          <div className="flex items-center gap-1">
            <Brush className="h-3 w-3" />
            <span>Brush over areas to remove</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;

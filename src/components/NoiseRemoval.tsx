import React, { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NoiseRemovalProps {
  originalImageUrl: string | null;
}

const NoiseRemoval: React.FC<NoiseRemovalProps> = ({ originalImageUrl }) => {
  const [strength, setStrength] = useState(5);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!originalImageUrl) return;
    
    const img = new Image();
    img.src = originalImageUrl;
    img.onload = () => {
      imageRef.current = img;
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
  }, [originalImageUrl]);

  const applyNoiseReduction = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    setIsProcessing(true);
    toast("Processing image...");
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setIsProcessing(false);
      return;
    }
    
    // Draw original image
    ctx.drawImage(imageRef.current, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply box blur for noise reduction
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      setIsProcessing(false);
      return;
    }
    
    tempCtx.drawImage(imageRef.current, 0, 0);
    const tempData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
    
    // Box blur algorithm (modified to reduce strength based on slider)
    const radius = Math.floor(strength / 2);
    const width = canvas.width;
    const height = canvas.height;
    
    // Adjust blur strength
    const blurFactor = strength / 10; // 0.1 to 1
    
    // Process image with noise reduction
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Box blur (collect neighboring pixels)
        for (let ky = -radius; ky <= radius; ky++) {
          const yPos = y + ky;
          if (yPos < 0 || yPos >= height) continue;
          
          for (let kx = -radius; kx <= radius; kx++) {
            const xPos = x + kx;
            if (xPos < 0 || xPos >= width) continue;
            
            const idxNeighbor = (yPos * width + xPos) * 4;
            r += tempData[idxNeighbor];
            g += tempData[idxNeighbor + 1];
            b += tempData[idxNeighbor + 2];
            count++;
          }
        }
        
        // Calculate average
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        
        // Blend original with blurred (based on strength)
        data[idx] = Math.round(tempData[idx] * (1 - blurFactor) + r * blurFactor);
        data[idx + 1] = Math.round(tempData[idx + 1] * (1 - blurFactor) + g * blurFactor);
        data[idx + 2] = Math.round(tempData[idx + 2] * (1 - blurFactor) + b * blurFactor);
        // Alpha channel remains unchanged
      }
    }
    
    // Put processed image data back to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to data URL
    setProcessedImageUrl(canvas.toDataURL('image/png'));
    setIsProcessing(false);
    toast("Noise removal complete!");
  };

  const resetImage = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      setProcessedImageUrl(null);
      toast("Image reset");
    }
  };

  const handleDownload = () => {
    if (!processedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = processedImageUrl;
    link.download = "noise-reduced-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Image downloaded successfully!");
  };

  if (!originalImageUrl) return null;

  return (
    <div className="border rounded-lg overflow-hidden p-4">
      <h3 className="text-lg font-medium mb-3">Noise Removal</h3>
      
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm min-w-[120px]">Reduction Strength:</span>
        <Slider
          value={[strength]}
          onValueChange={(values) => setStrength(values[0])}
          min={1}
          max={10}
          step={1}
          className="flex-1"
        />
        <span className="text-sm min-w-[30px] text-right">{strength}</span>
      </div>
      
      <div className="flex justify-end space-x-2 mb-4">
        <Button variant="outline" onClick={resetImage}>
          Reset
        </Button>
        <Button 
          onClick={applyNoiseReduction}
          disabled={isProcessing}
          className="bg-editor-blue hover:bg-editor-lightBlue"
        >
          {isProcessing ? "Processing..." : "Remove Noise"}
        </Button>
      </div>
      
      <div className="bg-[#f1f1f1] rounded-lg overflow-hidden">
        <div className="relative w-full h-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZmlsbD0iI2YxZjFmMSIgZD0iTTAgMGgyMHYyMEgweiIvPjxwYXRoIGZpbGw9IiNlYWVhZWEiIGQ9Ik0xMCAwaDEwdjEwSDEwek0wIDEwaDEwdjEwSDB6Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]">
          <img
            src={processedImageUrl || originalImageUrl}
            alt="Processed"
            className="max-w-full h-auto mx-auto"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
      
      {processedImageUrl && (
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleDownload}
            className="bg-editor-blue hover:bg-editor-lightBlue"
          >
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoiseRemoval;

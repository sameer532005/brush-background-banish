
import React, { useState, useRef, useEffect } from "react";
import { Crop, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ImageCropperProps {
  originalImageUrl: string | null;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ originalImageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  // Load image into canvas when imageUrl changes
  useEffect(() => {
    if (!originalImageUrl) return;
    
    const img = new Image();
    img.src = originalImageUrl;
    img.onload = () => {
      imageRef.current = img;
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Initial crop box (50% of image centered)
        const initialWidth = img.width * 0.8;
        const initialHeight = img.height * 0.8;
        setCropBox({
          x: (img.width - initialWidth) / 2,
          y: (img.height - initialHeight) / 2,
          width: initialWidth,
          height: initialHeight
        });
        
        // Draw image and crop box
        drawCanvas();
      }
    };
  }, [originalImageUrl]);

  // Redraw canvas whenever crop box changes
  useEffect(() => {
    drawCanvas();
  }, [cropBox]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(imageRef.current, 0, 0);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area (to show the image portion that will be kept)
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    
    // Draw crop box border
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    
    // Draw resize handles
    ctx.fillStyle = '#2563EB';
    const handleSize = 8;
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);
  };

  const getRelativeCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const isInResizeHandle = (x: number, y: number) => {
    const handleSize = 8;
    // Check if cursor is in any of the resize handles
    if (Math.abs(x - cropBox.x) <= handleSize && Math.abs(y - cropBox.y) <= handleSize) {
      return 'topLeft';
    } else if (Math.abs(x - (cropBox.x + cropBox.width)) <= handleSize && Math.abs(y - cropBox.y) <= handleSize) {
      return 'topRight';
    } else if (Math.abs(x - cropBox.x) <= handleSize && Math.abs(y - (cropBox.y + cropBox.height)) <= handleSize) {
      return 'bottomLeft';
    } else if (Math.abs(x - (cropBox.x + cropBox.width)) <= handleSize && Math.abs(y - (cropBox.y + cropBox.height)) <= handleSize) {
      return 'bottomRight';
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getRelativeCoordinates(e);
    
    // Check if clicking on resize handle
    const handle = isInResizeHandle(x, y);
    if (handle) {
      setIsResizing(true);
      setResizeStart({ x, y });
      return;
    }
    
    // Check if clicking inside crop box (for dragging)
    if (x >= cropBox.x && x <= cropBox.x + cropBox.width &&
        y >= cropBox.y && y <= cropBox.y + cropBox.height) {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const { x, y } = getRelativeCoordinates(e);
    
    if (isDragging) {
      // Calculate the new position
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      // Update crop box position, ensuring it stays within canvas bounds
      const newX = Math.max(0, Math.min(canvasRef.current.width - cropBox.width, cropBox.x + deltaX));
      const newY = Math.max(0, Math.min(canvasRef.current.height - cropBox.height, cropBox.y + deltaY));
      
      setCropBox(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
      
      setDragStart({ x, y });
    } else if (isResizing) {
      // Calculate the new width and height
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      
      // Update crop box size, ensuring it stays within canvas bounds
      let newWidth = Math.max(50, Math.min(canvasRef.current.width - cropBox.x, cropBox.width + deltaX));
      let newHeight = Math.max(50, Math.min(canvasRef.current.height - cropBox.y, cropBox.height + deltaY));
      
      // Maintain aspect ratio if needed
      if (aspectRatio) {
        const widthBasedHeight = newWidth / aspectRatio;
        const heightBasedWidth = newHeight * aspectRatio;
        
        if (widthBasedHeight <= canvasRef.current.height - cropBox.y) {
          newHeight = widthBasedHeight;
        } else {
          newWidth = heightBasedWidth;
        }
      }
      
      setCropBox(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
      
      setResizeStart({ x, y });
    } else {
      // Update cursor based on position
      const handle = isInResizeHandle(x, y);
      if (handle) {
        canvasRef.current.style.cursor = handle === 'topLeft' || handle === 'bottomRight' ? 'nwse-resize' : 'nesw-resize';
      } else if (x >= cropBox.x && x <= cropBox.x + cropBox.width &&
                 y >= cropBox.y && y <= cropBox.y + cropBox.height) {
        canvasRef.current.style.cursor = 'move';
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const applyCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropBox.width;
    croppedCanvas.height = cropBox.height;
    
    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;
    
    // Draw the cropped portion of the image
    ctx.drawImage(
      imageRef.current,
      cropBox.x, cropBox.y, cropBox.width, cropBox.height,
      0, 0, cropBox.width, cropBox.height
    );
    
    // Convert to data URL
    const dataUrl = croppedCanvas.toDataURL('image/png');
    setCroppedImageUrl(dataUrl);
    toast("Image cropped successfully!");
  };

  const resetCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    // Reset to initial crop (80% of image centered)
    const img = imageRef.current;
    const initialWidth = img.width * 0.8;
    const initialHeight = img.height * 0.8;
    
    setCropBox({
      x: (img.width - initialWidth) / 2,
      y: (img.height - initialHeight) / 2,
      width: initialWidth,
      height: initialHeight
    });
    
    setCroppedImageUrl(null);
    toast("Crop reset");
  };

  const handleDownload = () => {
    if (!croppedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = croppedImageUrl;
    link.download = "cropped-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Cropped image downloaded successfully!");
  };

  const handleAspectRatioChange = (ratio: number | null) => {
    setAspectRatio(ratio);
    
    if (ratio && canvasRef.current) {
      // Adjust current crop box to match the new aspect ratio
      let newWidth = cropBox.width;
      let newHeight = cropBox.height;
      
      // Calculate new height based on width and aspect ratio
      newHeight = newWidth / ratio;
      
      // Ensure the crop box fits within the canvas
      if (cropBox.y + newHeight > canvasRef.current.height) {
        newHeight = canvasRef.current.height - cropBox.y;
        newWidth = newHeight * ratio;
      }
      
      setCropBox(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
    }
  };

  if (!originalImageUrl) return null;

  return (
    <div className="border rounded-lg overflow-hidden p-4">
      <h3 className="text-lg font-medium mb-3">Image Cropper</h3>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAspectRatioChange(null)}
            className={!aspectRatio ? "bg-blue-100" : ""}
          >
            Free
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAspectRatioChange(1)}
            className={aspectRatio === 1 ? "bg-blue-100" : ""}
          >
            1:1
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAspectRatioChange(4/3)}
            className={aspectRatio === 4/3 ? "bg-blue-100" : ""}
          >
            4:3
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAspectRatioChange(16/9)}
            className={aspectRatio === 16/9 ? "bg-blue-100" : ""}
          >
            16:9
          </Button>
        </div>
        <div className="flex space-x-2 ml-auto">
          <Button variant="outline" size="sm" onClick={resetCrop}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={applyCrop}
            className="bg-editor-blue hover:bg-editor-lightBlue"
          >
            <Check className="h-4 w-4 mr-1" />
            Apply Crop
          </Button>
        </div>
      </div>
      
      <div className="bg-[#f1f1f1] rounded-lg overflow-hidden">
        <div className="relative w-full h-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZmlsbD0iI2YxZjFmMSIgZD0iTTAgMGgyMHYyMEgweiIvPjxwYXRoIGZpbGw9IiNlYWVhZWEiIGQ9Ik0xMCAwaDEwdjEwSDEwek0wIDEwaDEwdjEwSDB6Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]">
          {croppedImageUrl ? (
            <img
              src={croppedImageUrl}
              alt="Cropped"
              className="max-w-full h-auto mx-auto"
            />
          ) : (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="max-w-full h-auto mx-auto cursor-crosshair"
            />
          )}
        </div>
      </div>
      
      {croppedImageUrl && (
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

export default ImageCropper;

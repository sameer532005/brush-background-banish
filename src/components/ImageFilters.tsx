
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";

interface ImageFiltersProps {
  originalImageUrl: string | null;
}

type FilterValues = {
  grayscale: number;
  sepia: number;
  invert: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
};

const ImageFilters: React.FC<ImageFiltersProps> = ({ originalImageUrl }) => {
  const [activeFilter, setActiveFilter] = useState<keyof FilterValues | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    grayscale: 0,
    sepia: 0,
    invert: 0,
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [filteredImageUrl, setFilteredImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!originalImageUrl) return;
    
    // Create a new image from original image URL
    const img = new Image();
    img.src = originalImageUrl;
    img.onload = () => {
      imageRef.current = img;
      applyFilters();
    };
  }, [originalImageUrl]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    // Apply CSS filters
    ctx.filter = `
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      invert(${filters.invert}%)
      blur(${filters.blur}px)
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturate}%)
    `;
    
    // Draw image with filters
    ctx.drawImage(imageRef.current, 0, 0);
    
    // Get filtered image as data URL
    setFilteredImageUrl(canvas.toDataURL('image/png'));
  };

  const resetFilters = () => {
    setFilters({
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
      brightness: 100,
      contrast: 100,
      saturate: 100,
    });
    setActiveFilter(null);
    toast("Filters reset");
  };

  const handleFilterChange = (value: number[]) => {
    if (!activeFilter) return;
    
    setFilters((prev) => ({
      ...prev,
      [activeFilter]: value[0],
    }));
  };

  const handleToggleFilter = (filterName: keyof FilterValues) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  const getFilterMax = (filterName: keyof FilterValues): number => {
    switch (filterName) {
      case 'grayscale':
      case 'sepia':
      case 'invert':
        return 100;
      case 'blur':
        return 20;
      case 'brightness':
      case 'contrast':
      case 'saturate':
        return 200;
      default:
        return 100;
    }
  };

  const handleDownload = () => {
    if (!filteredImageUrl) return;
    
    const link = document.createElement("a");
    link.href = filteredImageUrl;
    link.download = "filtered-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Image downloaded successfully!");
  };

  if (!originalImageUrl) return null;

  return (
    <div className="border rounded-lg overflow-hidden p-4">
      <h3 className="text-lg font-medium mb-3">Image Filters</h3>
      <div className="bg-[#f1f1f1] rounded-lg overflow-hidden">
        <div className="relative w-full h-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZmlsbD0iI2YxZjFmMSIgZD0iTTAgMGgyMHYyMEgweiIvPjxwYXRoIGZpbGw9IiNlYWVhZWEiIGQ9Ik0xMCAwaDEwdjEwSDEwek0wIDEwaDEwdjEwSDB6Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]">
          <img
            src={filteredImageUrl || originalImageUrl}
            alt="Filtered"
            className="max-w-full h-auto mx-auto"
          />
          {/* Hidden canvas for applying filters */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Filter Options</h4>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters} 
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Toggle 
            pressed={activeFilter === 'grayscale'} 
            onPressedChange={() => handleToggleFilter('grayscale')}
            className="text-xs"
          >
            Grayscale
          </Toggle>
          <Toggle 
            pressed={activeFilter === 'sepia'} 
            onPressedChange={() => handleToggleFilter('sepia')}
            className="text-xs"
          >
            Sepia
          </Toggle>
          <Toggle 
            pressed={activeFilter === 'invert'} 
            onPressedChange={() => handleToggleFilter('invert')}
            className="text-xs"
          >
            Negative
          </Toggle>
          <Toggle 
            pressed={activeFilter === 'blur'} 
            onPressedChange={() => handleToggleFilter('blur')}
            className="text-xs"
          >
            Blur
          </Toggle>
          <Toggle 
            pressed={activeFilter === 'brightness'} 
            onPressedChange={() => handleToggleFilter('brightness')}
            className="text-xs"
          >
            Brightness
          </Toggle>
          <Toggle 
            pressed={activeFilter === 'contrast'} 
            onPressedChange={() => handleToggleFilter('contrast')}
            className="text-xs"
          >
            Contrast
          </Toggle>
          <Toggle 
            pressed={activeFilter === 'saturate'} 
            onPressedChange={() => handleToggleFilter('saturate')}
            className="text-xs"
          >
            Saturate
          </Toggle>
        </div>
        
        {activeFilter && (
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm min-w-[100px] capitalize">{activeFilter}:</span>
              <Slider
                value={[filters[activeFilter]]}
                onValueChange={handleFilterChange}
                min={0}
                max={getFilterMax(activeFilter)}
                step={1}
                className="flex-1"
              />
              <span className="text-sm min-w-[40px] text-right">{filters[activeFilter]}%</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-end">
        <Button onClick={handleDownload} className="bg-editor-blue hover:bg-editor-lightBlue">
          Download
        </Button>
      </div>
    </div>
  );
};

export default ImageFilters;


import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResultPreviewProps {
  processedImageUrl: string | null;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ processedImageUrl }) => {
  if (!processedImageUrl) return null;

  const handleDownload = () => {
    if (!processedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = processedImageUrl;
    link.download = "transparent-bg-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Image downloaded successfully!");
  };

  return (
    <div className="border rounded-lg overflow-hidden p-4">
      <h3 className="text-lg font-medium mb-3">Background Removed</h3>
      <div className="bg-[#f1f1f1] rounded-lg overflow-hidden">
        <div className="relative w-full h-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZmlsbD0iI2YxZjFmMSIgZD0iTTAgMGgyMHYyMEgweiIvPjxwYXRoIGZpbGw9IiNlYWVhZWEiIGQ9Ik0xMCAwaDEwdjEwSDEwek0wIDEwaDEwdjEwSDB6Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]">
          <img
            src={processedImageUrl}
            alt="Processed"
            className="max-w-full h-auto mx-auto"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button onClick={handleDownload} className="bg-editor-blue hover:bg-editor-lightBlue">
          Download
        </Button>
      </div>
    </div>
  );
};

export default ResultPreview;

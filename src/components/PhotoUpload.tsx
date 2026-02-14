import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  onImageSelected: (base64: string, preview: string) => void;
  isAnalyzing: boolean;
}

const PhotoUpload = ({ onImageSelected, isAnalyzing }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        onImageSelected(base64, result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <label
      className={`upload-zone flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-300 min-h-[280px] ${
        isDragging ? "dragging" : ""
      } ${isAnalyzing ? "pointer-events-none opacity-50" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={isAnalyzing}
      />
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          {isDragging ? (
            <ImageIcon className="w-7 h-7 text-primary" />
          ) : (
            <Upload className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium text-lg">
            {isDragging ? "Drop your photo here" : "Drop your edited photo here"}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            or click to browse • JPG, PNG, WebP
          </p>
        </div>
      </div>
    </label>
  );
};

export default PhotoUpload;

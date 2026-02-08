import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DropZoneProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

const DropZone = ({ onImageSelect, disabled }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onImageSelect(file);
    },
    [onImageSelect]
  );

  return (
    <motion.label
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center w-full cursor-pointer
        rounded-xl border-2 border-dashed transition-all duration-300
        min-h-[280px] md:min-h-[360px]
        ${isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-card/50"
        }
        ${disabled ? "pointer-events-none opacity-50" : ""}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="rounded-full bg-secondary p-4">
          {isDragging ? (
            <ImageIcon className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? "Release to upload" : "Drop your photo here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse · PNG, JPG, WEBP
          </p>
        </div>
      </div>
    </motion.label>
  );
};

export default DropZone;

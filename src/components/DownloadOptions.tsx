import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportSketch } from "@/lib/sketchify";

interface DownloadOptionsProps {
  sketchSrc: string | null;
  originalWidth: number;
  originalHeight: number;
  disabled?: boolean;
}

const DownloadOptions = ({ sketchSrc, originalWidth, originalHeight, disabled }: DownloadOptionsProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format: 'png' | 'jpeg', quality: 'web' | 'print') => {
    if (!sketchSrc) return;
    setDownloading(true);
    
    try {
      const dataUrl = await exportSketch(sketchSrc, format, quality, originalWidth, originalHeight);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sketch-${quality}.${format}`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={!sketchSrc || disabled || downloading}
            className="gap-2 font-body"
          >
            {downloading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-body text-xs text-muted-foreground">
            Web Quality
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleDownload('png', 'web')} className="font-body">
            PNG (Transparent)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('jpeg', 'web')} className="font-body">
            JPG (Smaller file)
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="font-body text-xs text-muted-foreground">
            Print Quality (2x)
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleDownload('png', 'print')} className="font-body">
            PNG High-Res
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('jpeg', 'print')} className="font-body">
            JPG High-Res
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default DownloadOptions;

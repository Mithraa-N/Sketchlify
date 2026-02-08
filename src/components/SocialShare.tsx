import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SocialShareProps {
  sketchSrc: string | null;
  disabled?: boolean;
}

// Pinterest icon (not in lucide)
const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

// Format image for Instagram (1080x1080 square)
async function formatForInstagram(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 1080;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      
      // Fill with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
      
      // Calculate scaling to fit image in square
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (size - w) / 2;
      const y = (size - h) / 2;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, w, h);
      
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = dataUrl;
  });
}

const SocialShare = ({ sketchSrc, disabled }: SocialShareProps) => {
  const [processing, setProcessing] = useState(false);

  const handleTwitterShare = () => {
    const text = encodeURIComponent("Just transformed a photo into a pencil sketch with Sketchify! ✏️🎨 #Sketchify #DigitalArt #PencilSketch");
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=550,height=420");
    toast.info("Download your sketch and attach it to your tweet!");
  };

  const handlePinterestShare = () => {
    const description = encodeURIComponent("Pencil sketch created with Sketchify - transform any photo into art!");
    window.open(`https://pinterest.com/pin/create/button/?description=${description}`, "_blank", "width=750,height=550");
    toast.info("Download your sketch and upload it to your pin!");
  };

  const handleInstagramDownload = async () => {
    if (!sketchSrc) return;
    setProcessing(true);
    
    try {
      const instagramReady = await formatForInstagram(sketchSrc);
      const a = document.createElement("a");
      a.href = instagramReady;
      a.download = "sketch-instagram.jpg";
      a.click();
      toast.success("Instagram-ready image downloaded! Open Instagram and share from your gallery.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={!sketchSrc || disabled || processing}
            className="gap-2 font-body"
          >
            {processing ? (
              <div className="h-4 w-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={handleTwitterShare} className="gap-3 font-body cursor-pointer">
            <Twitter className="h-4 w-4" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePinterestShare} className="gap-3 font-body cursor-pointer">
            <PinterestIcon />
            Pin on Pinterest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInstagramDownload} className="gap-3 font-body cursor-pointer">
            <Instagram className="h-4 w-4" />
            Download for Instagram
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default SocialShare;

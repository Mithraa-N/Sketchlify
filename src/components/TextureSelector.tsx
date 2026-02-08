import { motion } from "framer-motion";
import { FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

// Import textures
import textureParchment from "@/assets/texture-parchment.jpg";
import textureCanvas from "@/assets/texture-canvas.jpg";
import textureNotebook from "@/assets/texture-notebook.jpg";

export type TextureType = "none" | "parchment" | "canvas" | "notebook";

export const textures: Record<TextureType, { name: string; src: string | null }> = {
  none: { name: "None", src: null },
  parchment: { name: "Parchment", src: textureParchment },
  canvas: { name: "Canvas", src: textureCanvas },
  notebook: { name: "Notebook", src: textureNotebook },
};

interface TextureSelectorProps {
  value: TextureType;
  onChange: (texture: TextureType) => void;
  disabled?: boolean;
}

const TextureSelector = ({ value, onChange, disabled }: TextureSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <FileImage className="h-4 w-4 text-primary" />
        <span className="text-sm font-body font-medium text-foreground">Paper Texture</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(textures) as TextureType[]).map((key) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            disabled={disabled}
            className={cn(
              "relative px-4 py-2 rounded-lg border-2 text-sm font-body font-medium transition-all",
              value === key
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {textures[key].name}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default TextureSelector;

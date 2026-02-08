import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Pencil, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DropZone from "@/components/DropZone";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CreativeControls from "@/components/CreativeControls";
import TextureSelector, { TextureType, textures } from "@/components/TextureSelector";
import DownloadOptions from "@/components/DownloadOptions";
import SocialShare from "@/components/SocialShare";
import { sketchify, applyTexture, defaultOptions, type SketchOptions } from "@/lib/sketchify";

const Index = () => {
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [sketchSrc, setSketchSrc] = useState<string | null>(null);
  const [finalSrc, setFinalSrc] = useState<string | null>(null);
  const [options, setOptions] = useState<SketchOptions>(defaultOptions);
  const [texture, setTexture] = useState<TextureType>("none");
  const [processing, setProcessing] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const textureImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload texture images
  useEffect(() => {
    (Object.entries(textures) as [TextureType, { name: string; src: string | null }][]).forEach(([key, { src }]) => {
      if (src && !textureImagesRef.current.has(key)) {
        const img = new Image();
        img.src = src;
        img.onload = () => textureImagesRef.current.set(key, img);
      }
    });
  }, []);

  const processImage = useCallback(
    async (img: HTMLImageElement, opts: SketchOptions, tex: TextureType) => {
      setProcessing(true);
      
      // Use setTimeout to let UI update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = sketchify(img, opts);
      setSketchSrc(result);
      
      // Apply texture if selected
      if (tex !== "none") {
        const textureImg = textureImagesRef.current.get(tex);
        if (textureImg) {
          const textured = await applyTexture(result, textureImg, "multiply", 0.25);
          setFinalSrc(textured);
        } else {
          setFinalSrc(result);
        }
      } else {
        setFinalSrc(result);
      }
      
      setProcessing(false);
    },
    []
  );

  const handleImageSelect = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalSrc(src);
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
          processImage(img, options, texture);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [options, texture, processImage]
  );

  const handleOptionsChange = useCallback((newOptions: Partial<SketchOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Re-process when options or texture changes
  useEffect(() => {
    if (imageRef.current && originalSrc) {
      const timeout = setTimeout(() => {
        processImage(imageRef.current!, options, texture);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [options, texture, processImage, originalSrc]);

  const handleReset = () => {
    setOriginalSrc(null);
    setSketchSrc(null);
    setFinalSrc(null);
    setOptions(defaultOptions);
    setTexture("none");
    imageRef.current = null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-5 px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold tracking-tight text-foreground">
                Sketchify
              </h1>
              <p className="text-xs font-body text-muted-foreground">
                The Digital Da Vinci
              </p>
            </div>
          </div>
          {originalSrc && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings2 className="h-4 w-4 mr-2" />
                {showControls ? "Hide" : "Show"} Controls
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!originalSrc ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground"
                >
                  Transform photos into
                  <br />
                  <span className="text-primary italic">pencil sketches</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground font-body max-w-md mx-auto"
                >
                  Upload any image and watch it become a graphite masterpiece — 
                  with full creative control over every detail.
                </motion.p>
              </div>
              <div className="w-full">
                <DropZone onImageSelect={handleImageSelect} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              {finalSrc && originalSrc && (
                <BeforeAfterSlider
                  originalSrc={originalSrc}
                  sketchSrc={finalSrc}
                />
              )}

              {processing && (
                <div className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Sketching...
                </div>
              )}

              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full flex flex-col items-center gap-6"
                  >
                    <CreativeControls
                      options={options}
                      onChange={handleOptionsChange}
                      disabled={processing}
                    />
                    <TextureSelector
                      value={texture}
                      onChange={setTexture}
                      disabled={processing}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <DownloadOptions
                  sketchSrc={finalSrc}
                  originalWidth={imageSize.width}
                  originalHeight={imageSize.height}
                  disabled={processing}
                />
                <SocialShare
                  sketchSrc={finalSrc}
                  disabled={processing}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <p className="text-center text-xs text-muted-foreground font-body">
          100% client-side · No data leaves your browser
        </p>
      </footer>
    </div>
  );
};

export default Index;

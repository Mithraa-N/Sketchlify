import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface BeforeAfterSliderProps {
  originalSrc: string;
  sketchSrc: string;
}

const BeforeAfterSlider = ({ originalSrc, sketchSrc }: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Track container width for correct clipping
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) updatePosition(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current) updatePosition(e.touches[0].clientX);
    };
    const handleUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [updatePosition]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl sketch-shadow select-none"
      style={{ aspectRatio: "auto" }}
    >
      {/* Sketch (background) */}
      <img
        src={sketchSrc}
        alt="Sketch"
        className="block w-full h-auto"
        draggable={false}
      />

      {/* Original (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={originalSrc}
          alt="Original"
          className="block w-full h-auto"
          style={{ width: `${containerWidth || 100}px`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 cursor-ew-resize"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute inset-y-0 w-0.5 bg-primary/80" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs font-body font-medium text-foreground">
        Original
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs font-body font-medium text-foreground">
        Sketch
      </div>
    </motion.div>
  );
};

export default BeforeAfterSlider;

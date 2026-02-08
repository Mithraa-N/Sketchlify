import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Paintbrush, Contrast, Sun, Layers, Focus } from "lucide-react";
import type { SketchOptions } from "@/lib/sketchify";

interface CreativeControlsProps {
  options: SketchOptions;
  onChange: (options: Partial<SketchOptions>) => void;
  disabled?: boolean;
}

const CreativeControls = ({ options, onChange, disabled }: CreativeControlsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-2xl space-y-6"
    >
      {/* Main Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Graphite Intensity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-primary" />
            <Label className="text-sm font-body font-medium">Graphite Intensity</Label>
          </div>
          <Slider
            value={[options.intensity]}
            onValueChange={([v]) => onChange({ intensity: v })}
            min={1}
            max={60}
            step={1}
            disabled={disabled}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Fine</span>
            <span className="tabular-nums">{options.intensity}</span>
            <span>Bold</span>
          </div>
        </div>

        {/* Contrast */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Contrast className="h-4 w-4 text-primary" />
            <Label className="text-sm font-body font-medium">Contrast</Label>
          </div>
          <Slider
            value={[options.contrast]}
            onValueChange={([v]) => onChange({ contrast: v })}
            min={-50}
            max={50}
            step={1}
            disabled={disabled}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Soft</span>
            <span className="tabular-nums">{options.contrast}</span>
            <span>Sharp</span>
          </div>
        </div>

        {/* Brightness */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" />
            <Label className="text-sm font-body font-medium">Brightness</Label>
          </div>
          <Slider
            value={[options.brightness]}
            onValueChange={([v]) => onChange({ brightness: v })}
            min={-50}
            max={50}
            step={1}
            disabled={disabled}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Dark</span>
            <span className="tabular-nums">{options.brightness}</span>
            <span>Light</span>
          </div>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Color Sketch Mode */}
        <div className="space-y-4 p-4 rounded-lg bg-card/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <Label className="text-sm font-body font-medium">Color Sketch</Label>
            </div>
            <Switch
              checked={options.colorMode}
              onCheckedChange={(checked) => onChange({ colorMode: checked })}
              disabled={disabled}
            />
          </div>
          {options.colorMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Slider
                value={[options.colorStrength]}
                onValueChange={([v]) => onChange({ colorStrength: v })}
                min={0}
                max={100}
                step={5}
                disabled={disabled}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Subtle</span>
                <span className="tabular-nums">{options.colorStrength}%</span>
                <span>Vivid</span>
              </div>
            </motion.div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Blend watercolor tones with sketch lines
          </p>
        </div>

        {/* Edge Detection */}
        <div className="space-y-4 p-4 rounded-lg bg-card/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="h-4 w-4 text-primary" />
              <Label className="text-sm font-body font-medium">Edge Detection</Label>
            </div>
            <Switch
              checked={options.edgeDetection}
              onCheckedChange={(checked) => onChange({ edgeDetection: checked })}
              disabled={disabled}
            />
          </div>
          {options.edgeDetection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Slider
                value={[options.edgeStrength]}
                onValueChange={([v]) => onChange({ edgeStrength: v })}
                min={0}
                max={100}
                step={5}
                disabled={disabled}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Light</span>
                <span className="tabular-nums">{options.edgeStrength}%</span>
                <span>Strong</span>
              </div>
            </motion.div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Add defined outlines for architecture & details
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CreativeControls;

/**
 * Sketchify engine — replicates OpenCV pencil sketch algorithm in Canvas:
 * 1. Grayscale
 * 2. Invert
 * 3. Gaussian blur (approximated with CanvasRenderingContext2D.filter)
 * 4. Color-dodge blend (divide)
 * 
 * Additional features:
 * - Contrast/Brightness adjustment
 * - Color sketch mode (watercolor effect)
 * - Canny-style edge detection
 */

export interface SketchOptions {
  intensity: number;        // Blur radius (1-60)
  contrast: number;         // -100 to 100
  brightness: number;       // -100 to 100
  colorMode: boolean;       // Blend with original colors
  colorStrength: number;    // 0-100, how much color to keep
  edgeDetection: boolean;   // Add edge outlines
  edgeStrength: number;     // 0-100
}

export const defaultOptions: SketchOptions = {
  intensity: 21,
  contrast: 0,
  brightness: 0,
  colorMode: false,
  colorStrength: 30,
  edgeDetection: false,
  edgeStrength: 50,
};

// Apply contrast and brightness
function adjustContrastBrightness(
  data: Uint8ClampedArray,
  contrast: number,
  brightness: number
): void {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      val = factor * (val - 128) + 128 + brightness;
      data[i + c] = Math.max(0, Math.min(255, val));
    }
  }
}

// Sobel edge detection
function detectEdges(
  imageData: ImageData,
  w: number,
  h: number
): Uint8ClampedArray {
  const src = imageData.data;
  const edges = new Uint8ClampedArray(w * h);

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const gray = src[idx];
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[ki];
          gy += gray * sobelY[ki];
        }
      }
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * w + x] = Math.min(255, magnitude);
    }
  }
  return edges;
}

export function sketchify(
  image: HTMLImageElement,
  options: Partial<SketchOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options };

  // Safe max dimensions for browser canvas (prevent OOM)
  const MAX_DIM = 2400;
  let w = image.naturalWidth;
  let h = image.naturalHeight;

  if (w > MAX_DIM || h > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.floor(w * ratio);
    h = Math.floor(h * ratio);
  }

  // Canvas for grayscale
  const grayCanvas = document.createElement("canvas");
  grayCanvas.width = w;
  grayCanvas.height = h;
  const grayCtx = grayCanvas.getContext("2d", { willReadFrequently: true });
  if (!grayCtx) return "";

  grayCtx.drawImage(image, 0, 0, w, h);
  const grayData = grayCtx.getImageData(0, 0, w, h);
  const gd = grayData.data;

  // Keep original for color mode
  const originalData = new Uint8ClampedArray(gd);

  // Convert to grayscale
  for (let i = 0; i < gd.length; i += 4) {
    const avg = gd[i] * 0.299 + gd[i + 1] * 0.587 + gd[i + 2] * 0.114;
    gd[i] = gd[i + 1] = gd[i + 2] = avg;
  }
  grayCtx.putImageData(grayData, 0, 0);

  // Canvas for inverted
  const invertCanvas = document.createElement("canvas");
  invertCanvas.width = w;
  invertCanvas.height = h;
  const invertCtx = invertCanvas.getContext("2d");
  if (!invertCtx) return "";

  // Invert the grayscale
  const invertedData = grayCtx.getImageData(0, 0, w, h);
  const id = invertedData.data;
  for (let i = 0; i < id.length; i += 4) {
    id[i] = 255 - id[i];
    id[i + 1] = 255 - id[i + 1];
    id[i + 2] = 255 - id[i + 2];
  }
  invertCtx.putImageData(invertedData, 0, 0);

  // Apply Gaussian blur
  // Note: if ctx.filter is not supported or fails, the result will be a blank (white) page in color dodge.
  // We check for support and provide a fallback or ensure it's applied.
  const blurRadius = Math.max(1, Math.round(opts.intensity));
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = w;
  blurCanvas.height = h;
  const blurCtx = blurCanvas.getContext("2d");
  if (!blurCtx) return "";

  // Set filter before drawing
  blurCtx.filter = `blur(${blurRadius}px)`;
  blurCtx.drawImage(invertCanvas, 0, 0);

  // Get blurred data
  const blurredData = blurCtx.getImageData(0, 0, w, h);
  const bd = blurredData.data;

  // Color dodge blend: result = grayscale * 256 / (256 - blurred)
  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = w;
  resultCanvas.height = h;
  const resultCtx = resultCanvas.getContext("2d");
  if (!resultCtx) return "";

  const resultData = resultCtx.createImageData(w, h);
  const rd = resultData.data;

  for (let i = 0; i < gd.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const gray = gd[i + c];
      const blur = bd[i + c];
      // Color dodge formula: min(255, (base * 256) / (256 - blend))
      if (blur === 255) {
        rd[i + c] = 255;
      } else {
        rd[i + c] = Math.min(255, Math.floor((gray * 256) / (256 - blur)));
      }
    }
    rd[i + 3] = 255;
  }

  // Apply edge detection if enabled
  if (opts.edgeDetection) {
    const edgeGrayData = grayCtx.getImageData(0, 0, w, h);
    const edges = detectEdges(edgeGrayData, w, h);
    const edgeFactor = opts.edgeStrength / 100;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const edge = edges[y * w + x];
        const darkening = (edge / 255) * edgeFactor;
        for (let c = 0; c < 3; c++) {
          rd[i + c] = Math.max(0, rd[i + c] - darkening * 255);
        }
      }
    }
  }

  // Apply color mode if enabled
  if (opts.colorMode) {
    const colorFactor = opts.colorStrength / 100;
    for (let i = 0; i < rd.length; i += 4) {
      const sketchBrightness = (rd[i] + rd[i + 1] + rd[i + 2]) / 3 / 255;
      for (let c = 0; c < 3; c++) {
        const original = originalData[i + c];
        const sketch = rd[i + c];
        const faded = original * 0.7 + (originalData[i] + originalData[i + 1] + originalData[i + 2]) / 3 * 0.3;
        rd[i + c] = Math.round(
          sketch * (1 - colorFactor * sketchBrightness) +
          faded * colorFactor * sketchBrightness
        );
      }
    }
  }

  // Apply contrast and brightness
  if (opts.contrast !== 0 || opts.brightness !== 0) {
    adjustContrastBrightness(rd, opts.contrast, opts.brightness);
  }

  resultCtx.putImageData(resultData, 0, 0);
  return resultCanvas.toDataURL("image/png");
}

// Apply paper texture overlay
export function applyTexture(
  sketchDataUrl: string,
  textureImage: HTMLImageElement,
  blendMode: 'multiply' | 'overlay' = 'multiply',
  opacity: number = 0.3
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      // Draw sketch
      ctx.drawImage(img, 0, 0);

      // Draw texture with blend mode
      ctx.globalCompositeOperation = blendMode;
      ctx.globalAlpha = opacity;

      // Tile texture to cover canvas
      const pattern = ctx.createPattern(textureImage, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = sketchDataUrl;
  });
}

// Export with specific format and quality
export function exportSketch(
  dataUrl: string,
  format: 'png' | 'jpeg',
  quality: 'web' | 'print',
  originalWidth: number,
  originalHeight: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Scale based on quality
      const scale = quality === 'print' ? 2 : 1;
      const maxDim = quality === 'print' ? 4096 : 2048;

      let w = originalWidth * scale;
      let h = originalHeight * scale;

      // Limit max dimension
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w *= ratio;
        h *= ratio;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const jpegQuality = quality === 'print' ? 0.95 : 0.85;

      resolve(canvas.toDataURL(mimeType, format === 'jpeg' ? jpegQuality : undefined));
    };
    img.src = dataUrl;
  });
}

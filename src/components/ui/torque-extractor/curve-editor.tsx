import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import type { TorqueExtractorCalibration, ExtractedDataPoint } from '../../../types/extraction';
import { pixelToValues } from '../../../utils/image-extraction';

type CurveEditorProps = {
  imageData: ImageData;
  canvasWidth: number;
  canvasHeight: number;
  calibration: TorqueExtractorCalibration;
  extractedPoints: ExtractedDataPoint[];
  onPointsChange: (points: ExtractedDataPoint[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CurveEditor(props: CurveEditorProps) {
  let canvasRef: HTMLCanvasElement | undefined;

  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);

  const draw = () => {
    const canvas = canvasRef;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = props.imageData;

    canvas.width = props.canvasWidth;
    canvas.height = props.canvasHeight;

    const scale = Math.min(
      props.canvasWidth / width,
      props.canvasHeight / height,
    );

    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (props.canvasWidth - scaledWidth) / 2;
    const offsetY = (props.canvasHeight - scaledHeight) / 2;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvas.getContext('2d')?.putImageData(props.imageData, 0, 0);

    ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
    ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw calibration box (subtle)
    const c = props.calibration;
    const xMin = Math.min(c.left, c.right);
    const xMax = Math.max(c.left, c.right);
    const yMin = Math.min(c.top, c.bottom);
    const yMax = Math.max(c.top, c.bottom);

    ctx.strokeStyle = 'rgba(115, 115, 115, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

    // Draw extracted curve line (amber/orange)
    const points = props.extractedPoints;
    if (points.length > 0) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].pixelX, points[0].pixelY);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].pixelX, points[i].pixelY);
      }
      ctx.stroke();

      // Draw draggable points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.beginPath();
        ctx.arc(p.pixelX, p.pixelY, 5, 0, Math.PI * 2);
        ctx.fillStyle = dragIndex() === i ? 'rgba(163, 163, 163, 1)' : 'rgba(245, 158, 11, 1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(38, 38, 38, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  createEffect(() => {
    props.extractedPoints;
    draw();
  });

  const handlePointerDown = (e: PointerEvent) => {
    const canvas = canvasRef;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const threshold = 15;
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < props.extractedPoints.length; i++) {
      const p = props.extractedPoints[i];
      const dx = p.pixelX - x;
      const dy = p.pixelY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold && dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    if (nearestIdx !== -1) {
      setDragIndex(nearestIdx);
      setIsDragging(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging() || dragIndex() === null) return;

    const canvas = canvasRef;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const c = props.calibration;
    const xMin = Math.min(c.left, c.right);
    const xMax = Math.max(c.left, c.right);
    const yMin = Math.min(c.top, c.bottom);
    const yMax = Math.max(c.top, c.bottom);

    const clampedX = Math.max(xMin, Math.min(x, xMax));
    const clampedY = Math.max(yMin, Math.min(y, yMax));

    const values = pixelToValues({ x: clampedX, y: clampedY }, props.calibration);

    const newPoints = [...props.extractedPoints];
    const idx = dragIndex()!;
    newPoints[idx] = {
      pixelX: clampedX,
      pixelY: clampedY,
      rpm: values.rpm,
      torque: values.torque,
    };

    props.onPointsChange(newPoints);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    setDragIndex(null);
    canvasRef?.releasePointerCapture(e.pointerId);
  };

  onMount(() => {
    const canvas = canvasRef;
    if (!canvas) return;

    draw();
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    onCleanup(() => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    });
  });

  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <button
          type="button"
          onClick={props.onBack}
          class="border border-border hover:border-border bg-surface-elevated hover:bg-surface-elevated text-muted hover:text-foreground-secondary px-4 py-2 text-xs uppercase tracking-wider transition-colors"
        >
          Back
        </button>
        <span class="text-[10px] text-muted uppercase tracking-wider">
          {props.extractedPoints.length} points
        </span>
        <button
          type="button"
          onClick={props.onNext}
          class="border border-border hover:border-border bg-surface-elevated hover:bg-surface-elevated text-foreground-secondary hover:text-foreground px-4 py-2 text-xs uppercase tracking-wider transition-colors"
        >
          Preview
        </button>
      </div>

      <div class="relative border border-border bg-surface">
        <canvas ref={canvasRef} class="block" style={{ cursor: 'crosshair' }} />
      </div>

      <div class="text-[10px] text-muted uppercase tracking-wider">
        Drag points to adjust values
      </div>
    </div>
  );
}

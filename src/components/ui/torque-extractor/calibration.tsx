import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import type { TorqueExtractorCalibration } from '../../../types/extraction';
import { NumberInput } from '../number-input';

type CalibrationOverlayProps = {
  imageData: ImageData;
  canvasWidth: number;
  canvasHeight: number;
  calibration: TorqueExtractorCalibration;
  onChange: (calibration: TorqueExtractorCalibration) => void;
  onBack: () => void;
  onNext: () => void;
  isValid: boolean;
}

type DragTarget = 'top' | 'bottom' | 'left' | 'right' | null;

export function CalibrationOverlay(props: CalibrationOverlayProps) {
  let canvasRef: HTMLCanvasElement | undefined;

  const [dragTarget, setDragTarget] = createSignal<DragTarget>(null);
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

    const c = props.calibration;
    const xMin = Math.min(c.left, c.right);
    const xMax = Math.max(c.left, c.right);
    const yMin = Math.min(c.top, c.bottom);
    const yMax = Math.max(c.top, c.bottom);

    // Draw calibration lines in neutral/amber color
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(xMin, c.top);
    ctx.lineTo(xMax, c.top);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xMin, c.bottom);
    ctx.lineTo(xMax, c.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(c.left, yMin);
    ctx.lineTo(c.left, yMax);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(c.right, yMin);
    ctx.lineTo(c.right, yMax);
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.fillRect(xMin, yMin, xMax - xMin, yMax - yMin);
  };

  createEffect(() => {
    props.calibration;
    draw();
  });

  const getLineDistance = (x: number, y: number, line: { x1: number; y1: number; x2: number; y2: number }): number => {
    const A = x - line.x1;
    const B = y - line.y1;
    const C = line.x2 - line.x1;
    const D = line.y2 - line.y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number;
    let yy: number;
    if (param < 0) {
      xx = line.x1;
      yy = line.y1;
    } else if (param > 1) {
      xx = line.x2;
      yy = line.y2;
    } else {
      xx = line.x1 + param * C;
      yy = line.y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePointerDown = (e: PointerEvent) => {
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

    const threshold = 10;

    let target: DragTarget = null;
    if (getLineDistance(x, y, { x1: xMin, y1: c.top, x2: xMax, y2: c.top }) < threshold) {
      target = 'top';
    } else if (getLineDistance(x, y, { x1: xMin, y1: c.bottom, x2: xMax, y2: c.bottom }) < threshold) {
      target = 'bottom';
    } else if (getLineDistance(x, y, { x1: c.left, y1: yMin, x2: c.left, y2: yMax }) < threshold) {
      target = 'left';
    } else if (getLineDistance(x, y, { x1: c.right, y1: yMin, x2: c.right, y2: yMax }) < threshold) {
      target = 'right';
    }

    if (target) {
      setDragTarget(target);
      setIsDragging(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging()) return;

    const canvas = canvasRef;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const c = { ...props.calibration };
    const xMin = Math.min(c.left, c.right);
    const xMax = Math.max(c.left, c.right);
    const yMin = Math.min(c.top, c.bottom);
    const yMax = Math.max(c.top, c.bottom);

    switch (dragTarget()) {
      case 'top':
        c.top = Math.max(0, Math.min(y, yMax - 10));
        break;
      case 'bottom':
        c.bottom = Math.max(yMin + 10, Math.min(y, props.canvasHeight));
        break;
      case 'left':
        c.left = Math.max(0, Math.min(x, xMax - 10));
        break;
      case 'right':
        c.right = Math.max(xMin + 10, Math.min(x, props.canvasWidth));
        break;
    }

    props.onChange(c);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    setDragTarget(null);
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
        <button
          type="button"
          onClick={props.onNext}
          disabled={!props.isValid}
          classList={{
            'border-emerald-700 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50': props.isValid,
            'border-border bg-surface text-muted cursor-not-allowed': !props.isValid,
          }}
          class="border px-4 py-2 text-xs uppercase tracking-wider transition-colors"
        >
          Extract Curve
        </button>
      </div>

      <div class="relative border border-border bg-surface">
        <canvas ref={canvasRef} class="block" style={{ cursor: 'crosshair' }} />
      </div>

      <div class="grid grid-cols-2 gap-4 p-3 border border-border bg-surface/50">
        <div class="space-y-2">
          <span class="text-[10px] text-muted uppercase tracking-wider block">RPM Scale</span>
          <div class="flex gap-2 items-center">
            <span class="text-[10px] text-muted w-8 uppercase">Min:</span>
            <NumberInput
              value={props.calibration.minRpm}
              onChange={(val) => props.onChange({ ...props.calibration, minRpm: val })}
              class="flex-1 bg-surface-elevated border border-border text-foreground px-2 py-1.5 text-xs focus:border-border focus:outline-none"
            />
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-[10px] text-muted w-8 uppercase">Max:</span>
            <NumberInput
              value={props.calibration.maxRpm}
              onChange={(val) => props.onChange({ ...props.calibration, maxRpm: val })}
              class="flex-1 bg-surface-elevated border border-border text-foreground px-2 py-1.5 text-xs focus:border-border focus:outline-none"
            />
          </div>
        </div>

        <div class="space-y-2">
          <span class="text-[10px] text-muted uppercase tracking-wider block">Torque (Nm)</span>
          <div class="flex gap-2 items-center">
            <span class="text-[10px] text-muted w-8 uppercase">Min:</span>
            <NumberInput
              value={props.calibration.minTorque}
              onChange={(val) => props.onChange({ ...props.calibration, minTorque: val })}
              class="flex-1 bg-surface-elevated border border-border text-foreground px-2 py-1.5 text-xs focus:border-border focus:outline-none"
            />
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-[10px] text-muted w-8 uppercase">Max:</span>
            <NumberInput
              value={props.calibration.maxTorque}
              onChange={(val) => props.onChange({ ...props.calibration, maxTorque: val })}
              class="flex-1 bg-surface-elevated border border-border text-foreground px-2 py-1.5 text-xs focus:border-border focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div class="text-[10px] text-muted uppercase tracking-wider">
        Drag lines to set bounds, enter scale values
      </div>
    </div>
  );
}

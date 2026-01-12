import { createSignal, createMemo, Show, For } from 'solid-js';
import { Portal } from 'solid-js/web';
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogTitle,
  DialogCloseTrigger,
  useDialogContext,
} from '@ark-ui/solid';
import type { TorqueExtractorCalibration, ExtractedDataPoint, ExtractionStep } from '@/types/extraction';
import { extractTorqueCurve } from "@/features/gearbox/utils/image-extraction";
import { CalibrationOverlay } from './calibration';
import { CurveEditor } from './curve-editor';
import { DataPreview } from './data-preview';

type TorqueExtractorProps = {
  onClose: () => void;
  onApply: (data: { torque: number; rpm: number }[], imageUrl?: string) => void;
}

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;

const STEPS: { id: ExtractionStep; label: string }[] = [
  { id: 'upload', label: 'UPLOAD' },
  { id: 'calibrate', label: 'CALIBRATE' },
  { id: 'extract', label: 'EDIT' },
  { id: 'preview', label: 'PREVIEW' },
];

export function TorqueExtractor(props: TorqueExtractorProps) {
  const [step, setStep] = createSignal<ExtractionStep>('upload');
  const [imageData, setImageData] = createSignal<ImageData | null>(null);
  const [imageUrl, setImageUrl] = createSignal<string | null>(null);
  const [calibration, setCalibration] = createSignal<TorqueExtractorCalibration>({
    left: 50,
    right: CANVAS_WIDTH - 50,
    top: 50,
    bottom: CANVAS_HEIGHT - 50,
    minRpm: 0,
    maxRpm: 0,
    minTorque: 0,
    maxTorque: 0,
  });
  const [extractedPoints, setExtractedPoints] = createSignal<ExtractedDataPoint[]>([]);

  const isCalibrationValid = createMemo(() => {
    const c = calibration();
    return c.minRpm < c.maxRpm && c.minTorque < c.maxTorque && c.maxRpm > 0 && c.maxTorque > 0;
  });

  const currentStepIndex = createMemo(() => {
    return STEPS.findIndex(s => s.id === step());
  });

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        setImageData(data);
        setImageUrl(event.target?.result as string);

        const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (CANVAS_WIDTH - scaledWidth) / 2;
        const offsetY = (CANVAS_HEIGHT - scaledHeight) / 2;

        setCalibration(prev => ({
          ...prev,
          left: offsetX + scaledWidth * 0.1,
          right: offsetX + scaledWidth * 0.9,
          top: offsetY + scaledHeight * 0.1,
          bottom: offsetY + scaledHeight * 0.9,
        }));

        setStep('calibrate');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = () => {
    const data = imageData();
    const calib = calibration();
    if (!data) return;

    const scale = Math.min(CANVAS_WIDTH / data.width, CANVAS_HEIGHT / data.height);
    const scaledWidth = data.width * scale;
    const scaledHeight = data.height * scale;
    const offsetX = (CANVAS_WIDTH - scaledWidth) / 2;
    const offsetY = (CANVAS_HEIGHT - scaledHeight) / 2;

    const imageCalib: TorqueExtractorCalibration = {
      left: (calib.left - offsetX) / scale,
      right: (calib.right - offsetX) / scale,
      top: (calib.top - offsetY) / scale,
      bottom: (calib.bottom - offsetY) / scale,
      minRpm: calib.minRpm,
      maxRpm: calib.maxRpm,
      minTorque: calib.minTorque,
      maxTorque: calib.maxTorque,
    };

    const points = extractTorqueCurve(data, imageCalib);

    const canvasPoints = points.map(p => ({
      pixelX: p.pixelX * scale + offsetX,
      pixelY: p.pixelY * scale + offsetY,
      rpm: p.rpm,
      torque: p.torque,
    }));

    setExtractedPoints(canvasPoints);
    setStep('extract');
  };

  const handleApply = () => {
    const points = extractedPoints();
    const data = points.map(p => ({
      torque: Math.round(p.torque * 10) / 10,
      rpm: Math.round(p.rpm),
    }));
    props.onApply(data, imageUrl() ?? undefined);
    props.onClose();
  };

  const handleBack = () => {
    if (step() === 'calibrate') {
      setStep('upload');
    } else if (step() === 'extract') {
      setStep('calibrate');
    } else if (step() === 'preview') {
      setStep('extract');
    }
  };

  const handleNext = () => {
    if (step() === 'extract') {
      setStep('preview');
    }
  };

  return (
    <DialogRoot
      open={true}
      onOpenChange={(details) => {
        if (!details.open) {
          props.onClose();
        }
      }}
    >
      <Portal>
        <DialogBackdrop class="fixed inset-0 z-50 bg-black/90" />
        <DialogPositioner class="fixed inset-0 z-50 flex items-center justify-center">
          <DialogContent class="bg-background border border-border w-[800px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-4 bg-muted" />
                <DialogTitle class="text-xs font-semibold tracking-wider uppercase text-foreground">
                  Import Torque Curve
                </DialogTitle>
              </div>
              <DialogCloseTrigger class="text-muted hover:text-foreground-secondary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span class="sr-only">Close</span>
              </DialogCloseTrigger>
            </div>

            {/* Step Indicator */}
            <div class="flex items-center px-4 py-2 border-b border-border/50 bg-surface/30">
              {STEPS.map((s, idx) => (
                <>
                  <div
                    class="flex items-center gap-2"
                    classList={{
                      'text-foreground': currentStepIndex() === idx,
                      'text-muted': currentStepIndex() !== idx,
                      'text-emerald-500': currentStepIndex() > idx,
                    }}
                  >
                    <div
                      class="w-5 h-5 flex items-center justify-center text-[10px] font-medium border"
                      classList={{
                        'border-border bg-surface-elevated': currentStepIndex() === idx,
                        'border-border bg-surface': currentStepIndex() < idx,
                        'border-emerald-600 bg-emerald-900/30': currentStepIndex() > idx,
                      }}
                    >
                      {currentStepIndex() > idx ? '✓' : idx + 1}
                    </div>
                    <span class="text-[10px] tracking-wider">{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      class="flex-1 h-px mx-3"
                      classList={{
                        'bg-emerald-600': currentStepIndex() > idx,
                        'bg-surface-elevated': currentStepIndex() <= idx,
                      }}
                    />
                  )}
                </>
              ))}
            </div>

            {/* Content */}
            <div class="flex-1 overflow-y-auto p-4">
              {/* Upload Step */}
              <Show when={step() === 'upload'}>
                <div class="flex flex-col items-center justify-center gap-4 py-8">
                  <div class="text-center mb-2">
                    <span class="text-[10px] uppercase tracking-wider text-muted block mb-1">
                      Step 1
                    </span>
                    <span class="text-sm text-foreground-secondary">
                      Select torque curve screenshot
                    </span>
                  </div>
                  <label class="cursor-pointer border border-border hover:border-border bg-surface hover:bg-surface-elevated px-6 py-3 flex items-center gap-3 transition-colors">
                    <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs uppercase tracking-wider text-foreground-secondary">Select Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      class="hidden"
                    />
                  </label>
                  <span class="text-[10px] text-muted uppercase tracking-wider">
                    PNG, JPG, WebP
                  </span>
                </div>
              </Show>

              {/* Calibrate Step */}
              <Show when={step() === 'calibrate' && imageData()}>
                <CalibrationOverlay
                  imageData={imageData()!}
                  canvasWidth={CANVAS_WIDTH}
                  canvasHeight={CANVAS_HEIGHT}
                  calibration={calibration()}
                  onChange={setCalibration}
                  onBack={handleBack}
                  onNext={handleExtract}
                  isValid={isCalibrationValid()}
                />
              </Show>

              {/* Extract/Edit Step */}
              <Show when={step() === 'extract' && imageData()}>
                <CurveEditor
                  imageData={imageData()!}
                  canvasWidth={CANVAS_WIDTH}
                  canvasHeight={CANVAS_HEIGHT}
                  calibration={calibration()}
                  extractedPoints={extractedPoints()}
                  onPointsChange={setExtractedPoints}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              </Show>

              {/* Preview Step */}
              <Show when={step() === 'preview'}>
                <DataPreview
                  extractedPoints={extractedPoints()}
                  onBack={handleBack}
                  onApply={handleApply}
                />
              </Show>
            </div>

            {/* Footer */}
            <div class="px-4 py-3 border-t border-border bg-surface/30 flex justify-end">
              <button
                type="button"
                onClick={props.onClose}
                class="border border-border hover:border-border bg-surface-elevated hover:bg-surface-elevated text-muted hover:text-foreground-secondary px-4 py-2 text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
}

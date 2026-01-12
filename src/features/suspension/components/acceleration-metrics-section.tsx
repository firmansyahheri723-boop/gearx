import { SectionHeader } from '../../../components/ui/section-header';
import { MetricCard, MetricCardWithHelp } from '../../../components/ui/metric-card';
import type { SuspensionOutputs } from '../utils/suspension';

type Props = {
  outputs: SuspensionOutputs;
  frontWeightDistribution: number;
}

export function AccelerationMetricsSection(props: Props) {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader
        title="Acceleration & Weight Transfer"
        variant="output"
        help={{
          description: 'Weight transfers from front to rear under acceleration, affecting traction distribution.',
          formula: '\\Delta W = \\frac{h}{L} \\cdot W \\cdot a',
          variables: [
            'ΔW = weight transfer (kg)',
            'h = CoG height (m)',
            'L = wheelbase (m)',
            'W = total weight (kg)',
            'a = longitudinal acceleration (g)',
          ],
          position: 'bottom',
        }}
      />
      <div class="p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCardWithHelp
            label="Long. Accel"
            value={props.outputs.acceleration.longitudinalAccelG.toFixed(2)}
            unit="g"
            highlight
            help={{
              description: 'Longitudinal acceleration calculated from 0-100 kph time. This determines how much weight transfers under acceleration.',
              formula: 'a = \\frac{v_f - v_s}{\\Delta t \\cdot g} = \\frac{27.78}{t_{0-100} \\cdot 9.81}',
              variables: [
                'a = acceleration (g)',
                'v_f = final velocity (27.78 m/s = 100 kph)',
                'v_s = starting velocity (0 m/s)',
                't = 0-100 kph time (s)',
              ],
            }}
          />
          <MetricCardWithHelp
            label="Lat. Accel"
            value={props.outputs.acceleration.lateralAccelG.toFixed(2)}
            unit="g"
            highlight
            help={{
              description: 'Lateral acceleration at a given corner speed and radius. Uses 118m radius as a standard reference corner.',
              formula: 'A_a = \\frac{V^2}{R \\cdot g}',
              variables: [
                'A_a = lateral acceleration (g)',
                'V = velocity (m/s)',
                'R = corner radius (118 m)',
                'g = gravity (9.81 m/s²)',
              ],
            }}
          />
          <MetricCardWithHelp
            label="Weight Transfer"
            value={props.outputs.acceleration.weightTransfer.toFixed(1)}
            unit="kg"
            help={{
              description: 'Weight transfers from front to rear under acceleration, affecting traction distribution.',
              formula: '\\Delta W = \\frac{h}{L} \\cdot W \\cdot a',
              variables: [
                'ΔW = weight transfer (kg)',
                'h = CoG height (m)',
                'L = wheelbase (m)',
                'W = total weight (kg)',
                'a = longitudinal acceleration (g)',
              ],
            }}
          />
          <MetricCard
            label="Front on Accel"
            value={props.outputs.acceleration.frontWeightOnAccel.toFixed(1)}
            unit="kg"
          />
          <MetricCard
            label="Rear on Accel"
            value={props.outputs.acceleration.rearWeightOnAccel.toFixed(1)}
            unit="kg"
          />
          <MetricCard
            label="Front Bias"
            value={props.outputs.acceleration.frontBiasOnAccel.toFixed(1)}
            unit="%"
          />
        </div>

        <div class="mt-4 pt-4 border-t border-border/50">
          <div class="text-[10px] uppercase tracking-wider text-muted mb-2">
            Weight Distribution Under Acceleration
          </div>
          <div class="relative h-6 bg-surface-elevated rounded">
            <div
              class="absolute left-0 top-0 h-full bg-foreground/30 border-r border-foreground-secondary transition-all"
              style={{ width: `${props.outputs.acceleration.frontBiasOnAccel}%` }}
            />
            <div class="absolute inset-0 flex items-center justify-between px-2 text-[10px]">
              <span class="text-foreground-secondary font-medium">
                Front: {props.outputs.acceleration.frontBiasOnAccel.toFixed(1)}%
              </span>
              <span class="text-amber-400 font-medium">
                Rear: {props.outputs.acceleration.rearBiasOnAccel.toFixed(1)}%
              </span>
            </div>
          </div>
          <div class="mt-1 flex justify-between text-[10px] text-muted">
            <span>Static: {props.frontWeightDistribution}% front</span>
            <span>
              Change: {(props.frontWeightDistribution - props.outputs.acceleration.frontBiasOnAccel).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

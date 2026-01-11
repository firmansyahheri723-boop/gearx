import { SectionHeader } from '../../ui/section-header';
import { FormulaCard } from '../../ui/metric-card';

export function FormulaReferenceSection() {
  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50">
      <SectionHeader title="Formula Reference" variant="input" />
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormulaCard
            title="Spring Stiffness"
            formula="K = 4 \pi^2 f^2 m"
            variables={['K = stiffness (N/m)', 'f = ride frequency (Hz)', 'm = sprung mass (kg)']}
          />
          <FormulaCard
            title="Critical Damping"
            formula="C_{crit} = 2\sqrt{K \cdot m}"
            variables={['C_crit = critical damping (N·s/m)', 'K = stiffness', 'm = sprung mass']}
          />
          <FormulaCard
            title="Damping Ratios"
            formula="C = C_{crit} \times \zeta"
            variables={[
              'Bump = C × 2/3',
              'Fast Bump = C × 1/3',
              'Rebound = C × 3/2',
              'Fast Rebound = C × 3/4',
            ]}
          />
          <FormulaCard
            title="Desired Roll Rate"
            formula="K_{\phi DES} = \frac{W \cdot H}{\phi / A_y}"
            variables={['W = weight (kg)', 'H = roll center to CoG (m)', 'φ/Ay = roll gradient (deg/g)']}
          />
          <FormulaCard
            title="Longitudinal Accel"
            formula="a = \frac{27.78}{t_{0-100} \times 9.81}"
            variables={['a = acceleration (g)', 't = 0-100 kph time (s)', '27.78 = 100 kph in m/s']}
          />
          <FormulaCard
            title="Lateral Accel"
            formula="A_a = \frac{V^2}{R \times g}"
            variables={['A_a = lateral accel (g)', 'V = velocity (m/s)', 'R = radius (m)']}
          />
        </div>
      </div>
    </div>
  );
}

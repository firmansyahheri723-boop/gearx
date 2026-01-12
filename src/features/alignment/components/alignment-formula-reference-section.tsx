import { SectionHeader } from '@/components/ui/section-header';
import { FormulaCard } from '@/components/ui/metric-card';

export function AlignmentFormulaReferenceSection() {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader title="Formula Reference" variant="input" />
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormulaCard
            title="Contact Patch"
            formula="CP = W \cdot \cos(\theta)"
            variables={['CP = contact patch width', 'W = tire width', 'θ = camber angle']}
          />
          <FormulaCard
            title="Camber Gain"
            formula="\Delta\theta = \delta \cdot \sin(\theta)"
            variables={['Δθ = camber gain', 'δ = steering angle', 'θ = static camber']}
          />
          <FormulaCard
            title="Ackermann Formula"
            formula="\cot(\alpha_O) - \cot(\alpha_I) = \frac{L}{E}"
            variables={['α_O = outer angle', 'α_I = inner angle', 'L = wheelbase', 'E = offset']}
          />
          <FormulaCard
            title="Scrub Radius"
            formula="r_s = r \cdot \sin(\gamma)"
            variables={['r_s = scrub radius', 'r = wheel radius', 'γ = caster angle']}
          />
          <FormulaCard
            title="Toe Effect"
            formula="\Delta\beta = \frac{\delta_t}{L}"
            variables={['Δβ = slip angle change', 'δ_t = toe angle', 'L = wheelbase']}
          />
          <FormulaCard
            title="Understeer Gradient"
            formula="K = \frac{W_f}{R_f} - \frac{W_r}{R_r}"
            variables={['K = understeer gradient', 'W = weight distribution', 'R = cornering stiffness']}
          />
        </div>
      </div>
    </div>
  );
}

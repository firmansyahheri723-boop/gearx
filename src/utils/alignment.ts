import type { AlignmentInputs, AlignmentOutputs } from '../types';

export function calculateAlignmentOutputs(inputs: AlignmentInputs): AlignmentOutputs {
  const {
    frontCamber, frontCaster, frontToe, frontAckermann,
    rearCamber, rearToe, maxSteeringAngle,
  } = inputs;

  const frontCamberGain = Math.abs(maxSteeringAngle * Math.sin(frontCamber * Math.PI / 180));
  const rearCamberGain = Math.abs(maxSteeringAngle * Math.sin(rearCamber * Math.PI / 180));

  const contactPatchFront = Math.cos(frontCamber * Math.PI / 180) * 100;
  const contactPatchRear = Math.cos(rearCamber * Math.PI / 180) * 100;

  const frontGripFactor = Math.abs(frontCamber) * (1 + frontToe * 0.1);
  const rearGripFactor = Math.abs(rearCamber) * (1 + rearToe * 0.1);
  
  const understeerTendency = Math.min(100, Math.max(-100,
    (frontGripFactor - rearGripFactor) * 10 + frontToe * 5
  ));
  const oversteerTendency = -understeerTendency;

  let turnInResponse: 'sharp' | 'moderate' | 'slow';
  if (frontToe < -0.5) turnInResponse = 'sharp';
  else if (frontToe > 0.5) turnInResponse = 'slow';
  else turnInResponse = 'moderate';

  const straightLineStability = Math.max(0, Math.min(100,
    50 - frontToe * 10 - rearToe * 15 + Math.abs(frontAckermann) * 0.2
  ));

  const ackermannType = frontAckermann < -10 ? 'reverse' 
    : frontAckermann > 10 ? 'positive' 
    : 'parallel';

  const innerWheelAngle = maxSteeringAngle;
  const outerWheelAngle = maxSteeringAngle * (1 - frontAckermann / 100);

  const scrubRadiusEstimate = Math.tan(frontCaster * Math.PI / 180) * 5;

  const recommendations = generateRecommendations(inputs, {
    understeerTendency, turnInResponse, straightLineStability, ackermannType
  });

  return {
    understeerTendency,
    oversteerTendency,
    turnInResponse,
    straightLineStability,
    frontCamberGain,
    rearCamberGain,
    contactPatchFront,
    contactPatchRear,
    innerWheelAngle,
    outerWheelAngle,
    ackermannType,
    scrubRadiusEstimate,
    recommendations,
  };
}

function generateRecommendations(inputs: AlignmentInputs, outputs: Partial<AlignmentOutputs>): string[] {
  const recs: string[] = [];
  
  if (outputs.turnInResponse === 'slow') {
    recs.push('Consider toe out (-0.2° to -0.5°) for sharper turn-in');
  }
  if (outputs.straightLineStability && outputs.straightLineStability < 30) {
    recs.push('Reduce rear toe out for better straight-line stability');
  }
  if (inputs.frontCamber < -5) {
    recs.push('Front camber very aggressive - monitor inner tire wear');
  }
  if (inputs.rearToe < -1) {
    recs.push('Rear toe out will cause instability at high speed');
  }
  if (outputs.ackermannType === 'reverse') {
    recs.push('Reverse Ackermann is rare - consider parallel or positive for easier control');
  }
  if (inputs.frontCamber > -2) {
    recs.push('Front camber may be too upright for grip - try -2.5° to -4°');
  }
  if (inputs.rearCamber > -1.5) {
    recs.push('Rear camber may be too upright - try -2° to -3° for more grip');
  }
  if (inputs.frontCaster < 3) {
    recs.push('Low caster may reduce steering self-aligning torque');
  }
  if (inputs.frontCaster > 8) {
    recs.push('High caster increases steering effort but improves stability');
  }
  
  return recs;
}

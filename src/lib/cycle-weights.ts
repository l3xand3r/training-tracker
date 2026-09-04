export type WeightIdentity = `${string}::${number}`;

export type WeightRule = { fromIndex: number; weight: number | null };

export type WeightStep = {
  key: string;
  exerciseId: string;
  setIndex: number;
  defaultWeight: number | null;
};

export type CycleSummary = {
  cycleNumber: number;
  completedAt: string;
  startWeights: Record<WeightIdentity, number | null>;
  endWeights: Record<WeightIdentity, number | null>;
};

export function getWeightIdentity(step: Pick<WeightStep, "exerciseId" | "setIndex">): WeightIdentity {
  return `${step.exerciseId}::${step.setIndex}`;
}

/** The first numeric author value is the zero point for this set identity. */
export function getAuthorStartWeights(flat: WeightStep[]): Record<WeightIdentity, number | null> {
  const starts: Record<WeightIdentity, number | null> = {};
  flat.forEach((step) => {
    const identity = getWeightIdentity(step);
    if (!(identity in starts)) starts[identity] = null;
    if (starts[identity] === null && step.defaultWeight !== null) {
      starts[identity] = step.defaultWeight;
    }
  });
  return starts;
}

/**
 * Resolves the immutable author profile onto a cycle's starting base.
 * A null author step always stays weightless; zero remains a numeric weight.
 */
export function getCycleDefaultWeight(
  step: WeightStep,
  cycleNumber: number,
  cycleStartWeights: Record<WeightIdentity, number | null>,
  authorStartWeights: Record<WeightIdentity, number | null>
) {
  if (step.defaultWeight === null || cycleNumber === 1) return step.defaultWeight;

  const identity = getWeightIdentity(step);
  const cycleStart = cycleStartWeights[identity];
  const authorStart = authorStartWeights[identity];
  if (cycleStart === null) return null;
  if (cycleStart === undefined || authorStart === null || authorStart === undefined) {
    return step.defaultWeight;
  }
  return Math.max(0, Number((cycleStart + (step.defaultWeight - authorStart)).toFixed(1)));
}

export function getEffectiveWeight(
  flat: WeightStep[],
  stepIndex: number,
  globalOverrides: Record<string, WeightRule[]>,
  directOverrides: Record<string, number | null>,
  cycleNumber: number,
  cycleStartWeights: Record<WeightIdentity, number | null>,
  authorStartWeights: Record<WeightIdentity, number | null>
) {
  const step = flat[stepIndex];
  if (!step) return null;
  if (step.defaultWeight === null) return null;
  if (Object.prototype.hasOwnProperty.call(directOverrides, step.key)) {
    return directOverrides[step.key];
  }
  const identity = getWeightIdentity(step);
  const rules = globalOverrides[identity] || [];
  let weight = getCycleDefaultWeight(step, cycleNumber, cycleStartWeights, authorStartWeights);
  rules.forEach((rule) => {
    if (rule.fromIndex <= stepIndex) weight = rule.weight;
  });
  return weight;
}

/** Captures the last effective state for every exercise/set identity. */
export function getEndWeights(
  flat: WeightStep[],
  globalOverrides: Record<string, WeightRule[]>,
  directOverrides: Record<string, number | null>,
  cycleNumber: number,
  cycleStartWeights: Record<WeightIdentity, number | null>,
  authorStartWeights: Record<WeightIdentity, number | null>
) {
  const lastIndexByIdentity: Record<WeightIdentity, number> = {};
  flat.forEach((step, index) => {
    const identity = getWeightIdentity(step);
    if (!(identity in lastIndexByIdentity)) lastIndexByIdentity[identity] = -1;
    if (step.defaultWeight !== null) lastIndexByIdentity[identity] = index;
  });
  const result: Record<WeightIdentity, number | null> = {};
  Object.entries(lastIndexByIdentity).forEach(([identity, index]) => {
    if (index < 0) {
      result[identity as WeightIdentity] = null;
      return;
    }
    result[identity as WeightIdentity] = getEffectiveWeight(
      flat,
      index,
      globalOverrides,
      directOverrides,
      cycleNumber,
      cycleStartWeights,
      authorStartWeights
    );
  });
  return result;
}

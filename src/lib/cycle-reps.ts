import type { FlatStep } from "@/lib/training-course";

const PUSH_UP_EXERCISE_ID = "отжимания";
const WEEKLY_STRAIGHT_OFFSETS = [0, 2, 4, 6, 8, 10, 2, 10, 12, 14, 16, 18] as const;

type RepetitionStep = Pick<FlatStep, "exerciseId" | "reps" | "setIndex" | "week">;

function getEffectiveReps(step: RepetitionStep, cycleNumber: number): string {
  if (cycleNumber < 2 || step.exerciseId !== PUSH_UP_EXERCISE_ID) {
    return step.reps;
  }

  const weeklyOffset = WEEKLY_STRAIGHT_OFFSETS[step.week - 1];
  if (weeklyOffset === undefined || step.setIndex < 0 || step.setIndex > 3) {
    return step.reps;
  }

  if (step.setIndex === 0) {
    return "6 с колен";
  }

  const straightTotal = 19 + 18 * (cycleNumber - 2) + weeklyOffset;
  const quotient = Math.floor(straightTotal / 3);
  const remainder = straightTotal % 3;
  const straightSets = [
    quotient,
    quotient + (remainder >= 1 ? 1 : 0),
    quotient + (remainder >= 2 ? 1 : 0),
  ];

  return `${straightSets[step.setIndex - 1]} с прямых`;
}

export { getEffectiveReps, PUSH_UP_EXERCISE_ID, WEEKLY_STRAIGHT_OFFSETS };

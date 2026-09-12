import type { TrainingState } from "@/hooks/use-training-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
export function WorkoutReview({ state }: { state: TrainingState }) {
 const { reviewWorkoutDone, reviewWorkoutSteps, reviewWorkoutCompleted, activateReviewedWorkout, returnToCurrentWorkout } = state;
return (
                  <div className="space-y-4">
                    <div className="rounded-[22px] bg-sky-50 p-4 ring-1 ring-sky-200/70">
                      <div className="text-sm font-medium text-sky-900">
                        Режим просмотра тренировки
                      </div>
                      <div className="mt-1 text-sm text-sky-800">
                        Можно продолжить эту тренировку или повторить её после завершения.
                      </div>
                    </div>

                    <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f172a_0%,#334155_100%)] p-4 text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-slate-200">Прогресс выбранной тренировки</div>
                          <div className="mt-1 text-lg font-semibold">
                            {reviewWorkoutDone}/{reviewWorkoutSteps.length} подходов
                          </div>
                        </div>
                        <Badge className="rounded-full bg-white/15 text-white">
                          {reviewWorkoutSteps.length
                            ? Math.round((reviewWorkoutDone / reviewWorkoutSteps.length) * 100)
                            : 0}%
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={
                            reviewWorkoutSteps.length
                              ? Math.round((reviewWorkoutDone / reviewWorkoutSteps.length) * 100)
                              : 0
                          }
                          className="h-2 bg-white/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        className="w-full rounded-[20px] bg-slate-900 py-3 text-white shadow-sm hover:bg-slate-800"
                        onClick={activateReviewedWorkout}
                      >
                        {reviewWorkoutCompleted ? "Повторить эту тренировку" : "Сделать текущей тренировкой"}
                      </Button>
                      <Button
                        className="w-full rounded-[20px] border border-slate-200/80 bg-white/85 py-3 text-slate-900 shadow-sm hover:bg-white"
                        variant="outline"
                        onClick={returnToCurrentWorkout}
                      >
                        Вернуться к текущей тренировке
                      </Button>
                    </div>
                  </div>
);
}

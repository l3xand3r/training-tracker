import type { TrainingState } from "@/hooks/use-training-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ExerciseChooser({ state }: { state: TrainingState }) {
  const { groupedExercises, flatCourse, current, doneSet, chooseExerciseStep } = state;
  return (
              <Card className="surface-card">
                <CardContent className="space-y-3">
                  {groupedExercises.map((ex) => {
                    const steps = flatCourse.filter(
                      (x) => x.week === current?.week && x.session === current?.session && x.exerciseId === ex.id
                    );
                    const completed = steps.filter((x) => doneSet.has(x.key)).length;
                    const isCurrentExercise = steps.some((x) => x.key === current?.key);
                    const nextAvailableStep = steps.find((x) => !doneSet.has(x.key));
                    const canChoose = Boolean(nextAvailableStep) && !isCurrentExercise;
                    return (
                      <div
                        key={`${current?.week}-${current?.session}-${ex.id}`}
                        className="exercise-row"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">{ex.name}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {completed} из {steps.length} подходов
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isCurrentExercise ? "default" : completed === steps.length ? "secondary" : "outline"}
                            className="rounded-full px-4"
                            onClick={() => { chooseExerciseStep(ex.id); window.scrollTo(0, 0); }}
                            disabled={!canChoose}
                          >
                            {isCurrentExercise ? "Сейчас" : completed === steps.length ? "Готово" : "Выбрать"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
);
}

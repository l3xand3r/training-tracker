import type { TrainingState } from "@/hooks/use-training-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getEffectiveWeight } from "@/lib/cycle-weights";
export function WeightSettings({ state }: { state: TrainingState }) {
  const { exerciseCatalog, selectedExerciseId, setSelectedExerciseId, selectedExercise, flatCourse, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights, setWeightRules } = state;
  return (
          <div className="space-y-4">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Settings2 className="h-5 w-5" /> Рабочие веса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">Выберите упражнение и укажите стартовый вес для каждого подхода.</p>
                <div className="exercise-catalog">
                  {exerciseCatalog.map((exerciseItem) => (
                    <Button
                      key={exerciseItem.id}
                      variant={selectedExerciseId === exerciseItem.id ? "default" : "outline"}
                      aria-pressed={selectedExerciseId === exerciseItem.id}
                      className="exercise-option"
                      onClick={() => setSelectedExerciseId(exerciseItem.id)}
                    >
                      {exerciseItem.name}
                    </Button>
                  ))}
                </div>

                {selectedExercise ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Изменения задают глобальный стартовый вес упражнения для соответствующего номера подхода.</p>
                    {selectedExercise.sets.map((s, idx) => {
                      const key = `${selectedExercise.id}::${idx}`;
                      const firstRelevantIndex = flatCourse.findIndex(
                        (item) => item.exerciseId === selectedExercise.id && item.setIndex === idx
                      );
                      const effective =
                        firstRelevantIndex >= 0
                          ? getEffectiveWeight(flatCourse, firstRelevantIndex, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights)
                          : s.weight;
                      return (
                        <div key={key} className="rounded-[22px] bg-white/78 p-4 ring-1 ring-slate-200/70">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="font-medium">Подход {idx + 1}</div>
                            <div className="text-sm text-slate-500">Базовые повторения: {s.reps}</div>
                          </div>
                          <Input
                            aria-label={`${selectedExercise.name}, подход ${idx + 1}, вес в кг`}
                            type="number"
                            step="0.5"
                            value={effective ?? ""}
                            placeholder="Без веса"
                            onChange={(e) => {
                              const raw = e.target.value;
                              const next = raw === "" ? null : Number(raw);
                              setWeightRules((prev) => ({
                                ...prev,
                                [key]: [{ fromIndex: 0, weight: next }],
                              }));
                            }}
                            className="h-12 rounded-xl border-slate-200 bg-white"
                          />

                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>);
}

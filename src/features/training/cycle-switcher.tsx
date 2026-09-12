import type { TrainingState } from "@/hooks/use-training-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
export function CycleSwitcher({ state, onClose }: { state: TrainingState; onClose: () => void }) {
  const { cycleHistory, cycleNumber, switchToCycle, actualCurrentIndex, flatCourse, requestStartNextCycle, startNextCycle } = state;
  return (<Card><CardHeader><CardTitle>Тренировочные циклы</CardTitle><p className="text-sm text-slate-500">Сейчас открыт цикл {cycleNumber}</p></CardHeader><CardContent className="space-y-4">                {cycleHistory.length > 0 ? (
                  <div className="space-y-2 rounded-[24px] bg-sky-50 p-4 ring-1 ring-sky-200/70">
                    <div className="text-sm font-medium text-sky-950">Другие сохранённые циклы</div>
                    <div className="text-xs text-sky-800">Переход восстановит их прогресс и настройки веса.</div>
                    {[...cycleHistory]
                      .sort((a, b) => a.cycleNumber - b.cycleNumber)
                      .map((cycle) => (
                        <Button
                          key={cycle.cycleNumber}
                          className="w-full rounded-2xl bg-white text-slate-900 hover:bg-white/90"
                          variant="outline"
                          onClick={() => { switchToCycle(cycle.cycleNumber); onClose(); }}
                        >
                          {cycle.cycleNumber < cycleNumber ? "Вернуться к" : "Перейти к"} циклу {cycle.cycleNumber}
                        </Button>
                      ))}
                  </div>
                ) : null}

                {actualCurrentIndex !== flatCourse.length ? (
                  <Button
                    className="h-auto w-full rounded-3xl py-3 text-left whitespace-normal sm:text-center"
                    variant="outline"
                    onClick={() => { requestStartNextCycle(); onClose(); }}
                  >
                    <ChevronRight className="mr-2 h-4 w-4" /> Перейти к циклу {cycleNumber + 1}
                  </Button>
                ) : null}
<p className="text-sm text-slate-500">Каждый цикл — 12 недель. Прогресс и веса сохраняются при переходе между циклами.</p>{actualCurrentIndex === flatCourse.length ? <Button onClick={() => { startNextCycle(); onClose(); }}>Начать цикл {cycleNumber + 1}</Button> : null}</CardContent></Card>);
}

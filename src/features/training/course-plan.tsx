import type { TrainingState } from "@/hooks/use-training-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COURSE, formatWeight } from "@/lib/training-course";
import { getEffectiveWeight } from "@/lib/cycle-weights";
export function CoursePlan({ state }: { state: TrainingState }) {
  const { selectedWeek, setSelectedWeek, selectedSession, setSelectedSession, filteredFlat, flatCourse, doneSet, current, jumpToStep, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights } = state;
  return (
          <div className="space-y-4">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Весь курс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={selectedWeek}
                    onValueChange={(value) => setSelectedWeek(value ?? "all")}
                  >
                    <SelectTrigger aria-label="Неделя курса" className="h-11 w-full rounded-xl">
                      <SelectValue>{selectedWeek === "all" ? "Все недели" : `Неделя ${selectedWeek}`}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все недели</SelectItem>
                      {COURSE.map((w) => (
                        <SelectItem key={w.week} value={String(w.week)}>
                          Неделя {w.week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedSession}
                    onValueChange={(value) => setSelectedSession(value ?? "all")}
                  >
                    <SelectTrigger aria-label="Тренировка курса" className="h-11 w-full rounded-xl">
                      <SelectValue>{selectedSession === "all" ? "Все тренировки" : `Тренировка ${selectedSession}`}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все тренировки</SelectItem>
                      <SelectItem value="1">Тренировка 1</SelectItem>
                      <SelectItem value="2">Тренировка 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className={filteredFlat.length ? "h-[min(65vh,640px)] pr-3" : "pr-3"}>
                  {filteredFlat.length === 0 ? <div className="rest-message"><h2>Время для отдыха</h2><p>В этой тренировке нет подходов — это отдых по плану курса.</p></div> : null}
                  <div className="space-y-3">
                    {filteredFlat.map((item) => {
                      const idx = flatCourse.findIndex((x) => x.key === item.key);
                      const done = doneSet.has(item.key);
                      const active = current?.key === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => jumpToStep(item.key)}
                          className={`w-full rounded-2xl p-4 text-left transition ${
                            active ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm opacity-70">
                                Неделя {item.week} · Тренировка {item.session}
                              </div>
                              <div className="mt-1 font-medium">{item.exerciseName}</div>
                              <div className="mt-1 text-sm opacity-70">
                                Подход {item.setIndex + 1} · Повторения {item.reps} · Вес{" "}
                                {formatWeight(
                                  getEffectiveWeight(flatCourse, idx, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights)
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                hidden={!done && !active}
                                variant={done ? "secondary" : active ? "default" : "outline"}
                                className="rounded-full"
                              >
                                {done ? "Готово" : active ? "Сейчас" : ""}
                              </Badge>
                              <ChevronRight
                                className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>);
}

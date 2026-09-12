import type { TrainingState } from "@/hooks/use-training-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
export function CourseProgress({ state }: { state: TrainingState }) {
  const { workoutGroups, openWorkoutReview, progress, completedCount, totalCount, cycleNumber } = state;
  return (          <div className="space-y-4">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Trophy className="h-5 w-5" /> Ход курса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="course-summary"><div><span>Цикл {cycleNumber} · 12 недель</span><strong>{progress}%</strong></div><Progress aria-label="Прогресс курса" value={progress} /><p>{completedCount} из {totalCount} подходов выполнено</p></div>
                {workoutGroups.map((week) => (
                  <div key={week.week} className="space-y-2">
                    <div className="font-medium">Неделя {week.week}</div>
                    {week.sessions.map((session) => {
                      const clickable = session.status === "done" || session.status === "upcoming" || session.status === "current";
                      return (
                        <button
                          key={session.key}
                          type="button"
                          disabled={!clickable}
                          onClick={() => { openWorkoutReview(session.week, session.session); window.scrollTo(0, 0); }}
                          className="w-full session-row"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium">{session.title}</div>
                              <div className="mt-1 text-sm text-slate-500">
                                {session.status === "rest"
                                  ? "Отдых"
                                  : `${session.done} из ${session.total} подходов`}
                              </div>
                            </div>
                            <Badge
                              variant={
                                session.status === "done"
                                  ? "secondary"
                                  : session.status === "current"
                                  ? "default"
                                  : "outline"
                              }
                              className="rounded-full"
                            >
                              {session.status === "rest"
                                ? "Отдых"
                                : session.status === "done"
                                ? "Открыть"
                                : session.status === "current"
                                ? "Текущая"
                                : "Открыть"}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}


              </CardContent>
            </Card>
          </div>
);
}

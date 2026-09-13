import { useState } from "react";
import { Check, ChevronRight, Circle, Moon, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrainingState } from "@/hooks/use-training-state";
import { getEffectiveReps } from "@/lib/cycle-reps";
import { formatWeight } from "@/lib/training-course";
import { getEffectiveWeight } from "@/lib/cycle-weights";

export function CoursePlan({
  state,
  onOpenCycles,
}: {
  state: TrainingState;
  onOpenCycles: () => void;
}) {
  const {
    workoutGroups,
    current,
    cycleNumber,
    selectedWeek,
    setSelectedWeek,
    flatCourse,
    doneSet,
    jumpToStep,
    weightRules,
    manualSetWeights,
    cycleStartWeights,
    authorStartWeights,
    openWorkoutReview,
  } = state;
  const [mode, setMode] = useState<"weeks" | "workouts">("weeks");
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const selectedWeekNumber = selectedWeek === "all" ? current?.week ?? 1 : Number(selectedWeek);
  const selectedWeekGroup = workoutGroups.find((week) => week.week === selectedWeekNumber);

  function openWeek(week: number) {
    setSelectedWeek(String(week));
    setExpandedWorkout(null);
    setMode("workouts");
    window.scrollTo(0, 0);
  }

  return (
    <div className="screen plan-screen">
      <header className="screen-header">
        <h1>План</h1>
        <button className="cycle-chip" type="button" onClick={onOpenCycles}>Цикл {cycleNumber}<ChevronRight /></button>
      </header>

      <div className="segment-control" role="tablist" aria-label="Просмотр плана">
        <button type="button" role="tab" aria-selected={mode === "weeks"} onClick={() => setMode("weeks")}>Недели</button>
        <button type="button" role="tab" aria-selected={mode === "workouts"} onClick={() => setMode("workouts")}>Тренировки</button>
      </div>

      {mode === "weeks" ? (
        <div className="week-list">
          {workoutGroups.map((week) => {
            const activeSessions = week.sessions.filter((session) => session.status !== "rest");
            const restCount = week.sessions.length - activeSessions.length;
            const complete = activeSessions.length > 0 && activeSessions.every((session) => session.status === "done");
            const active = week.sessions.some((session) => session.status === "current");
            return (
              <button key={week.week} type="button" className={active ? "current" : complete ? "complete" : ""} onClick={() => openWeek(week.week)}>
                <span className="week-status">
                  {complete ? <Check /> : restCount ? <Moon /> : <Circle />}
                </span>
                <span className="week-copy">
                  <strong>Неделя {week.week}</strong>
                  <small>{activeSessions.length} {activeSessions.length === 1 ? "тренировка" : "тренировки"}{restCount ? ` · ${restCount} отдых` : ""}</small>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="workout-plan-list">
          <div className="drill-header">
            <div><small>12-недельный курс</small><h2>Неделя {selectedWeekNumber}</h2></div>
            <button type="button" onClick={() => setMode("weeks")}>Выбрать неделю</button>
          </div>

          {selectedWeekGroup?.sessions.map((session) => {
            const steps = flatCourse.filter((step) => step.week === session.week && step.session === session.session);
            const expanded = expandedWorkout === session.key;
            const isRest = session.status === "rest";
            return (
              <section key={session.key} className={`workout-plan-card ${session.status}`}>
                <button
                  type="button"
                  className="workout-plan-summary"
                  disabled={isRest}
                  aria-expanded={!isRest ? expanded : undefined}
                  onClick={() => setExpandedWorkout(expanded ? null : session.key)}
                >
                  <span className="workout-plan-status">{isRest ? <Moon /> : session.status === "done" ? <Check /> : <Play />}</span>
                  <span><strong>{session.title}</strong><small>{isRest ? "Отдых по плану" : `${session.done} из ${session.total} подходов`}</small></span>
                  {!isRest ? <ChevronRight /> : null}
                </button>

                {expanded && !isRest ? (
                  <div className="workout-plan-details">
                    <button className="review-workout-button" type="button" onClick={() => { openWorkoutReview(session.week, session.session); window.scrollTo(0, 0); }}>Просмотреть тренировку<ChevronRight /></button>
                    <div className="set-detail-list">
                      {steps.map((step) => {
                        const stepIndex = flatCourse.findIndex((item) => item.key === step.key);
                        const done = doneSet.has(step.key);
                        const active = current?.key === step.key;
                        return (
                          <button
                            key={step.key}
                            type="button"
                            className={active ? "active" : done ? "done" : ""}
                            onClick={() => jumpToStep(step.key)}
                          >
                            <span>{done ? <Check /> : <Circle />}</span>
                            <span><strong>{step.exerciseName}</strong><small>Подход {step.setIndex + 1} · {getEffectiveReps(step, cycleNumber)} повт.</small></span>
                            <Badge>{formatWeight(getEffectiveWeight(flatCourse, stepIndex, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights))}</Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

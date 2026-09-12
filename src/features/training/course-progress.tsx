import { useState, type CSSProperties } from "react";
import { Check, ChevronRight, Circle, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { TrainingState } from "@/hooks/use-training-state";

export function CourseProgress({
  state,
  onOpenCycles,
}: {
  state: TrainingState;
  onOpenCycles: () => void;
}) {
  const {
    workoutGroups,
    openWorkoutReview,
    progress,
    completedCount,
    totalCount,
    cycleNumber,
    current,
    doneInCurrentSession,
    totalInCurrentSession,
    currentSessionProgress,
  } = state;
  const [selectedWeek, setSelectedWeek] = useState(current?.week ?? 1);
  const selectedWeekGroup = workoutGroups.find((week) => week.week === selectedWeek);
  const totalWorkouts = workoutGroups.reduce(
    (total, week) => total + week.sessions.filter((session) => session.status !== "rest").length,
    0
  );
  const completedWorkouts = workoutGroups.reduce(
    (total, week) => total + week.sessions.filter((session) => session.status === "done").length,
    0
  );
  const completedWeeks = workoutGroups.filter((week) => {
    const activeSessions = week.sessions.filter((session) => session.status !== "rest");
    return activeSessions.length > 0 && activeSessions.every((session) => session.status === "done");
  }).length;

  return (
    <div className="screen progress-screen">
      <header className="screen-header">
        <h1>Прогресс</h1>
        <button className="cycle-chip" type="button" onClick={onOpenCycles}>Цикл {cycleNumber}<ChevronRight /></button>
      </header>

      <section className="progress-overview">
        <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}>
          <span>{progress}%</span>
        </div>
        <div><h2>{progress === 100 ? "Курс завершён" : "Курс в процессе"}</h2><p>{completedWeeks} из 12 недель</p><p>{completedWorkouts} из {totalWorkouts} тренировок</p></div>
      </section>

      <section className="weeks-overview">
        <h2>Недели</h2>
        <div className="week-grid">
          {workoutGroups.map((week) => {
            const activeSessions = week.sessions.filter((session) => session.status !== "rest");
            const complete = activeSessions.length > 0 && activeSessions.every((session) => session.status === "done");
            const active = week.sessions.some((session) => session.status === "current");
            const hasRest = week.sessions.some((session) => session.status === "rest");
            return (
              <button
                key={week.week}
                type="button"
                className={`${complete ? "complete" : active ? "current" : "future"} ${hasRest ? "has-rest" : ""} ${selectedWeek === week.week ? "selected" : ""}`}
                aria-label={`Неделя ${week.week}${complete ? ", завершена" : active ? ", текущая" : ", будущая"}${hasRest ? ", есть отдых" : ""}`}
                onClick={() => setSelectedWeek(week.week)}
              >
                <span>{week.week}</span>
                {complete ? <Check /> : hasRest && !active ? <Moon /> : <Circle />}
              </button>
            );
          })}
        </div>
        <div className="progress-legend">
          <span><i className="complete" />Завершена</span><span><i className="current" />Текущая</span><span><i className="future" />Будущая</span><span><i className="rest" />Отдых</span>
        </div>
      </section>

      <section className="selected-week-card">
        <header><div><small>Выбрана неделя</small><h2>Неделя {selectedWeek}</h2></div><span>{selectedWeekGroup?.sessions.filter((session) => session.status !== "rest").length ?? 0} тренировки</span></header>
        {selectedWeekGroup?.sessions.map((session) => (
          <button
            key={session.key}
            type="button"
            disabled={session.status === "rest"}
            onClick={() => { openWorkoutReview(session.week, session.session); window.scrollTo(0, 0); }}
          >
            <span className={`session-state ${session.status}`}>{session.status === "done" ? <Check /> : session.status === "rest" ? <Moon /> : <Circle />}</span>
            <span><strong>{session.title}</strong><small>{session.status === "rest" ? "Отдых" : `${session.done} из ${session.total} подходов`}</small></span>
            {session.status !== "rest" ? <ChevronRight /> : null}
          </button>
        ))}
      </section>

      {current ? (
        <section className="current-workout-summary">
          <header><h2>Текущая тренировка</h2><button type="button" onClick={() => openWorkoutReview(current.week, current.session)}>Открыть<ChevronRight /></button></header>
          <strong>{`Неделя ${current.week} · Тренировка ${current.session}`}</strong>
          <div><span>{doneInCurrentSession} из {totalInCurrentSession} подходов</span><b>{currentSessionProgress}%</b></div>
          <Progress value={currentSessionProgress} aria-label="Прогресс текущей тренировки" />
        </section>
      ) : null}

      <details className="history-details">
        <summary>Посмотреть всю историю<ChevronRight /></summary>
        <div>
          {workoutGroups.flatMap((week) => week.sessions).filter((session) => session.status !== "rest").map((session) => (
            <button key={session.key} type="button" onClick={() => openWorkoutReview(session.week, session.session)}>
              <span><strong>Неделя {session.week} · {session.title}</strong><small>{session.done} из {session.total} подходов</small></span>
              <ChevronRight />
            </button>
          ))}
        </div>
      </details>

      <p className="overall-set-count">Всего выполнено {completedCount} из {totalCount} подходов</p>
    </div>
  );
}

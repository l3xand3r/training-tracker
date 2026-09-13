import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Dumbbell,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { TrainingState } from "@/hooks/use-training-state";
import { getEffectiveReps } from "@/lib/cycle-reps";
import { formatWeight, getSessionLabel } from "@/lib/training-course";
import { getEffectiveWeight } from "@/lib/cycle-weights";
import { WorkoutReview } from "./workout-review";

export function CurrentWorkout({
  state,
  onOpenCycles,
}: {
  state: TrainingState;
  onOpenCycles: () => void;
}) {
  const {
    current,
    reviewWorkoutMeta,
    cycleNumber,
    doneInCurrentSession,
    totalInCurrentSession,
    currentSessionProgress,
    currentWeight,
    isOverrideActive,
    compactMode,
    history,
    adjustCurrentWeight,
    markCurrentDone,
    undoLastDone,
    moveToAdjacentStep,
    startNextCycle,
    flatCourse,
    weightRules,
    manualSetWeights,
    cycleStartWeights,
    authorStartWeights,
    groupedExercises,
    doneSet,
    displayIndex,
    chooseExerciseStep,
  } = state;

  const pairNames = Array.from(new Set(groupedExercises.map((exercise) => exercise.pair)));
  const pairIndex = current ? Math.max(0, pairNames.indexOf(current.pair)) : 0;
  const currentPairExercises = current
    ? groupedExercises.filter((exercise) => exercise.pair === current.pair)
    : [];
  const currentPairItems = currentPairExercises.flatMap((exercise) => {
    const stepIndex = flatCourse.findIndex(
      (step) =>
        step.week === current?.week &&
        step.session === current?.session &&
        step.exerciseId === exercise.id &&
        step.setIndex === current?.setIndex
    );
    if (stepIndex < 0) return [];
    const step = flatCourse[stepIndex];
    const completed = doneSet.has(step.key);
    const active = step.key === current?.key;
    const canChoose = !active && !completed && flatCourse.some(
      (candidate) =>
        candidate.week === current?.week &&
        candidate.session === current?.session &&
        candidate.exerciseId === exercise.id &&
        !doneSet.has(candidate.key)
    );
    return [{
      step,
      completed,
      active,
      canChoose,
      weight: getEffectiveWeight(
        flatCourse,
        stepIndex,
        weightRules,
        manualSetWeights,
        cycleNumber,
        cycleStartWeights,
        authorStartWeights
      ),
    }];
  });
  const currentPairPosition = Math.max(
    1,
    currentPairItems.findIndex((item) => item.active) + 1
  );

  const laterSteps = current
    ? flatCourse.filter(
        (step, index) =>
          index > displayIndex &&
          step.week === current.week &&
          step.session === current.session &&
          !doneSet.has(step.key)
      )
    : [];
  const nextPairName = laterSteps.find((step) => step.pair !== current?.pair)?.pair ?? laterSteps[0]?.pair;
  const nextPairItems = laterSteps
    .filter((step) => step.pair === nextPairName)
    .filter((step, index, items) => items.findIndex((item) => item.exerciseId === step.exerciseId) === index)
    .slice(0, 2);

  return (
    <div className={`workout-view ${compactMode ? "is-compact" : ""}`}>
      <section className="workout-top">
        <button className="cycle-chip dark" type="button" onClick={onOpenCycles}>
          Цикл {cycleNumber}<ChevronRight aria-hidden="true" />
        </button>
        <h1>
          {reviewWorkoutMeta
            ? getSessionLabel(reviewWorkoutMeta.week, reviewWorkoutMeta.session)
            : current
              ? getSessionLabel(current.week, current.session)
              : `Цикл ${cycleNumber} завершён`}
        </h1>
        {!reviewWorkoutMeta && current ? (
          <>
            <div className="workout-progress-copy">
              <span>{doneInCurrentSession} из {totalInCurrentSession} подходов</span>
              <strong>{currentSessionProgress}%</strong>
            </div>
            <Progress aria-label="Прогресс текущей тренировки" value={currentSessionProgress} />
          </>
        ) : null}
      </section>

      <div className="workout-body">
        {reviewWorkoutMeta ? (
          <section className="review-card">
            <WorkoutReview state={state} />
          </section>
        ) : current ? (
          <>
            <section className="current-exercise-card" aria-label="Текущий подход">
              <div className="pair-position"><span className="position-dot" />Пара {pairIndex + 1} из {pairNames.length}</div>
              <h2 aria-live="polite">{current.exerciseName}</h2>
              <p className="reps-line">{getEffectiveReps(current, cycleNumber)} повторений</p>
              {current.note ? <p className="exercise-note">{current.note}</p> : null}
              {isOverrideActive ? <p className="override-note">После этого подхода продолжится обычная очередь.</p> : null}

              <div className="weight-stepper" aria-label="Рабочий вес">
                <Button variant="outline" aria-label="Уменьшить вес на 0,5 кг" onClick={() => adjustCurrentWeight(-0.5)} disabled={currentWeight === null}>−</Button>
                <strong>{currentWeight === null ? "—" : <>{currentWeight}<small> кг</small></>}</strong>
                <Button variant="outline" aria-label="Увеличить вес на 0,5 кг" onClick={() => adjustCurrentWeight(0.5)} disabled={currentWeight === null}>+</Button>
              </div>

              <Button className="done-button" onClick={markCurrentDone}><CheckCircle2 aria-hidden="true" />Готово</Button>
              <Button variant="ghost" className="undo-button" onClick={undoLastDone} disabled={history.length === 0}><RotateCcw aria-hidden="true" />Отменить последний подход</Button>
            </section>

            {currentPairItems.length > 0 ? (
              <section className="pair-card" aria-label="Упражнения текущей пары">
                <header><h2>В этой паре</h2><span>{currentPairPosition}/{currentPairItems.length}</span></header>
                <div className="pair-list">
                  {currentPairItems.map(({ step, completed, active, canChoose, weight }) => (
                    <button
                      key={step.key}
                      type="button"
                      className={active ? "active" : completed ? "completed" : ""}
                      disabled={!canChoose}
                      onClick={() => { chooseExerciseStep(step.exerciseId); window.scrollTo(0, 0); }}
                    >
                      {completed ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}
                      <span><strong>{step.exerciseName}</strong><small>{getEffectiveReps(step, cycleNumber)} повт.{weight === null ? "" : ` · ${formatWeight(weight)}`}</small></span>
                      {canChoose ? <ChevronRight aria-hidden="true" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {nextPairItems.length > 0 ? (
              <section className="next-card" aria-label="Далее по тренировке">
                <header><h2>Далее</h2><span>Следующая пара</span></header>
                {nextPairItems.map((step) => (
                  <div className="next-exercise" key={step.exerciseId}>
                    <span className="next-icon"><Dumbbell aria-hidden="true" /></span>
                    <span><strong>{step.exerciseName}</strong><small>{getEffectiveReps(step, cycleNumber)} повт.</small></span>
                  </div>
                ))}
              </section>
            ) : null}

            <div className="manual-step-controls" aria-label="Ручной переход по подходам">
              <Button variant="ghost" onClick={() => moveToAdjacentStep(-1)}><ArrowLeft />Предыдущий</Button>
              <Button variant="ghost" onClick={() => moveToAdjacentStep(1)}>Следующий<ArrowRight /></Button>
            </div>

            <details className="all-exercises">
              <summary>Все упражнения тренировки<ChevronRight /></summary>
              <div className="all-exercises-list">
                {groupedExercises.map((exercise) => {
                  const exerciseSteps = flatCourse.filter(
                    (step) => step.week === current.week && step.session === current.session && step.exerciseId === exercise.id
                  );
                  const completed = exerciseSteps.filter((step) => doneSet.has(step.key)).length;
                  const active = exercise.id === current.exerciseId;
                  const canChoose = !active && exerciseSteps.some((step) => !doneSet.has(step.key));
                  return (
                    <button key={exercise.id} type="button" disabled={!canChoose} onClick={() => chooseExerciseStep(exercise.id)}>
                      <span><strong>{exercise.name}</strong><small>{completed} из {exerciseSteps.length} подходов</small></span>
                      <span>{active ? "Сейчас" : completed === exerciseSteps.length ? "Готово" : "Выбрать"}</span>
                    </button>
                  );
                })}
              </div>
            </details>
          </>
        ) : (
          <section className="completion-card">
            <span><Check /></span>
            <h2>Все подходы выполнены</h2>
            <p>Достигнутые веса станут базой следующего цикла.</p>
            <Button className="done-button" onClick={startNextCycle}>Начать цикл {cycleNumber + 1}<ChevronRight /></Button>
          </section>
        )}
      </div>
    </div>
  );
}

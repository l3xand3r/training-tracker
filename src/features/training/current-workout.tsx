import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { TrainingState } from "@/hooks/use-training-state";
import { formatWeight, getSessionLabel } from "@/lib/training-course";
import { getEffectiveWeight } from "@/lib/cycle-weights";
import { ExerciseChooser } from "./exercise-chooser";
import { WorkoutReview } from "./workout-review";

export function CurrentWorkout({ state }: { state: TrainingState }) {
  const {
    current, reviewWorkoutMeta, cycleNumber, doneInCurrentSession, totalInCurrentSession,
    currentSessionProgress, currentWeight, isOverrideActive, compactMode, history,
    adjustCurrentWeight, markCurrentDone, undoLastDone, moveToAdjacentStep, startNextCycle,
    nextStepsPreview, flatCourse, weightRules, manualSetWeights, cycleStartWeights,
    authorStartWeights, groupedExercises,
  } = state;

  return (
    <div className={`workout-view ${compactMode ? "is-compact" : ""}`}>
      <section className="workout-heading">
        <p className="eyebrow">{reviewWorkoutMeta ? "Просмотр тренировки" : "Ваша тренировка"}</p>
        <h1>{reviewWorkoutMeta
          ? getSessionLabel(reviewWorkoutMeta.week, reviewWorkoutMeta.session)
          : current ? getSessionLabel(current.week, current.session) : `Цикл ${cycleNumber} завершён`}</h1>
        {!reviewWorkoutMeta && current ? (
          <div className="session-progress">
            <Progress aria-label="Прогресс текущей тренировки" value={currentSessionProgress} />
            <span>{doneInCurrentSession} / {totalInCurrentSession} подходов</span>
          </div>
        ) : null}
      </section>

      {reviewWorkoutMeta ? (
        <section className="current-set"><h2 className="mb-4 text-xl font-semibold">{reviewWorkoutMeta.title}</h2><WorkoutReview state={state} /></section>
      ) : current ? (
        <>
          <section className="current-set" aria-label="Текущий подход">
            <div className="set-meta"><span className="pair-label">{current.pair}</span><span>Подход {current.setIndex + 1}</span></div>
            <h2 className="exercise-title" aria-live="polite">{current.exerciseName}</h2>
            {current.note ? <p className="exercise-note">{current.note}</p> : null}
            {isOverrideActive ? <p className="override-note">Выбран другой подход. После «Готово» продолжится обычная очередь.</p> : null}
            <div className="set-values">
              <div className="repetitions"><span className="value-label">Повторения</span><strong data-descriptive={current.reps.length > 5}>{current.reps}</strong></div>
              <div className="working-weight">
                <span className="value-label">Вес, кг</span>
                <strong>{currentWeight === null ? "—" : currentWeight}</strong>
                <div className="weight-controls">
                  <Button variant="outline" aria-label="Уменьшить вес на 0,5 кг" onClick={() => adjustCurrentWeight(-0.5)} disabled={currentWeight === null}>−0,5</Button>
                  <Button variant="outline" aria-label="Увеличить вес на 0,5 кг" onClick={() => adjustCurrentWeight(0.5)} disabled={currentWeight === null}>+0,5</Button>
                </div>
              </div>
            </div>
            <Button className="done-button" onClick={markCurrentDone}><Check aria-hidden="true" />Готово</Button>
            <Button variant="ghost" className="undo-button" onClick={undoLastDone} disabled={history.length === 0}><RotateCcw aria-hidden="true" />Отменить последний подход</Button>
            <details className="weight-help"><summary>Как сохраняется вес</summary><p>Изменение здесь становится новым базовым значением для всех будущих таких же упражнений в этом же номере подхода.</p></details>
          </section>

          {nextStepsPreview.length > 0 ? (
            <section className="next-steps" aria-label="Дальше по тренировке">
              <h2>Далее <span>По порядку тренировки</span></h2>
              <ol>
                {nextStepsPreview.map((step, index) => {
                  const previewIndex = flatCourse.findIndex((x) => x.key === step.key);
                  return (
                    <li key={step.key}>
                      <span className="queue-number">{index + 1}</span>
                      <div><h3>{step.exerciseName}</h3><p>Подход {step.setIndex + 1} · {step.reps} повторений</p></div>
                      <span className="queue-weight">{formatWeight(getEffectiveWeight(flatCourse, previewIndex, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights))}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}
        </>
      ) : (
        <section className="current-set completion"><span className="completion-check"><Check /></span><h2>Все подходы выполнены</h2><p>Цикл {cycleNumber} полностью завершён. Достигнутые веса станут базой следующего цикла.</p><Button className="done-button" onClick={startNextCycle}>Начать цикл {cycleNumber + 1}<ChevronRight /></Button></section>
      )}

      {groupedExercises.length > 0 ? (
        <details className="workout-details">
          <summary><span>Выбрать упражнение<span className="summary-hint">Все упражнения текущей тренировки</span></span><ChevronDown /></summary>
          <ExerciseChooser state={state} />
        </details>
      ) : null}
      {!reviewWorkoutMeta && current ? (
        <details className="workout-details">
          <summary><span>Переходы по подходам</span><ChevronDown /></summary>
          <div className="step-navigation"><Button variant="outline" onClick={() => moveToAdjacentStep(-1)}><ArrowLeft />Предыдущий</Button><Button variant="outline" onClick={() => moveToAdjacentStep(1)}>Следующий<ArrowRight /></Button></div>
        </details>
      ) : null}
    </div>
  );
}

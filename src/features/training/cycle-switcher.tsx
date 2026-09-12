import { Check, ChevronRight, RefreshCw } from "lucide-react";
import type { TrainingState } from "@/hooks/use-training-state";

export function CycleSwitcher({ state, onClose }: { state: TrainingState; onClose: () => void }) {
  const {
    cycleHistory,
    cycleNumber,
    switchToCycle,
    actualCurrentIndex,
    flatCourse,
    requestStartNextCycle,
    startNextCycle,
    progress,
  } = state;

  return (
    <section className="cycle-settings">
      <header><span><RefreshCw /></span><div><h1>Управление циклами</h1><p>Переключайте курс, сохраняя прогресс и веса</p></div></header>
      <div className="current-cycle-card">
        <div><small>Текущий цикл</small><strong>Цикл {cycleNumber}</strong></div>
        <span>{progress}%</span>
      </div>

      {cycleHistory.length > 0 ? (
        <div className="saved-cycles">
          <h2>Сохранённые циклы</h2>
          {[...cycleHistory].sort((a, b) => a.cycleNumber - b.cycleNumber).map((cycle) => (
            <button key={cycle.cycleNumber} type="button" onClick={() => { switchToCycle(cycle.cycleNumber); onClose(); }}>
              <span><strong>Цикл {cycle.cycleNumber}</strong><small>{cycle.completedAt ? "Завершён" : "Сохранён"}</small></span>
              {cycle.completedAt ? <Check /> : <ChevronRight />}
            </button>
          ))}
        </div>
      ) : null}

      <div className="new-cycle-card">
        <h2>Следующий цикл</h2>
        <p>Текущие веса станут отправной точкой. В любой момент можно вернуться к сохранённому циклу.</p>
        {actualCurrentIndex === flatCourse.length ? (
          <button type="button" onClick={() => { startNextCycle(); onClose(); }}>Начать цикл {cycleNumber + 1}<ChevronRight /></button>
        ) : (
          <button type="button" onClick={() => { requestStartNextCycle(); onClose(); }}>Перейти к циклу {cycleNumber + 1}<ChevronRight /></button>
        )}
      </div>
    </section>
  );
}

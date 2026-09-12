import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Dumbbell,
  Moon,
  RefreshCw,
  RotateCcw,
  Settings2,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrainingState } from "@/hooks/use-training-state";
import { CycleSwitcher } from "./cycle-switcher";
import { WeightSettings } from "./weight-settings";

export type SettingsPanel = "weights" | "cycles" | null;

type AppSettingsProps = {
  state: TrainingState;
  panel: SettingsPanel;
  onPanelChange: (panel: SettingsPanel) => void;
  onOpenHistory: () => void;
};

function SettingsEntry({
  icon: Icon,
  title,
  description,
  tone = "violet",
  onClick,
}: {
  icon: typeof Dumbbell;
  title: string;
  description: string;
  tone?: "violet" | "blue" | "slate" | "red";
  onClick: () => void;
}) {
  return (
    <button className="settings-entry" type="button" onClick={onClick}>
      <span className={`settings-entry-icon tone-${tone}`}><Icon aria-hidden="true" /></span>
      <span className="settings-entry-copy"><strong>{title}</strong><small>{description}</small></span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

export function AppSettings({ state, panel, onPanelChange, onOpenHistory }: AppSettingsProps) {
  if (panel === "weights") {
    return (
      <div className="screen settings-screen sub-screen">
        <button className="inline-back" type="button" onClick={() => onPanelChange(null)}><ArrowLeft />Настройки</button>
        <WeightSettings state={state} />
      </div>
    );
  }

  if (panel === "cycles") {
    return (
      <div className="screen settings-screen sub-screen">
        <button className="inline-back" type="button" onClick={() => onPanelChange(null)}><ArrowLeft />Настройки</button>
        <CycleSwitcher state={state} onClose={() => onPanelChange(null)} />
      </div>
    );
  }

  return (
    <div className="screen settings-screen">
      <header className="screen-header">
        <h1>Настройки</h1>
        <button className="cycle-chip" type="button" onClick={() => onPanelChange("cycles")}>Цикл {state.cycleNumber}<ChevronRight /></button>
      </header>

      <div className="settings-group">
        <SettingsEntry icon={Dumbbell} title="Вес упражнений" description="Настроить базовый вес" onClick={() => onPanelChange("weights")} />
        <SettingsEntry icon={RefreshCw} title="Управление циклами" description="Переключить, создать, архивировать" tone="blue" onClick={() => onPanelChange("cycles")} />
        <SettingsEntry icon={BarChart3} title="История тренировок" description="Все тренировки и выполненные подходы" tone="slate" onClick={onOpenHistory} />
      </div>

      <div className="settings-group destructive-group">
        <SettingsEntry icon={RotateCcw} title="Сбросить прогресс" description="Начать курс заново" tone="red" onClick={state.resetAll} />
      </div>

      <h2 className="settings-section-title">Приложение</h2>
      <div className="settings-group">
        <div className="settings-info-row">
          <span className="settings-entry-icon tone-red"><WifiOff aria-hidden="true" /></span>
          <span className="settings-entry-copy"><strong>Работает офлайн</strong><small>Данные сохраняются на устройстве</small></span>
        </div>
        <div className="settings-info-row compact-setting">
          <span className="settings-entry-icon tone-slate"><Moon aria-hidden="true" /></span>
          <span className="settings-entry-copy"><strong>Компактный интерфейс</strong><small>Уменьшить отступы тренировки</small></span>
          <Button
            variant="outline"
            role="switch"
            aria-label="Компактный интерфейс"
            aria-checked={state.compactMode}
            onClick={() => state.setCompactMode((value) => !value)}
          >
            {state.compactMode ? "Вкл." : "Выкл."}
          </Button>
        </div>
        <div className="settings-info-row">
          <span className="settings-entry-icon tone-violet"><Settings2 aria-hidden="true" /></span>
          <span className="settings-entry-copy"><strong>Training Tracker</strong><small>12-недельный курс · PWA</small></span>
        </div>
      </div>
    </div>
  );
}

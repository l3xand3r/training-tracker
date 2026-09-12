'use client'

import { useState } from "react";
import { ArrowLeft, CalendarDays, ChevronDown, Dumbbell, Scale, Settings2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainingState } from "@/hooks/use-training-state";
import type { TabKey } from "@/lib/training-course";
import { CurrentWorkout } from "@/features/training/current-workout";
import { CoursePlan } from "@/features/training/course-plan";
import { WeightSettings } from "@/features/training/weight-settings";
import { CourseProgress } from "@/features/training/course-progress";
import { CycleSwitcher } from "@/features/training/cycle-switcher";

const tabs = [
  { key: "now", label: "Сейчас", icon: Dumbbell },
  { key: "plan", label: "План", icon: CalendarDays },
  { key: "weights", label: "Вес", icon: Scale },
  { key: "progress", label: "Прогресс", icon: Trophy },
] as const;

export default function TrainingTracker() {
  const state = useTrainingState();
  const [panel, setPanel] = useState<"cycles" | "settings" | null>(null);

  function navigate(tab: TabKey) {
    setPanel(null);
    state.setActiveTab(tab);
    window.scrollTo(0, 0);
  }

  return (
    <div className="training-app">
      <div className="app-shell">
        <header className="app-header">
          <div className="brand"><span className="brand-icon"><Dumbbell aria-hidden="true" /></span><span>Training Tracker</span></div>
          <div className="header-actions">
            <Button variant="ghost" className="cycle-button" aria-expanded={panel === "cycles"} onClick={() => setPanel(panel === "cycles" ? null : "cycles")}>Цикл {state.cycleNumber}<ChevronDown aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" aria-label="Настройки" aria-expanded={panel === "settings"} onClick={() => setPanel(panel === "settings" ? null : "settings")}><Settings2 aria-hidden="true" /></Button>
          </div>
        </header>

        <main id="main-content">
          {panel ? <Button variant="ghost" className="panel-back" onClick={() => setPanel(null)}><ArrowLeft />Назад</Button> : null}
          {panel === "cycles" ? <CycleSwitcher state={state} onClose={() => setPanel(null)} /> : panel === "settings" ? (
            <Card className="surface-card"><CardHeader><CardTitle>Настройки</CardTitle></CardHeader><CardContent className="space-y-6">
              <div className="settings-row"><div><h2>Компактный интерфейс</h2><p>Меньше отступов в текущем подходе</p></div><Button variant="outline" role="switch" aria-label="Компактный интерфейс" aria-checked={state.compactMode} onClick={() => state.setCompactMode((prev) => !prev)}>{state.compactMode ? "Вкл." : "Выкл."}</Button></div>
              <div className="reset-settings"><h2>Сброс данных</h2><p>Удаляет прогресс всех циклов и изменения веса.</p><Button variant="outline" onClick={() => { state.resetAll(); setPanel(null); }}>Полный сброс прогресса и веса</Button></div>
            </CardContent></Card>
          ) : (
            <>
              {state.activeTab === "now" ? <CurrentWorkout state={state} /> : null}
              {state.activeTab === "plan" ? <CoursePlan state={state} /> : null}
              {state.activeTab === "weights" ? <WeightSettings state={state} /> : null}
              {state.activeTab === "progress" ? <CourseProgress state={state} /> : null}
            </>
          )}
        </main>

        <nav className="bottom-navigation" aria-label="Разделы приложения">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" aria-current={!panel && state.activeTab === key ? "page" : undefined} onClick={() => navigate(key)}><Icon aria-hidden="true" /><span>{label}</span></button>
          ))}
        </nav>
      </div>
    </div>
  );
}

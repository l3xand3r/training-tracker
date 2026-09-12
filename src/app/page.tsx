'use client'

import { useState } from "react";
import { BarChart3, CalendarDays, Dumbbell, Settings2 } from "lucide-react";
import { useTrainingState } from "@/hooks/use-training-state";
import type { TabKey } from "@/lib/training-course";
import { CurrentWorkout } from "@/features/training/current-workout";
import { CoursePlan } from "@/features/training/course-plan";
import { CourseProgress } from "@/features/training/course-progress";
import { AppSettings, type SettingsPanel } from "@/features/training/app-settings";

type VisibleSection = "workout" | "plan" | "progress" | "settings";

const tabs: { key: VisibleSection; label: string; icon: typeof Dumbbell }[] = [
  { key: "workout", label: "Тренировка", icon: Dumbbell },
  { key: "plan", label: "План", icon: CalendarDays },
  { key: "progress", label: "Прогресс", icon: BarChart3 },
  { key: "settings", label: "Настройки", icon: Settings2 },
];

export default function TrainingTracker() {
  const state = useTrainingState();
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>(null);

  const activeSection: VisibleSection =
    state.activeTab === "now"
      ? "workout"
      : state.activeTab === "plan"
        ? "plan"
        : state.activeTab === "progress"
          ? "progress"
          : "settings";

  function setPersistedSection(section: VisibleSection) {
    const tab: TabKey =
      section === "workout"
        ? "now"
        : section === "plan"
          ? "plan"
          : section === "progress"
            ? "progress"
            : "weights";
    state.setActiveTab(tab);
    if (section !== "settings") setSettingsPanel(null);
    window.scrollTo(0, 0);
  }

  function openSettings(panel: SettingsPanel) {
    setSettingsPanel(panel);
    setPersistedSection("settings");
  }

  return (
    <div className={`training-app section-${activeSection}`}>
      <div className="app-shell">
        <main id="main-content">
          {activeSection === "workout" ? (
            <CurrentWorkout state={state} onOpenCycles={() => openSettings("cycles")} />
          ) : null}
          {activeSection === "plan" ? (
            <CoursePlan state={state} onOpenCycles={() => openSettings("cycles")} />
          ) : null}
          {activeSection === "progress" ? (
            <CourseProgress state={state} onOpenCycles={() => openSettings("cycles")} />
          ) : null}
          {activeSection === "settings" ? (
            <AppSettings
              state={state}
              panel={settingsPanel}
              onPanelChange={setSettingsPanel}
              onOpenHistory={() => setPersistedSection("progress")}
            />
          ) : null}
        </main>

        <nav className="bottom-navigation" aria-label="Разделы приложения">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-current={activeSection === key ? "page" : undefined}
              onClick={() => setPersistedSection(key)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

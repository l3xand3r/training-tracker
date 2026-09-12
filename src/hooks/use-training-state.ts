'use client'

import { useEffect, useMemo, useState } from "react";
import { STORAGE_KEY, COURSE, buildFlatCourse, getExerciseInstances, getNextAvailableStep, getWorkoutKey, type TabKey } from "@/lib/training-course";
import {
  getAuthorStartWeights,
  getEffectiveWeight,
  getEndWeights,
  getTransitionWeights,
  getWeightIdentity,
  type CycleArchive,
  type WeightIdentity,
  type WeightRule,
} from "@/lib/cycle-weights";

// State, effects, derivations and handlers are preserved from baseline 8028d1f.
export function useTrainingState() {
  const flatCourse = useMemo(() => buildFlatCourse(COURSE), []);
  const exerciseCatalog = useMemo(() => getExerciseInstances(COURSE), []);
  const authorStartWeights = useMemo(() => getAuthorStartWeights(flatCourse), [flatCourse]);

  const [activeTab, setActiveTab] = useState<TabKey>("now");
  const [doneKeys, setDoneKeys] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weightRules, setWeightRules] = useState<Record<string, WeightRule[]>>({});
  const [manualSetWeights, setManualSetWeights] = useState<Record<string, number | null>>({});
  const [selectedExerciseId, setSelectedExerciseId] = useState(exerciseCatalog[0]?.id || "");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [selectedSession, setSelectedSession] = useState("all");
  const [compactMode, setCompactMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [overrideStepKey, setOverrideStepKey] = useState<string | null>(null);
  const [reviewWorkoutKey, setReviewWorkoutKey] = useState<string | null>(null);
  const [cycleNumber, setCycleNumber] = useState(1);
  const [cycleStartWeights, setCycleStartWeights] = useState<Record<WeightIdentity, number | null>>(authorStartWeights);
  const [cycleHistory, setCycleHistory] = useState<CycleArchive[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setDoneKeys(Array.isArray(parsed.doneKeys) ? parsed.doneKeys : []);
      setCurrentIndex(typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0);
      setWeightRules(parsed.weightRules || {});
      setManualSetWeights(parsed.manualSetWeights || {});
      setSelectedExerciseId(parsed.selectedExerciseId || exerciseCatalog[0]?.id || "");
      setCompactMode(Boolean(parsed.compactMode));
      setHistory(parsed.history || []);
      setOverrideStepKey(parsed.overrideStepKey || null);
      setReviewWorkoutKey(parsed.reviewWorkoutKey || null);
      setActiveTab((parsed.activeTab as TabKey) || "now");
      // v3 saves are Cycle 1: retain every existing progress and weight override unchanged.
      setCycleNumber(typeof parsed.cycleNumber === "number" && parsed.cycleNumber > 0 ? parsed.cycleNumber : 1);
      setCycleStartWeights(parsed.cycleStartWeights || authorStartWeights);
      setCycleHistory(Array.isArray(parsed.cycleHistory) ? parsed.cycleHistory : []);
    } catch (e) {
      console.error(e);
    } finally {
      setHydrated(true);
    }
  }, [authorStartWeights, exerciseCatalog]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeTab,
        doneKeys,
        currentIndex,
        weightRules,
        manualSetWeights,
        selectedExerciseId,
        compactMode,
        history,
        overrideStepKey,
        reviewWorkoutKey,
        cycleNumber,
        cycleStartWeights,
        cycleHistory,
      })
    );
  }, [activeTab, doneKeys, currentIndex, weightRules, manualSetWeights, selectedExerciseId, compactMode, history, overrideStepKey, reviewWorkoutKey, cycleNumber, cycleStartWeights, cycleHistory, hydrated]);

  const doneSet = useMemo(() => new Set(doneKeys), [doneKeys]);
  const actualCurrentIndex = useMemo(
    () => getNextAvailableStep(flatCourse, doneSet, currentIndex),
    [flatCourse, doneSet, currentIndex]
  );
  const overrideIndex = useMemo(() => {
    if (!overrideStepKey) return -1;
    const idx = flatCourse.findIndex((x) => x.key === overrideStepKey);
    if (idx < 0) return -1;
    if (doneSet.has(overrideStepKey)) return -1;
    return idx;
  }, [flatCourse, overrideStepKey, doneSet]);
  const displayIndex = overrideIndex >= 0 ? overrideIndex : actualCurrentIndex;
  const current = flatCourse[displayIndex] || null;

  useEffect(() => {
    if (actualCurrentIndex !== currentIndex && overrideIndex < 0) setCurrentIndex(actualCurrentIndex);
  }, [actualCurrentIndex, currentIndex, overrideIndex]);

  const completedCount = doneKeys.length;
  const totalCount = flatCourse.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentWeight = current
    ? getEffectiveWeight(flatCourse, displayIndex, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights)
    : null;

  const filteredFlat = flatCourse.filter((item) => {
    const weekOk = selectedWeek === "all" || String(item.week) === selectedWeek;
    const sessionOk = selectedSession === "all" || String(item.session) === selectedSession;
    return weekOk && sessionOk;
  });

  const workoutGroups = COURSE.map((week) => ({
    week: week.week,
    sessions: week.sessions.map((session) => {
      if (session.status === "rest") {
        return {
          key: `${week.week}-${session.number}`,
          week: week.week,
          session: session.number,
          title: session.title,
          status: "rest",
          total: 0,
          done: 0,
        };
      }
      const sets = flatCourse.filter((x) => x.week === week.week && x.session === session.number);
      const done = sets.filter((x) => doneSet.has(x.key)).length;
      return {
        key: `${week.week}-${session.number}`,
        week: week.week,
        session: session.number,
        title: session.title,
        status:
          done === sets.length
            ? "done"
            : current && current.week === week.week && current.session === session.number
            ? "current"
            : "upcoming",
        total: sets.length,
        done,
      };
    }),
  }));

  const groupedExercises = current
    ? COURSE.find((w) => w.week === current.week)?.sessions.find((s) => s.number === current.session)
        ?.exercises || []
    : [];

  const doneInCurrentSession = current
    ? flatCourse.filter(
        (x) => x.week === current.week && x.session === current.session && doneSet.has(x.key)
      ).length
    : 0;
  const totalInCurrentSession = current
    ? flatCourse.filter((x) => x.week === current.week && x.session === current.session).length
    : 0;
  const currentSessionProgress = totalInCurrentSession
    ? Math.round((doneInCurrentSession / totalInCurrentSession) * 100)
    : 0;
  const nextStepsPreview = current
    ? flatCourse
        .filter(
          (x, idx) =>
            idx > displayIndex && x.week === current.week && x.session === current.session
        )
        .slice(0, 3)
    : [];

  function markCurrentDone() {
    if (!current || doneSet.has(current.key)) return;
    const nextDone = [...doneKeys, current.key];
    setDoneKeys(nextDone);
    setHistory((prev) => [...prev, current.key]);
    const nextSet = new Set(nextDone);
    const nextLinearIndex = getNextAvailableStep(flatCourse, nextSet, actualCurrentIndex + 1);
    setOverrideStepKey(null);
    setCurrentIndex(nextLinearIndex);
  }

  function chooseExerciseStep(exerciseId: string) {
    if (!current) return;
    const target = flatCourse.find(
      (step) =>
        step.week === current.week &&
        step.session === current.session &&
        step.exerciseId === exerciseId &&
        !doneSet.has(step.key)
    );
    if (!target) return;
    if (target.key === current.key) {
      setOverrideStepKey(null);
      return;
    }
    setOverrideStepKey(target.key);
  }

  function undoLastDone() {
    if (history.length === 0) return;
    const lastKey = history[history.length - 1];
    const nextHistory = history.slice(0, -1);
    const nextDone = doneKeys.filter((key) => key !== lastKey);
    setHistory(nextHistory);
    setDoneKeys(nextDone);
    const targetIndex = flatCourse.findIndex((x) => x.key === lastKey);
    if (targetIndex >= 0) setCurrentIndex(targetIndex);
  }

  function adjustCurrentWeight(delta: number) {
    if (!current) return;
    const currentVal = getEffectiveWeight(flatCourse, displayIndex, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights);
    if (currentVal === null || currentVal === undefined) return;
    const nextWeight = Math.max(0, Number((currentVal + delta).toFixed(1)));
    const ruleKey = getWeightIdentity(current);
    const existing = weightRules[ruleKey] || [];
    const cleaned = existing.filter((r) => r.fromIndex !== displayIndex);
    setWeightRules({
      ...weightRules,
      [ruleKey]: [...cleaned, { fromIndex: displayIndex, weight: nextWeight }].sort(
        (a, b) => a.fromIndex - b.fromIndex
      ),
    });
  }

  function jumpToStep(stepKey: string) {
    const idx = flatCourse.findIndex((x) => x.key === stepKey);
    if (idx >= 0) setCurrentIndex(idx);
  }

  function resetAll() {
    setActiveTab("now");
    setDoneKeys([]);
    setCurrentIndex(0);
    setWeightRules({});
    setManualSetWeights({});
    setHistory([]);
    setOverrideStepKey(null);
    setReviewWorkoutKey(null);
    setCycleNumber(1);
    setCycleStartWeights(authorStartWeights);
    setCycleHistory([]);
  }

  function archiveCurrentCycle(completed: boolean): CycleArchive {
    const endWeights = completed
      ? getEndWeights(flatCourse, weightRules, manualSetWeights, cycleNumber, cycleStartWeights, authorStartWeights)
      : getTransitionWeights(
          flatCourse, doneKeys, displayIndex, weightRules, manualSetWeights,
          cycleNumber, cycleStartWeights, authorStartWeights
        );
    return {
      cycleNumber,
      completedAt: completed ? new Date().toISOString() : null,
      startWeights: cycleStartWeights,
      endWeights,
      doneKeys,
      currentIndex,
      weightRules,
      manualSetWeights,
      history,
    };
  }

  function clearCurrentCycleProgress() {
    setDoneKeys([]);
    setCurrentIndex(0);
    setWeightRules({});
    setManualSetWeights({});
    setHistory([]);
    setOverrideStepKey(null);
    setReviewWorkoutKey(null);
    setActiveTab("now");
  }

  function startNextCycle() {
    const archived = archiveCurrentCycle(actualCurrentIndex === flatCourse.length);
    setCycleHistory((previous) => [
      ...previous.filter((cycle) => cycle.cycleNumber !== cycleNumber),
      archived,
    ]);
    setCycleNumber((previous) => previous + 1);
    setCycleStartWeights(archived.endWeights);
    clearCurrentCycleProgress();
  }

  function requestStartNextCycle() {
    if (actualCurrentIndex !== flatCourse.length) {
      const accepted = window.confirm(
        `В цикле ${cycleNumber} выполнено ${completedCount} из ${totalCount} подходов. Перейти к циклу ${cycleNumber + 1}? Незавершённый цикл будет сохранён, и к нему можно будет вернуться.`
      );
      if (!accepted) return;
    }
    startNextCycle();
  }

  function switchToCycle(targetCycleNumber: number) {
    const target = cycleHistory.find((cycle) => cycle.cycleNumber === targetCycleNumber);
    if (!target) return;
    const currentArchive = archiveCurrentCycle(actualCurrentIndex === flatCourse.length);
    const restoredDoneKeys = Array.isArray(target.doneKeys)
      ? target.doneKeys
      : target.completedAt
      ? flatCourse.map((step) => step.key)
      : [];

    setCycleHistory((previous) =>
      [...previous.filter((cycle) => cycle.cycleNumber !== targetCycleNumber && cycle.cycleNumber !== cycleNumber), currentArchive]
        .sort((a, b) => a.cycleNumber - b.cycleNumber)
    );
    setCycleNumber(target.cycleNumber);
    setCycleStartWeights(target.startWeights || authorStartWeights);
    setDoneKeys(restoredDoneKeys);
    setCurrentIndex(typeof target.currentIndex === "number" ? target.currentIndex : 0);
    setWeightRules(target.weightRules || {});
    setManualSetWeights(target.manualSetWeights || {});
    setHistory(target.history || []);
    setOverrideStepKey(null);
    setReviewWorkoutKey(null);
    setActiveTab("now");
  }

  function moveToAdjacentStep(direction: number) {
    if (!flatCourse.length) return;
    const nextIndex = Math.max(0, Math.min(flatCourse.length - 1, actualCurrentIndex + direction));
    setCurrentIndex(nextIndex);
  }

  const selectedExercise = exerciseCatalog.find((e) => e.id === selectedExerciseId);
  const isOverrideActive = overrideIndex >= 0;

  const reviewWorkoutMeta = useMemo(() => {
    if (!reviewWorkoutKey) return null;
    const [weekStr, sessionStr] = reviewWorkoutKey.split("-");
    const week = Number(weekStr);
    const session = Number(sessionStr);
    const foundSession = COURSE.find((w) => w.week === week)?.sessions.find((s) => s.number === session);
    return foundSession
      ? { key: reviewWorkoutKey, week, session, title: foundSession.title }
      : null;
  }, [reviewWorkoutKey]);

  const reviewWorkoutSteps = useMemo(() => {
    if (!reviewWorkoutMeta) return [];
    return flatCourse.filter(
      (step) => step.week === reviewWorkoutMeta.week && step.session === reviewWorkoutMeta.session
    );
  }, [flatCourse, reviewWorkoutMeta]);

  const reviewWorkoutDone = useMemo(
    () => reviewWorkoutSteps.filter((step) => doneSet.has(step.key)).length,
    [reviewWorkoutSteps, doneSet]
  );

  const reviewWorkoutCompleted =
    reviewWorkoutSteps.length > 0 && reviewWorkoutDone === reviewWorkoutSteps.length;

  function openWorkoutReview(week: number, session: number) {
    setReviewWorkoutKey(getWorkoutKey(week, session));
    setActiveTab("now");
  }

  function returnToCurrentWorkout() {
    setReviewWorkoutKey(null);
  }

  function activateReviewedWorkout() {
    if (!reviewWorkoutMeta || reviewWorkoutSteps.length === 0) return;

    const reviewKeys = new Set(reviewWorkoutSteps.map((step) => step.key));
    const nextDoneKeys = reviewWorkoutCompleted
      ? doneKeys.filter((key) => !reviewKeys.has(key))
      : doneKeys;
    const nextHistory = reviewWorkoutCompleted
      ? history.filter((key) => !reviewKeys.has(key))
      : history;

    setDoneKeys(nextDoneKeys);
    setHistory(nextHistory);
    setOverrideStepKey(null);
    setReviewWorkoutKey(null);
    setCurrentIndex(flatCourse.findIndex(
      (step) => step.week === reviewWorkoutMeta.week && step.session === reviewWorkoutMeta.session
    ));
    setActiveTab("now");
  }

  return {
    flatCourse,
    exerciseCatalog,
    authorStartWeights,
    activeTab,
    setActiveTab,
    doneKeys,
    setDoneKeys,
    currentIndex,
    setCurrentIndex,
    weightRules,
    setWeightRules,
    manualSetWeights,
    setManualSetWeights,
    selectedExerciseId,
    setSelectedExerciseId,
    selectedWeek,
    setSelectedWeek,
    selectedSession,
    setSelectedSession,
    compactMode,
    setCompactMode,
    history,
    setHistory,
    overrideStepKey,
    setOverrideStepKey,
    reviewWorkoutKey,
    setReviewWorkoutKey,
    cycleNumber,
    setCycleNumber,
    cycleStartWeights,
    setCycleStartWeights,
    cycleHistory,
    setCycleHistory,
    hydrated,
    setHydrated,
    doneSet,
    actualCurrentIndex,
    overrideIndex,
    displayIndex,
    current,
    completedCount,
    totalCount,
    progress,
    currentWeight,
    filteredFlat,
    workoutGroups,
    groupedExercises,
    doneInCurrentSession,
    totalInCurrentSession,
    currentSessionProgress,
    nextStepsPreview,
    markCurrentDone,
    chooseExerciseStep,
    undoLastDone,
    adjustCurrentWeight,
    jumpToStep,
    resetAll,
    archiveCurrentCycle,
    clearCurrentCycleProgress,
    startNextCycle,
    requestStartNextCycle,
    switchToCycle,
    moveToAdjacentStep,
    selectedExercise,
    isOverrideActive,
    reviewWorkoutMeta,
    reviewWorkoutSteps,
    reviewWorkoutDone,
    reviewWorkoutCompleted,
    openWorkoutReview,
    returnToCurrentWorkout,
    activateReviewedWorkout
  };
}

export type TrainingState = ReturnType<typeof useTrainingState>;

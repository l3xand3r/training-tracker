'use client'

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  RotateCcw,
  Scale,
  Settings2,
  Trophy,
  Flame,
  Target,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Moon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const STORAGE_KEY = "training-tracker-v3";

type TabKey = "now" | "plan" | "weights" | "progress";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

type WorkoutSet = {
  reps: string;
  weight: number | null;
};

type ExerciseItem = {
  id: string;
  name: string;
  note: string;
  pair: string;
  sets: WorkoutSet[];
};

type SessionItem = {
  number: number;
  title: string;
  status: "active" | "rest";
  exercises: ExerciseItem[];
};

type WeekItem = {
  week: number;
  sessions: SessionItem[];
};

type FlatStep = {
  key: string;
  week: number;
  session: number;
  sessionTitle: string;
  exerciseId: string;
  exerciseName: string;
  note: string;
  pair: string;
  exerciseIndex: number;
  setIndex: number;
  reps: string;
  defaultWeight: number | null;
};

function exercise(
  name: string,
  sets: WorkoutSet[],
  options: Partial<ExerciseItem> = {}
): ExerciseItem {
  return {
    id: options.id || slugify(name),
    name,
    note: options.note || "",
    pair: options.pair || "",
    sets,
  };
}

function set(reps: string, weight: number | null = null): WorkoutSet {
  return { reps, weight };
}

const T1A = (
  b: WorkoutSet[],
  row: WorkoutSet[],
  rdl: WorkoutSet[],
  push: WorkoutSet[],
  row2: WorkoutSet[],
  shoulder: WorkoutSet[],
  tri: WorkoutSet[],
  absLast: WorkoutSet[],
  back: WorkoutSet[],
  options: { includeTriceps?: boolean; absNote?: string } = {}
): ExerciseItem[] => [
  exercise("Болгарский выпад", b, { note: "Одна гантель", pair: "Первая пара" }),
  exercise("Тяга гантели к низу живота", row, { pair: "Первая пара" }),
  exercise("Румынская", rdl, { pair: "Вторая пара" }),
  exercise("Отжимания", push, { pair: "Вторая пара" }),
  exercise("Тяга к груди", row2, {
    id: "tyaga-k-grudi",
    note: "Резинки или гантель, нагрузка подбирается индивидуально",
    pair: "Третья пара",
  }),
  exercise("Махи на плечи", shoulder, { pair: "Третья пара" }),
  ...(options.includeTriceps === false
    ? []
    : [exercise("Трицепс отжимания", tri, { pair: "Четвертая пара" })]),
  exercise("Пресс", absLast, {
    pair: "Четвертая пара",
    note: options.absNote || "Повторения с ? выполняются по самочувствию",
  }),
  exercise("Поясница", back, {
    id: "poyasnitsa",
    note: "Финальное упражнение на поясницу",
    pair: "Четвертая пара",
  }),
];

const T2A = (
  plie: WorkoutSet[],
  pullover: WorkoutSet[],
  split: WorkoutSet[],
  push: WorkoutSet[],
  press: WorkoutSet[],
  absLast: WorkoutSet[],
  back: WorkoutSet[],
  options: { pulloverNote?: string; splitNote?: string; absNote?: string } = {}
): ExerciseItem[] => [
  exercise("Присед плие", plie, { pair: "Первая пара" }),
  exercise("Пуловер", pullover, {
    pair: "Первая пара",
    note: options.pulloverNote || "Вес подбирается индивидуально",
  }),
  exercise("Сплит выпад / болгарский выпад", split, {
    id: "split-ili-bolgarskiy-vypad",
    pair: "Вторая пара",
    note: options.splitNote || "Если болгарские — с двумя гантелями",
  }),
  exercise("Отжимания", push, { pair: "Вторая пара" }),
  exercise("Жим на плечи", press, { pair: "Третья пара" }),
  exercise("Пресс", absLast, {
    pair: "Третья пара",
    note: options.absNote || "Повторения с ? выполняются по самочувствию",
  }),
  exercise("Поясница", back, {
    id: "poyasnitsa",
    note: "Финальное упражнение на поясницу",
    pair: "Третья пара",
  }),
];

const COURSE: WeekItem[] = [
  {
    week: 1,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("13", 5), set("13", 5), set("13", 5)],
          [set("12", 3), set("14", 6), set("14", 6), set("14", 6)],
          [set("12", 5), set("13", 10), set("13", 10), set("13", 10)],
          [set("5"), set("11"), set("12"), set("12")],
          [set("12", 5), set("12", 5)],
          [set("12", 2), set("10", 4), set("10", 4)],
          [set("5"), set("8")],
          [set("10"), set("?"), set("5")],
          [set("10", 0), set("12", 2), set("12", 2), set("12", 2)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("10", 12), set("10", 12), set("10", 12)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("13", 5), set("13", 5), set("13", 5)],
          [set("5"), set("11"), set("12"), set("12")],
          [set("12", 2), set("12", 4), set("12", 4)],
          [set("10"), set("?"), set("5")],
          [set("10", 0), set("12", 2), set("12", 2), set("12", 2)]
        ),
      },
    ],
  },
  {
    week: 2,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("15", 5), set("15", 5), set("15", 5)],
          [set("12", 3), set("15", 6), set("15", 6), set("15", 6)],
          [set("12", 5), set("15", 10), set("15", 10), set("15", 10)],
          [set("6"), set("12"), set("12"), set("12")],
          [set("12", 5), set("14", 5)],
          [set("12", 2), set("12", 4), set("12", 4)],
          [set("5"), set("10")],
          [set("10"), set("?"), set("6")],
          [set("10", 0), set("8", 3), set("8", 3), set("8", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("12", 12), set("12", 12), set("12", 12)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("15", 5), set("15", 5), set("15", 5)],
          [set("6"), set("12"), set("12"), set("12")],
          [set("12", 2), set("15", 4), set("15", 4)],
          [set("10"), set("?"), set("6")],
          [set("10", 0), set("8", 3), set("8", 3), set("8", 3)]
        ),
      },
    ],
  },
  {
    week: 3,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 7), set("12", 7), set("12", 7)],
          [set("12", 3), set("15", 6), set("15", 6), set("15", 6)],
          [set("12", 5), set("10", 10), set("10", 12), set("10", 12), set("10", 12)],
          [set("6"), set("12"), set("13"), set("13")],
          [set("12", 5), set("15", 5)],
          [set("12", 2), set("14", 4), set("14", 4)],
          [set("5"), set("12")],
          [set("10"), set("?"), set("7")],
          [set("10", 0), set("9", 3), set("9", 3), set("9", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("14", 12), set("14", 12), set("14", 12)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 7), set("12", 7), set("12", 7)],
          [set("6"), set("12"), set("13"), set("13")],
          [set("12", 2), set("12", 5), set("12", 5)],
          [set("10"), set("?"), set("7")],
          [set("10", 0), set("9", 3), set("9", 3), set("9", 3)]
        ),
      },
    ],
  },
  {
    week: 4,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("14", 7), set("14", 7), set("14", 7)],
          [set("12", 3), set("10", 8), set("10", 8), set("10", 8)],
          [set("12", 5), set("10", 10), set("12", 12), set("12", 12), set("12", 12)],
          [set("6"), set("12"), set("14"), set("14")],
          [set("12", 5), set("15", 5), set("15", 5)],
          [set("12", 2), set("15", 4), set("15", 4)],
          [set("5"), set("14")],
          [set("10"), set("?"), set("8")],
          [set("10", 0), set("10", 3), set("10", 3), set("10", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("10", 14), set("10", 14), set("10", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("14", 7), set("14", 7), set("14", 7)],
          [set("6"), set("12"), set("14"), set("14")],
          [set("12", 3), set("14", 5), set("14", 5)],
          [set("10"), set("?"), set("8")],
          [set("10", 0), set("10", 3), set("10", 3), set("10", 3)]
        ),
      },
    ],
  },
  {
    week: 5,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("10", 9), set("10", 9), set("10", 9)],
          [set("12", 3), set("12", 8), set("12", 8), set("12", 8)],
          [set("12", 5), set("10", 10), set("13", 12), set("13", 12), set("13", 12)],
          [set("6"), set("12"), set("15"), set("15")],
          [set("10", 5), set("10", 7), set("10", 7)],
          [set("12", 2), set("12", 5), set("12", 5)],
          [set("5"), set("15")],
          [set("10"), set("?"), set("9")],
          [set("10", 0), set("11", 3), set("11", 3), set("11", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("12", 14), set("12", 14), set("12", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("10", 9), set("10", 9), set("10", 9)],
          [set("6"), set("12"), set("15"), set("15")],
          [set("12", 3), set("11", 6), set("11", 6)],
          [set("10"), set("?"), set("9")],
          [set("10", 0), set("11", 3), set("11", 3), set("11", 3)]
        ),
      },
    ],
  },
  {
    week: 6,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("12", 3), set("14", 8), set("14", 8), set("14", 8)],
          [set("12", 5), set("10", 10), set("14", 12), set("14", 12), set("14", 12)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("10", 5), set("12", 7), set("12", 7)],
          [set("12", 2), set("13", 5), set("13", 5)],
          [set("7 с колен"), set("5 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("13", 14), set("13", 14), set("13", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("12", 3), set("13", 6), set("13", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)]
        ),
      },
    ],
  },
  {
    week: 7,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "rest",
        exercises: [],
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("9", 8), set("9", 8), set("9", 8)],
          [set("12", 3), set("12", 7), set("12", 7), set("12", 7)],
          [set("12", 5), set("10", 10), set("12", 10), set("12", 10)],
          [set("6"), set("12"), set("12"), set("12")],
          [set("10", 5), set("10", 6), set("10", 6)],
          [set("12", 2), set("13", 5), set("13", 5)],
          [],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)],
          { includeTriceps: false }
        ),
      },
    ],
  },
  {
    week: 8,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("13", 14), set("13", 14), set("13", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("12", 3), set("13", 6), set("13", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)],
          { pulloverNote: "Если с резинками никак — дублируйте тягу к груди из другой тренировки" }
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("12", 3), set("14", 8), set("14", 8), set("14", 8)],
          [set("12", 5), set("10", 10), set("14", 12), set("14", 12), set("14", 12)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("10", 5), set("12", 7), set("12", 7)],
          [set("12", 2), set("13", 5), set("13", 5)],
          [set("7 с колен"), set("5 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)]
        ),
      },
    ],
  },
  {
    week: 9,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("15", 14), set("15", 14), set("15", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("14", 9), set("14", 9), set("14", 9)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("3 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("9", 4), set("9", 4), set("9", 4)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("14", 9), set("14", 9), set("14", 9)],
          [set("12", 3), set("15", 8), set("15", 8), set("15", 8)],
          [set("12", 5), set("10", 10), set("10", 14), set("10", 14), set("10", 14)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("3 с прямых")],
          [set("10", 5), set("14", 7), set("14", 7)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("6 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("9", 4), set("9", 4), set("9", 4)]
        ),
      },
    ],
  },
  {
    week: 10,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 10), set("10", 16), set("10", 16), set("10", 16)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("10", 10), set("10", 10), set("10", 10)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("5 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("10", 4), set("10", 4), set("10", 4)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("10", 10), set("10", 10), set("10", 10)],
          [set("12", 4), set("11", 9), set("11", 9), set("11", 9)],
          [set("12", 5), set("10", 10), set("12", 14), set("12", 14), set("12", 14)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("5 с прямых")],
          [set("10", 5), set("15", 7), set("15", 7)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("7 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("10", 4), set("10", 4), set("10", 4)]
        ),
      },
    ],
  },
  {
    week: 11,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 10), set("10", 16), set("12", 16), set("12", 16)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("10", 10), set("12", 10), set("12", 10)],
          [set("6 с колен"), set("5 с прямых"), set("6 с прямых"), set("6 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("11", 4), set("11", 4), set("11", 4)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 10), set("12", 10), set("12", 10)],
          [set("12", 4), set("12", 9), set("12", 9), set("12", 9)],
          [set("12", 5), set("10", 10), set("12", 14), set("14", 14), set("14", 14)],
          [set("6 с колен"), set("5 с прямых"), set("6 с прямых"), set("6 с прямых")],
          [set("10", 5), set("12", 8), set("12", 8)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("8 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("11", 4), set("11", 4), set("11", 4)]
        ),
      },
    ],
  },
  {
    week: 12,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 10), set("12", 16), set("13", 16), set("13", 16)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 10), set("13", 10), set("13", 10)],
          [set("6 с колен"), set("6 с прямых"), set("7 с прямых"), set("6 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("8", 5), set("8", 5), set("8", 5)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("13", 10), set("14", 10), set("14", 10)],
          [set("12", 4), set("13", 9), set("13", 9), set("13", 9)],
          [set("12", 5), set("10", 10), set("10", 16), set("10", 16), set("10", 16)],
          [set("6 с колен"), set("6 с прямых"), set("7 с прямых"), set("6 с прямых")],
          [set("10", 5), set("13", 8), set("13", 8)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("9 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("8", 5), set("8", 5), set("8", 5)]
        ),
      },
    ],
  },
];

function buildFlatCourse(course: WeekItem[]): FlatStep[] {
  const items: FlatStep[] = [];

  course.forEach((week) => {
    week.sessions.forEach((session) => {
      if (session.status !== "active") return;

      const pairOrder: string[] = [];
      const pairMap = new Map<string, ExerciseItem[]>();

      session.exercises.forEach((ex) => {
        const pairKey = ex.pair || "Без пары";
        if (!pairMap.has(pairKey)) {
          pairMap.set(pairKey, []);
          pairOrder.push(pairKey);
        }
        pairMap.get(pairKey)!.push(ex);
      });

      pairOrder.forEach((pairKey) => {
        const pairExercises = pairMap.get(pairKey) || [];
        const maxSets = Math.max(...pairExercises.map((ex) => ex.sets.length), 0);

        for (let setIndex = 0; setIndex < maxSets; setIndex += 1) {
          pairExercises.forEach((ex, exerciseIndexInPair) => {
            const workSet = ex.sets[setIndex];
            if (!workSet) return;

            const exerciseIndexInSession = session.exercises.findIndex(
              (sessionExercise) => sessionExercise.id === ex.id
            );

            items.push({
              key: `${week.week}-${session.number}-${ex.id}-${setIndex}`,
              week: week.week,
              session: session.number,
              sessionTitle: session.title,
              exerciseId: ex.id,
              exerciseName: ex.name,
              note: ex.note,
              pair: pairKey,
              exerciseIndex:
                exerciseIndexInSession >= 0 ? exerciseIndexInSession : exerciseIndexInPair,
              setIndex,
              reps: workSet.reps,
              defaultWeight: workSet.weight,
            });
          });
        }
      });
    });
  });

  return items;
}

function getExerciseInstances(course: WeekItem[]) {
  const map: Record<string, { id: string; name: string; sets: WorkoutSet[] }> = {};
  course.forEach((week) => {
    week.sessions.forEach((session) => {
      if (session.status !== "active") return;
      session.exercises.forEach((ex) => {
        if (!map[ex.id]) map[ex.id] = { id: ex.id, name: ex.name, sets: [] };
        ex.sets.forEach((s, idx) => {
          if (!map[ex.id].sets[idx]) {
            map[ex.id].sets[idx] = { reps: s.reps, weight: s.weight };
          }
        });
      });
    });
  });
  return Object.values(map);
}

function getNextAvailableStep(flat: FlatStep[], doneSet: Set<string>, preferredIndex = 0) {
  for (let i = preferredIndex; i < flat.length; i += 1) {
    if (!doneSet.has(flat[i].key)) return i;
  }
  for (let i = 0; i < preferredIndex; i += 1) {
    if (!doneSet.has(flat[i].key)) return i;
  }
  return flat.length;
}

type WeightRule = { fromIndex: number; weight: number | null };

function getEffectiveWeight(
  flat: FlatStep[],
  stepIndex: number,
  globalOverrides: Record<string, WeightRule[]>,
  directOverrides: Record<string, number | null>
) {
  const step = flat[stepIndex];
  if (!step) return null;
  if (Object.prototype.hasOwnProperty.call(directOverrides, step.key)) {
    return directOverrides[step.key];
  }
  const ruleKey = `${step.exerciseId}::${step.setIndex}`;
  const rules = globalOverrides[ruleKey] || [];
  let weight = step.defaultWeight;
  rules.forEach((rule) => {
    if (rule.fromIndex <= stepIndex) weight = rule.weight;
  });
  return weight;
}

function formatWeight(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : `${value} кг`;
}

function getSessionLabel(week: number, session: number) {
  return `Неделя ${week} · Тренировка ${session}`;
}

const TAB_ITEMS: { key: TabKey; label: string; textClass?: string }[] = [
  { key: "now", label: "Сейчас", textClass: "text-[12px] sm:text-sm" },
  { key: "plan", label: "План", textClass: "text-[12px] sm:text-sm" },
  { key: "weights", label: "Вес", textClass: "text-[11px] sm:text-sm" },
  { key: "progress", label: "Прогресс", textClass: "text-[11px] sm:text-sm" },
];

export default function TrainingTrackerPrototype() {
  const flatCourse = useMemo(() => buildFlatCourse(COURSE), []);
  const exerciseCatalog = useMemo(() => getExerciseInstances(COURSE), []);

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setDoneKeys(parsed.doneKeys || []);
      setCurrentIndex(parsed.currentIndex || 0);
      setWeightRules(parsed.weightRules || {});
      setManualSetWeights(parsed.manualSetWeights || {});
      setSelectedExerciseId(parsed.selectedExerciseId || exerciseCatalog[0]?.id || "");
      setCompactMode(Boolean(parsed.compactMode));
      setHistory(parsed.history || []);
      setActiveTab((parsed.activeTab as TabKey) || "now");
    } catch (e) {
      console.error(e);
    }
  }, [exerciseCatalog]);

  useEffect(() => {
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
      })
    );
  }, [activeTab, doneKeys, currentIndex, weightRules, manualSetWeights, selectedExerciseId, compactMode, history]);

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
  const linearCurrent = flatCourse[actualCurrentIndex] || null;
  const displayIndex = overrideIndex >= 0 ? overrideIndex : actualCurrentIndex;
  const current = flatCourse[displayIndex] || null;

  useEffect(() => {
    if (actualCurrentIndex !== currentIndex && overrideIndex < 0) setCurrentIndex(actualCurrentIndex);
  }, [actualCurrentIndex, currentIndex, overrideIndex]);

  const completedCount = doneKeys.length;
  const totalCount = flatCourse.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentWeight = current
    ? getEffectiveWeight(flatCourse, displayIndex, weightRules, manualSetWeights)
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
  const nextStepsPreview = useMemo(() => {
    if (!linearCurrent || !current) return [];

    const pairSteps = flatCourse.filter(
      (step) =>
        step.week === linearCurrent.week &&
        step.session === linearCurrent.session &&
        step.pair === linearCurrent.pair &&
        step.exerciseId !== current.exerciseId
    );

    const firstPendingByExercise = new Map<string, FlatStep>();

    for (const step of pairSteps) {
      if (doneSet.has(step.key)) continue;
      if (!firstPendingByExercise.has(step.exerciseId)) {
        firstPendingByExercise.set(step.exerciseId, step);
      }
    }

    return Array.from(firstPendingByExercise.values());
  }, [flatCourse, linearCurrent, current, doneSet]);

  function markCurrentDone() {
    if (!current || doneSet.has(current.key)) return;
    const nextDone = [...doneKeys, current.key];
    setDoneKeys(nextDone);
    setHistory((prev) => [...prev, current.key]);
    const nextSet = new Set(nextDone);
    const nextLinearIndex = getNextAvailableStep(flatCourse, nextSet, actualCurrentIndex);
    setOverrideStepKey(null);
    setCurrentIndex(nextLinearIndex);
  }

  function chooseExerciseStep(exerciseId: string) {
    if (!current || !linearCurrent) return;
    const target = flatCourse.find(
      (step) =>
        step.week === linearCurrent.week &&
        step.session === linearCurrent.session &&
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
    const currentVal = getEffectiveWeight(flatCourse, displayIndex, weightRules, manualSetWeights);
    if (currentVal === null || currentVal === undefined) return;
    const nextWeight = Math.max(0, Number((currentVal + delta).toFixed(1)));
    const ruleKey = `${current.exerciseId}::${current.setIndex}`;
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
    setDoneKeys([]);
    setCurrentIndex(0);
    setWeightRules({});
    setManualSetWeights({});
    setHistory([]);
    setOverrideStepKey(null);
  }

  function moveToAdjacentStep(direction: number) {
    if (!flatCourse.length) return;
    const nextIndex = Math.max(0, Math.min(flatCourse.length - 1, actualCurrentIndex + direction));
    setCurrentIndex(nextIndex);
  }

  const selectedExercise = exerciseCatalog.find((e) => e.id === selectedExerciseId);
  const isOverrideActive = overrideIndex >= 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f1,_#f8fafc_30%,_#f3f0ff_65%,_#eaf6ff)] p-3 md:p-8">
      <div className="mx-auto max-w-md space-y-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[30px] border border-white/60 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    <span>12-недельный курс · iPhone view</span>
                  </div>
                  <h1 className="mt-2 text-[27px] font-semibold tracking-tight text-slate-900">
                    Training Tracker
                  </h1>
                </div>
                <Badge className="rounded-full border-0 bg-gradient-to-r from-orange-100 to-violet-100 px-3 py-1 text-slate-700">
                  {progress}%
                </Badge>
              </div>

              <div className="mt-4">
                <Progress value={progress} className="h-2 bg-slate-200/80" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-[24px] bg-gradient-to-br from-amber-50 to-orange-100/75 p-3">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <Target className="h-4 w-4" />Подходов
                  </div>
                  <div className="mt-1 font-semibold">{completedCount}/{totalCount}</div>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-fuchsia-50 to-violet-100/75 p-3">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <Flame className="h-4 w-4" />Текущая неделя
                  </div>
                  <div className="mt-1 font-semibold">{current ? current.week : "—"}</div>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-cyan-50 to-sky-100/75 p-3">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <Sparkles className="h-4 w-4" />Тренировка
                  </div>
                  <div className="mt-1 font-semibold">{current ? current.session : "—"}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 px-4 py-3 text-white">
                <div>
                  <div className="text-xs text-slate-300">Режим интерфейса</div>
                  <div className="text-sm font-medium">{compactMode ? "Компактный" : "Стандартный"}</div>
                </div>
                <Button
                  variant="secondary"
                  className="shrink-0 whitespace-nowrap rounded-2xl bg-white/95 text-slate-800 shadow-sm hover:bg-white"
                  onClick={() => setCompactMode((prev) => !prev)}
                >
                  {compactMode ? <Moon className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {compactMode ? "Обычный" : "Компактный"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="rounded-[26px] border border-white/70 bg-white/80 p-1 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-4 gap-1">
            {TAB_ITEMS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "h-11 rounded-[22px] px-2 text-center font-medium transition-all",
                    tab.textClass || "text-sm",
                    isActive
                      ? "bg-white text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.10)]"
                      : "bg-transparent text-slate-600",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "now" && (
          <div className="space-y-4">
            <Card className="rounded-[30px] border border-white/60 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <CardHeader className={compactMode ? "pb-1" : "pb-2"}>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Dumbbell className="h-5 w-5" />
                  {current ? current.exerciseName : "Курс завершён"}
                </CardTitle>
                {current ? (
                  <div className="text-sm text-slate-500">{getSessionLabel(current.week, current.session)} · {current.pair}</div>
                ) : (
                  <div className="text-sm text-slate-500">Все запланированные подходы отмечены как выполненные</div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {current ? (
                  <>
                    {current.note ? (
                      <div className="rounded-[22px] bg-white/82 p-4 ring-1 ring-slate-200/80">
                        <div className="text-sm text-slate-800">{current.note}</div>
                      </div>
                    ) : null}

                    {isOverrideActive ? (
                      <div className="rounded-[22px] bg-amber-50 p-4 ring-1 ring-amber-200/70">
                        <div className="text-sm font-medium text-amber-900">Выбран внеплановый подход</div>
                        <div className="mt-1 text-xs text-amber-800">
                          После выполнения этого подхода приложение вернётся к обычной линейной очереди тренировки.
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[26px] bg-[linear-gradient(135deg,#fb923c_0%,#f472b6_48%,#8b5cf6_100%)] p-4 text-white shadow-[0_14px_34px_rgba(244,114,182,0.22)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-slate-100">Прогресс текущей тренировки</div>
                          <div className="mt-1 text-lg font-semibold">
                            {doneInCurrentSession}/{totalInCurrentSession} подходов
                          </div>
                        </div>
                        <Badge className="rounded-full bg-white/15 text-white">{currentSessionProgress}%</Badge>
                      </div>
                      <div className="mt-3">
                        <Progress value={currentSessionProgress} className="h-2 bg-white/20" />
                      </div>
                    </div>

                    <div className={`grid ${compactMode ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                      <div className="rounded-[24px] bg-white/82 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="text-xs text-slate-500">Подход</div>
                        <div className="mt-1 text-2xl font-semibold">{current.setIndex + 1}</div>
                      </div>
                      <div className="rounded-[24px] bg-white/82 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="text-xs text-slate-500">Повторения</div>
                        <div className="mt-1 text-2xl font-semibold">{current.reps}</div>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-white/82 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Scale className="h-4 w-4" /> Вес
                      </div>
                      <div className="mt-1 text-2xl font-semibold">{formatWeight(currentWeight)}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        Изменение здесь становится новым базовым значением для всех будущих таких же упражнений в этом же номере подхода.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 items-stretch">
                        <Button
                          className="rounded-[18px] border border-slate-200/80 bg-white/80 px-2 hover:bg-white"
                          size="sm"
                          variant="outline"
                          onClick={() => moveToAdjacentStep(-1)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          className="rounded-[18px] border border-slate-200/80 bg-white/80 px-2 text-xs hover:bg-white"
                          size="sm"
                          variant="outline"
                          onClick={() => adjustCurrentWeight(-0.5)}
                          disabled={currentWeight === null}
                        >
                          -0.5
                        </Button>
                        <Button
                          className="rounded-[18px] border border-slate-200/80 bg-white/80 px-2 text-xs hover:bg-white"
                          size="sm"
                          variant="outline"
                          onClick={() => adjustCurrentWeight(0.5)}
                          disabled={currentWeight === null}
                        >
                          +0.5
                        </Button>
                        <Button
                          className="rounded-[18px] border border-slate-200/80 bg-white/80 px-2 hover:bg-white"
                          size="sm"
                          variant="outline"
                          onClick={() => moveToAdjacentStep(1)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="w-full rounded-[20px] border border-slate-200/80 bg-white/85 py-3 text-slate-900 shadow-sm hover:bg-white"
                          variant="outline"
                          onClick={undoLastDone}
                          disabled={history.length === 0}
                        >
                          Назад
                        </Button>
                        <Button
                          className="w-full rounded-[20px] bg-slate-900 py-3 text-white shadow-sm hover:bg-slate-800"
                          onClick={markCurrentDone}
                        >
                          <Check className="mr-2 h-4 w-4 shrink-0" />Готово
                        </Button>
                      </div>
                    </div>

                    {nextStepsPreview.length > 0 ? (
                      <div className="rounded-[24px] bg-white/70 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-2 text-sm font-medium text-slate-700">Дальше по текущей паре</div>
                        <div className="space-y-2">
                          {nextStepsPreview.map((step) => {
                            const previewIndex = flatCourse.findIndex((x) => x.key === step.key);
                            return (
                              <button
                                key={step.key}
                                type="button"
                                onClick={() => setOverrideStepKey(step.key)}
                                className="w-full rounded-[20px] bg-white px-3 py-2 text-left ring-1 ring-slate-200/60 transition hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-medium">{step.exerciseName}</div>
                                    <div className="text-xs text-slate-500">
                                      Подход {step.setIndex + 1} · {step.reps} повторений
                                    </div>
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {formatWeight(
                                      getEffectiveWeight(flatCourse, previewIndex, weightRules, manualSetWeights)
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-[22px] bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200/60">
                      Курс полностью завершён. Прогресс и изменения веса сохранены локально на устройстве.
                    </div>
                    <Button className="w-full rounded-2xl" onClick={resetAll}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Сбросить и начать заново
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {groupedExercises.length > 0 ? (
              <Card className="rounded-[30px] border border-white/60 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Текущая тренировка</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {groupedExercises.map((ex) => {
                    const steps = flatCourse.filter(
                      (x) => x.week === current?.week && x.session === current?.session && x.exerciseId === ex.id
                    );
                    const completed = steps.filter((x) => doneSet.has(x.key)).length;
                    const isCurrentExercise = steps.some((x) => x.key === current?.key);
                    const nextAvailableStep = steps.find((x) => !doneSet.has(x.key));
                    const canChoose = Boolean(nextAvailableStep) && !isCurrentExercise;
                    return (
                      <div
                        key={`${current?.week}-${current?.session}-${ex.id}`}
                        className="rounded-[24px] bg-white/72 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">{ex.name}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {completed} из {steps.length} подходов
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isCurrentExercise ? "default" : completed === steps.length ? "secondary" : "outline"}
                            className="rounded-full px-4"
                            onClick={() => chooseExerciseStep(ex.id)}
                            disabled={!canChoose}
                          >
                            {isCurrentExercise ? "Сейчас" : completed === steps.length ? "Готово" : isInActivePair ? "Выбрать" : "Позже"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        {activeTab === "plan" && (
          <div className="space-y-4">
            <Card className="rounded-[30px] border border-white/60 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Весь курс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={selectedWeek}
                    onValueChange={(value) => setSelectedWeek(value ?? "all")}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Неделя" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все недели</SelectItem>
                      {COURSE.map((w) => (
                        <SelectItem key={w.week} value={String(w.week)}>
                          Неделя {w.week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedSession}
                    onValueChange={(value) => setSelectedSession(value ?? "all")}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Тренировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все тренировки</SelectItem>
                      <SelectItem value="1">Тренировка 1</SelectItem>
                      <SelectItem value="2">Тренировка 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[420px] pr-3">
                  <div className="space-y-3">
                    {filteredFlat.map((item) => {
                      const idx = flatCourse.findIndex((x) => x.key === item.key);
                      const done = doneSet.has(item.key);
                      const active = current?.key === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => jumpToStep(item.key)}
                          className={`w-full rounded-2xl p-4 text-left transition ${
                            active ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm opacity-70">
                                Неделя {item.week} · Тренировка {item.session}
                              </div>
                              <div className="mt-1 font-medium">{item.exerciseName}</div>
                              <div className="mt-1 text-sm opacity-70">
                                Подход {item.setIndex + 1} · Повторения {item.reps} · Вес{" "}
                                {formatWeight(
                                  getEffectiveWeight(flatCourse, idx, weightRules, manualSetWeights)
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={done ? "secondary" : active ? "default" : "outline"}
                                className="rounded-full"
                              >
                                {done ? "Готово" : active ? "Сейчас" : ""}
                              </Badge>
                              <ChevronRight
                                className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "weights" && (
          <div className="space-y-4">
            <Card className="rounded-[30px] border border-white/60 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Settings2 className="h-5 w-5" /> Вес по типам упражнений
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {exerciseCatalog.map((exerciseItem) => (
                    <Button
                      key={exerciseItem.id}
                      variant={selectedExerciseId === exerciseItem.id ? "default" : "outline"}
                      className="h-auto justify-start rounded-[22px] border border-slate-200/80 bg-white/80 py-3 text-left leading-tight whitespace-normal hover:bg-white"
                      onClick={() => setSelectedExerciseId(exerciseItem.id)}
                    >
                      {exerciseItem.name}
                    </Button>
                  ))}
                </div>

                {selectedExercise ? (
                  <div className="space-y-3">
                    {selectedExercise.sets.map((s, idx) => {
                      const key = `${selectedExercise.id}::${idx}`;
                      const firstRelevantIndex = flatCourse.findIndex(
                        (item) => item.exerciseId === selectedExercise.id && item.setIndex === idx
                      );
                      const effective =
                        firstRelevantIndex >= 0
                          ? getEffectiveWeight(flatCourse, firstRelevantIndex, weightRules, manualSetWeights)
                          : s.weight;
                      return (
                        <div key={key} className="rounded-[22px] bg-white/78 p-4 ring-1 ring-slate-200/70">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="font-medium">Подход {idx + 1}</div>
                            <div className="text-sm text-slate-500">Базовые повторения: {s.reps}</div>
                          </div>
                          <Input
                            type="number"
                            step="0.5"
                            value={effective ?? ""}
                            placeholder="Без веса"
                            onChange={(e) => {
                              const raw = e.target.value;
                              const next = raw === "" ? null : Number(raw);
                              setWeightRules((prev) => ({
                                ...prev,
                                [key]: [{ fromIndex: 0, weight: next }],
                              }));
                            }}
                            className="rounded-[18px] border-slate-200/80 bg-white"
                          />
                          <div className="mt-2 text-xs text-slate-500">
                            Здесь можно задать новое глобальное стартовое значение для этого упражнения и номера подхода.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-4">
            <Card className="rounded-[30px] border border-white/60 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Trophy className="h-5 w-5" /> Ход курса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workoutGroups.map((week) => (
                  <div key={week.week} className="space-y-2">
                    <div className="font-medium">Неделя {week.week}</div>
                    {week.sessions.map((session) => (
                      <div key={session.key} className="rounded-[24px] bg-white/72 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
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
                              ? "Готово"
                              : session.status === "current"
                              ? "Сейчас"
                              : "Дальше"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <Button
                  className="h-auto w-full rounded-3xl py-3 text-left whitespace-normal sm:text-center"
                  variant="outline"
                  onClick={resetAll}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Полный сброс прогресса и веса
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
